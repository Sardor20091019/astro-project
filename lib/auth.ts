import { NextAuthOptions, User, getServerSession, DefaultSession, DefaultUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";
import { db } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    CredentialsProvider({
      id: "otp",
      name: "One-Time Password",
      credentials: { email: { type: "text" }, code: { type: "text" } },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.code) return null;

        const formattedEmail = credentials.email.toLowerCase().trim();
        const inputToken = credentials.code.trim();

        const tokenRecord = await db
          .selectFrom("otptoken")
          .selectAll()
          .where("email", "=", formattedEmail)
          .orderBy("createdAt", "desc")
          .executeTakeFirst();

        if (!tokenRecord) throw new Error("No active code found.");
        if (new Date() > tokenRecord.expires) {
          await db
            .deleteFrom("otptoken")
            .where("id", "=", tokenRecord.id)
            .execute();
          throw new Error("Code expired.");
        }

        const rawInput = inputToken.trim();
        const inputHashed = crypto.createHash("sha256").update(rawInput).digest("hex");
        const isHashed = tokenRecord.token.length === 64;
        const targetExpected = isHashed ? inputHashed : rawInput;

        const isMatch =
          typeof tokenRecord.token === "string" &&
          Buffer.byteLength(tokenRecord.token) === Buffer.byteLength(targetExpected) &&
          crypto.timingSafeEqual(Buffer.from(tokenRecord.token), Buffer.from(targetExpected));

        if (!isMatch) {
          const newCount = (tokenRecord.failedAttempts ?? 0) + 1;
          
          if (newCount >= 5) {
            await db
              .deleteFrom("otptoken")
              .where("id", "=", tokenRecord.id)
              .execute();
            throw new Error("Too many attempts. Code invalidated.");
          }

          await db
            .updateTable("otptoken")
            .set({ failedAttempts: newCount })
            .where("id", "=", tokenRecord.id)
            .execute();

          throw new Error(`Invalid code. (${5 - newCount} attempts remaining)`);
        }

        await db
          .deleteFrom("otptoken")
          .where("id", "=", tokenRecord.id)
          .execute();

        let user = await db
          .selectFrom("User")
          .selectAll()
          .where("email", "=", formattedEmail)
          .executeTakeFirst();

        if (!user) {
          user = await db
            .insertInto("User")
            .values({
              id: crypto.randomUUID(),
              email: formattedEmail,
              role: "USER",
            })
            .returningAll()
            .executeTakeFirstOrThrow();
        }

        return { id: user.id, email: user.email!, name: user.name ?? undefined } as User;
      },
    }),

    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: { 
        id: { type: "text" }, 
        first_name: { type: "text" }, 
        username: { type: "text" }, 
        photo_url: { type: "text" }, 
        auth_date: { type: "text" }, 
        hash: { type: "text" } 
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.hash) return null;

        const authDate = Number(credentials.auth_date);
        const nowSec = Math.floor(Date.now() / 1000);
        if (isNaN(authDate) || Math.abs(nowSec - authDate) > 86400) {
          throw new Error("Telegram authentication data expired.");
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is missing.");

        const fields = ["id", "first_name", "username", "photo_url", "auth_date"];
        const dataCheckString = fields
          .map((key) => ({ key, value: credentials[key as keyof typeof credentials] }))
          .filter((item): item is { key: string; value: string } => Boolean(item.value))
          .sort((a, b) => a.key.localeCompare(b.key))
          .map((item) => `${item.key}=${item.value}`)
          .join("\n");

        const secretKey = crypto.createHash("sha256").update(botToken).digest();
        const generatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

        const genHashBuf = Buffer.from(generatedHash);
        const credHashBuf = Buffer.from(credentials.hash);
        if (
          genHashBuf.length !== credHashBuf.length ||
          !crypto.timingSafeEqual(genHashBuf, credHashBuf)
        ) {
          throw new Error("Invalid Telegram signature.");
        }

        let user = await db
          .selectFrom("User")
          .selectAll()
          .where("telegramId", "=", credentials.id)
          .executeTakeFirst();

        if (!user) {
          user = await db
            .insertInto("User")
            .values({
              id: crypto.randomUUID(),
              telegramId: credentials.id,
              telegramUsername: credentials.username || null,
              name: credentials.first_name || null,
              image: credentials.photo_url || null,
              role: "USER",
            })
            .returningAll()
            .executeTakeFirstOrThrow();
        }
        return {
          id: user.id,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
        } as User;
      },
    }),
  ],
  
  secret: process.env.NEXTAUTH_SECRET,
  
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  pages: { signIn: "/login", error: "/login" },

  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && token.email) {
        const dbUser = await db
          .insertInto("User")
          .values({
            id: crypto.randomUUID(),
            email: token.email,
            name: token.name ?? null,
            image: token.picture ?? null,
            role: "USER",
          })
          .onConflict((oc) =>
            oc.column("email").doUpdateSet({
              name: token.name ?? undefined,
              image: token.picture ?? undefined,
            })
          )
          .returning(["id", "role"])
          .executeTakeFirstOrThrow();

        token.id = dbUser.id;
        token.role = dbUser.role;
        return token;
      }

      if (user) {
        const dbUser = await db
          .selectFrom("User")
          .select("role")
          .where("id", "=", user.id)
          .executeTakeFirst();
        token.id = user.id;
        token.role = dbUser?.role || (user as any).role || "USER";
        return token;
      }

      const lookupId = token.id || token.sub;
      if (lookupId || token.email) {
        const dbUser = await db
          .selectFrom("User")
          .select(["id", "role"])
          .where((eb) => {
            const ors = [];
            if (lookupId) ors.push(eb("id", "=", lookupId));
            if (token.email) ors.push(eb("email", "=", token.email));
            return ors.length > 0 ? eb.or(ors) : eb.lit(false);
          })
          .executeTakeFirst();

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id;
        }
        if (typeof token.role === "string") {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}