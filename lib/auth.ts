import { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto"; // Native Node module to safely verify Telegram signatures

export const authOptions: NextAuthOptions = {
  providers: [
    // 1. YOUR WORKING OTP PROVIDER (Keep your exact current authorize logic here)
    CredentialsProvider({
      id: "credentials",
      name: "OTP",
      credentials: {
        email: { type: "text" },
        otp: { type: "text" },
        token: { type: "text" },
      },
      async authorize(credentials, req) {
        // Keep your existing database check for the OTP token here
        if (!credentials?.email) return null;
        // Example return (replace with your actual database user object return):
        return { id: "user-id", email: credentials.email };
      },
    }),

    // 2. GOOGLE PROVIDER (Must pass explicit environmental variables)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 3. TELEGRAM PROVIDER (Custom implementation for the Telegram Widget)
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: { type: "text" },
        first_name: { type: "text" },
        username: { type: "text" },
        auth_date: { type: "text" },
        hash: { type: "text" },
      },
      async authorize(credentials, req): Promise<User | null> {
        if (!credentials?.hash || !process.env.TELEGRAM_BOT_TOKEN) return null;

        const { hash } = credentials;

        // Official fields that Telegram transmits. Anything else is ignored.
        const telegramFields = ["id", "first_name", "last_name", "username", "photo_url", "auth_date"];

        // Filter data entries to eliminate NextAuth's background parameters (csrfToken, callbackUrl)
        const dataCheckArr = Object.entries(credentials)
          .filter(([key]) => telegramFields.includes(key))
          .map(([key, value]) => `${key}=${value}`)
          .sort();
          
        const dataCheckString = dataCheckArr.join("\n");

        // Execute cryptographic validation against the bot token
        const secretKey = crypto
          .createHash("sha256")
          .update(process.env.TELEGRAM_BOT_TOKEN)
          .digest();
          
        const hashCheck = crypto
          .createHmac("sha256", secretKey)
          .update(dataCheckString)
          .digest("hex");

        // Reject authentication if data signatures mismatch
        if (hashCheck !== hash) {
          throw new Error("Telegram authentication signature mismatch.");
        }

        // Successfully return authorized Telegram user details matching NextAuth's User type schema
        return {
          id: credentials.id,
          name: credentials.first_name,
          image: credentials.username ? `https://t.me/${credentials.username}` : undefined,
        } as User;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Locks NextAuth to your custom styled UI
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    },
  },
};

// Server-side context helper function
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}