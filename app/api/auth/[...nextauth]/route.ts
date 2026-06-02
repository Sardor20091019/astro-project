/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  // Force JWT sessions so credentials login behaves perfectly with the Prisma Adapter setup
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "OTP Code", type: "text" },
      },
      async authorize(
        credentials: Record<"email" | "token", string> | undefined,
        req: any
      ): Promise<any> {
        if (!credentials?.email || !credentials?.token) return null;

        // 1. Fetch the most recent token matching this email structure
     const otpRecord = await prisma.otpToken.findFirst({
  where: {
    email: credentials.email,
    token: credentials.token,
  },
  orderBy: {
    createdAt: "desc",
  },
});
        // 2. Security checkpoints: Verification checks
        if (!otpRecord || otpRecord.expires < new Date()) {
          throw new Error("Invalid or expired verification code.");
        }

        // 3. Purge the token instantly so it can never be used again
      await prisma.otpToken.delete({
  where: { id: otpRecord.id },
});

        // 4. Find the user profile or build a new record if they are signing up
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
              role: "USER",
            },
          });
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
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
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };