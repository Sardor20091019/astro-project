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
    
    // 1. OTP CREDENTIALS PROVIDER
    CredentialsProvider({
      id: "otp",
      name: "One-Time Password",
      credentials: {
        email: { type: "text" },
        code: { type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.code) return null;

        const formattedEmail = credentials.email.toLowerCase().trim();
        const cleanCode = credentials.code.trim();

        // Query custom 'otpToken' table
        const activeOtp = await prisma.otpToken.findFirst({
          where: {
            email: formattedEmail,
            token: cleanCode,
            expires: { gte: new Date() },
          },
        });

        if (!activeOtp) {
          throw new Error("Invalid or expired verification pin code.");
        }

        // Remove token
        await prisma.otpToken.delete({
          where: { id: activeOtp.id },
        }).catch((err) => console.error("Token purge failure:", err));

        // Fetch or create user
        let user = await prisma.user.findUnique({
          where: { email: formattedEmail },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { 
              email: formattedEmail,
              role: "USER",
            },
          });
        }

        return { id: user.id, email: user.email, name: user.name } as User;
      },
    }),

    // 2. TELEGRAM CREDENTIALS PROVIDER
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: { type: "text" },
        first_name: { type: "text" },
        username: { type: "text" },
        photo_url: { type: "text" },
        auth_date: { type: "text" },
        hash: { type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.hash) return null;

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN environment variable is missing.");

        const { hash, ...userData } = credentials;

        // Strip NextAuth internal tracking fields before hashing
        const nextAuthInternalKeys = ["csrfToken", "callbackUrl", "json"];
        const dataCheckString = Object.keys(userData)
          .filter((key) => userData[key as keyof typeof userData] && !nextAuthInternalKeys.includes(key))
          .sort()
          .map((key) => `${key}=${userData[key as keyof typeof userData]}`)
          .join("\n");

        const secretKey = crypto.createHash("sha256").update(botToken).digest();
        const generatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

        if (generatedHash !== hash) {
          throw new Error("Invalid Telegram signature.");
        }

        // Fetch or create Telegram user
        let user = await prisma.user.findUnique({
          where: { telegramId: credentials.id },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              telegramId: credentials.id,
              telegramUsername: credentials.username || null,
              name: credentials.first_name || "Telegram User",
              image: credentials.photo_url || null,
              role: "USER",
            },
          });
        }

        return { id: user.id, name: user.name, image: user.image } as User;
      },
    }),
  ],
  
  secret: process.env.NEXTAUTH_SECRET,
  
  // 🔥 CRITICAL FOR VERCEL PRODUCTION: Cross-subdomain secure cookie policy
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Using "." prefix allows auth state to persist on both "astrospectrum.uz" and "www.astrospectrum.uz"
        domain: process.env.NODE_ENV === "production" ? ".astrospectrum.uz" : "localhost", 
      },
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email ?? "" },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
              },
            });
          }
          token.id = dbUser.id;
        } else {
          token.id = user.id;
        }
      } 
      
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) token.id = dbUser.id;
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}