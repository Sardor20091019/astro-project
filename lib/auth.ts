import { NextAuthOptions, User, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
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
        const activeOtp = await prisma.otpToken.findFirst({
          where: { email: formattedEmail, token: credentials.code.trim(), expires: { gte: new Date() } },
        });

        if (!activeOtp) throw new Error("Invalid or expired verification pin code.");
        await prisma.otpToken.delete({ where: { id: activeOtp.id } }).catch(() => {});

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
        // REMOVED domain to fix production cookie rejection
      },
    },
  },

  pages: { signIn: "/login", error: "/login" },

  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the user ID to the token immediately upon login
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};