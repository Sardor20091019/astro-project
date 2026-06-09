import { NextAuthOptions, User, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

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

    const tokenRecord = await prisma.otpToken.findFirst({
      where: { email: formattedEmail },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, token: true, expires: true, createdAt: true, failedAttempts: true },
    });


    if (!tokenRecord) throw new Error("No active code found.");
    if (new Date() > tokenRecord.expires) {
      await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
      throw new Error("Code expired.");
    }

    if (tokenRecord.token !== inputToken) {

      const newCount = (tokenRecord.failedAttempts ?? 0) + 1;
      
      if (newCount >= 5) {
        await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
        throw new Error("Too many attempts. Code invalidated.");
      }

      await prisma.otpToken.update({
        where: { id: tokenRecord.id },
        data: { failedAttempts: newCount },
      });

      throw new Error(`Invalid code. (${5 - newCount} attempts remaining)`);
    }


    await prisma.otpToken.delete({ where: { id: tokenRecord.id } });

    let user = await prisma.user.findUnique({ where: { email: formattedEmail } });
    if (!user) {
      user = await prisma.user.create({ data: { email: formattedEmail, role: "USER" } });
    }

    return { id: user.id, email: user.email, name: user.name } as User;
  },
}),

    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: { id: { type: "text" }, first_name: { type: "text" }, username: { type: "text" }, photo_url: { type: "text" }, auth_date: { type: "text" }, hash: { type: "text" } },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.hash) return null;

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is missing.");

        const fields = ["id", "first_name", "username", "photo_url", "auth_date"];
        const dataCheckString = fields
          .map((key) => ({ key, value: credentials[key as keyof typeof credentials] }))
          .filter((item) => item.value)
          .sort((a, b) => a.key.localeCompare(b.key))
          .map((item) => `${item.key}=${item.value}`)
          .join("\n");

        const secretKey = crypto.createHash("sha256").update(botToken).digest();
        const generatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

        if (generatedHash !== credentials.hash) throw new Error("Invalid Telegram signature.");

        let user = await prisma.user.findUnique({ where: { telegramId: credentials.id } });
        if (!user) {
          user = await prisma.user.create({
            data: { telegramId: credentials.id, telegramUsername: credentials.username, name: credentials.first_name, image: credentials.photo_url, role: "USER" },
          });
        }
        return { id: user.id, name: user.name, image: user.image } as User;
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
        const dbUser = await prisma.user.upsert({
          where: { email: token.email },
          update: {
            name: token.name ?? undefined,
            image: token.picture ?? undefined,
          },
          create: {
            email: token.email,
            name: token.name ?? undefined,
            image: token.picture ?? undefined,
            role: "USER",
          },
          select: { id: true },
        });

        token.id = dbUser.id;
        return token;
      }

      if (user?.id) {
        token.id = user.id;
        return token;
      }

      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
