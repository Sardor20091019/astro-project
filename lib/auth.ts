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
   // Inside lib/auth.ts -> providers array
CredentialsProvider({
  id: "otp",
  name: "One-Time Password",
  credentials: {
    email: { type: "text" },
    code: { type: "text" },
  },
  async authorize(credentials): Promise<User | null> {
    if (!credentials?.email || !credentials?.code) return null;

    // Standardize casing to match database records safely
    const formattedEmail = credentials.email.toLowerCase().trim();
    const cleanCode = credentials.code.trim();

    // 🔥 FIX: Query 'otpToken' instead of 'verificationToken' to match your generator schema
    const activeOtp = await prisma.otpToken.findFirst({
      where: {
        email: formattedEmail,
        token: cleanCode,
        expires: { gte: new Date() }, // Check that token expiration time hasn't passed
      },
    });

    if (!activeOtp) {
      console.error(`OTP AUTH WARNING: No valid or unexpired OTP found for ${formattedEmail}`);
      throw new Error("Invalid or expired verification pin code.");
    }

    // Safely remove the token once used so it can't be reused maliciously
    await prisma.otpToken.delete({
      where: { id: activeOtp.id },
    }).catch((err) => console.error("Non-blocking token purge failure:", err));

    // Establish or fetch the verified user record
    let user = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { 
          email: formattedEmail,
          role: "USER", // Maps to your schema's Role enum
        },
      });
    }

    return { id: user.id, email: user.email, name: user.name } as User;
  },
}),
    // 2. OTP/EMAIL CREDENTIALS PROVIDER
    CredentialsProvider({
      id: "otp",
      name: "One-Time Password",
      credentials: {
        email: { type: "text" },
        code: { type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.code) return null;

        // Find the active verification token record for this OTP attempt
        const verificationToken = await prisma.verificationToken.findFirst({
          where: {
            identifier: credentials.email,
            token: credentials.code,
            expires: { gte: new Date() }, // Ensure token is not expired
          },
        });

        if (!verificationToken) {
          throw new Error("Invalid or expired OTP verification code.");
        }

        // Delete the token immediately after consumption so it can't be reused
        await prisma.verificationToken.delete({
          where: { id: verificationToken.id },
        }).catch(() => {});

        // Fetch or establish the database user profile record
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { email: credentials.email },
          });
        }

        return { id: user.id, email: user.email, name: user.name } as User;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  
  // FIX: Redirects all native NextAuth fallback/error screens back to your custom login view
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
          // For both Telegram and OTP credentials, authorize() passes the true internal DB CUID
          token.id = user.id;
        }
      } else if (token.id && typeof token.id === "string" && token.id.length > 25) {
        // Recovery fallback for existing sessions holding raw Google strings
        const numericCheck = /^\d+$/.test(token.id);
        if (numericCheck && token.email) {
          const matchedUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          if (matchedUser) token.id = matchedUser.id;
        }
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