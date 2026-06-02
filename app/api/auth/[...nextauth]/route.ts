/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider, { CredentialInput } from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider<Record<string, CredentialInput>>({
      id: "telegram",
      name: "Telegram",
      credentials: {} as Record<string, CredentialInput>,
      async authorize(credentials: Record<string, string> | undefined, req: any) {
        if (!credentials) return null;

        const { hash, ...data } = credentials;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) throw new Error("Bot token missing");

        // 1. Whitelist fields signed by Telegram to prevent HMAC mismatch
        const allowedFields = ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date'];
        
        const filteredData = Object.keys(data)
          .filter(key => allowedFields.includes(key))
          .sort()
          .reduce((acc: any, key) => {
            acc[key] = data[key];
            return acc;
          }, {});

        // 2. Create the exact data string for HMAC verification
        const dataCheckString = Object.keys(filteredData)
          .map((key) => `${key}=${filteredData[key]}`)
          .join("\n");

        // 3. Perform HMAC SHA256 verification
        const secret = crypto.createHash("sha256").update(botToken).digest();
        const hmac = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

        if (hmac !== hash) {
          throw new Error("Invalid authentication hash");
        }

        // 4. Database User Sync
        const user = await prisma.user.upsert({
          where: { telegramId: data.id.toString() },
          update: {
            telegramUsername: data.username,
            image: data.photo_url || null,
            name: [data.first_name, data.last_name].filter(Boolean).join(" "),
          },
          create: {
            telegramId: data.id.toString(),
            telegramUsername: data.username,
            image: data.photo_url || null,
            name: [data.first_name, data.last_name].filter(Boolean).join(" "),
            role: "USER",
          },
        });

        // 5. Return user for JWT/Session callbacks
        return { id: user.id, name: user.name, email: user.telegramUsername, role: user.role } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };