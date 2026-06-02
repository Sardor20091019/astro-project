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
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: { type: "text" },
        first_name: { type: "text" },
        username: { type: "text" },
        auth_date: { type: "text" },
        hash: { type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.hash || !process.env.TELEGRAM_BOT_TOKEN) return null;

        const { hash, ...others } = credentials;
        const secretKey = crypto.createHash("sha256").update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const dataCheckString = Object.entries(others)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${value}`)
          .sort()
          .join("\n");

        const hashCheck = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

        if (hashCheck !== hash) throw new Error("Invalid signature.");

        const user = await prisma.user.upsert({
          where: { telegramId: credentials.id },
          update: { name: credentials.first_name, telegramUsername: credentials.username },
          create: {
            telegramId: credentials.id,
            name: credentials.first_name,
            telegramUsername: credentials.username,
          },
        });

        // This returns the genuine internal CUID database ID for Telegram sign-ins
        return { id: user.id, name: user.name } as User;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      // Direct trigger on initial user sign-in event
      if (user) {
        if (account?.provider === "google") {
          // Find or create the user row in your PostgreSQL DB for Google accounts
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
          token.id = dbUser.id; // Inject the true database CUID into the JWT payload
        } else {
          // For Telegram, authorize() already handles the sync and returned the database record id
          token.id = user.id;
        }
      } else if (token.id && typeof token.id === "string" && token.id.length > 25) {
        // Fallback catch-all: If token contains an unmodified external profile ID string instead of a CUID, 
        // attempt an emergency database query recovery by current associated email profile parameters
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