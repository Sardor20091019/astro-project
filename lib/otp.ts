import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // CRITICAL: These prevent the request from "hanging" if SMTP is slow
  connectionTimeout: 5000, 
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

export async function generateAndSendOtp(email: string, ip: string) {
  const cleanEmail = email.toLowerCase().trim();
  console.log("DEBUG: Starting generateAndSendOtp for", cleanEmail);

  // 1. Rate Limit
  console.log("DEBUG: Checking rate limit...");
  const oneMinuteAgo = new Date(Date.now() - 60000);
  const recentRequestsCount = await prisma.otpToken.count({
    where: { ipAddress: ip, createdAt: { gte: oneMinuteAgo } },
  });
  console.log("DEBUG: Rate limit check passed.");

  if (recentRequestsCount >= 3) throw new Error("Too many requests.");

  // 2. Cleanup
  console.log("DEBUG: Cleaning up old tokens...");
  await prisma.otpToken.deleteMany({ where: { email: cleanEmail } });
  console.log("DEBUG: Cleanup complete.");

  // 3. Create
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 2 * 60 * 1000);
  
  console.log("DEBUG: Saving new token to DB...");
  await prisma.otpToken.create({
    data: { email: cleanEmail, token, expires, ipAddress: ip },
  });
  console.log("DEBUG: Token saved to DB.");

  // 4. Send Email
  console.log("DEBUG: Attempting to connect to SMTP...");
  try {
    await transporter.sendMail({
      from: `"Astrospectrum" <${process.env.SMTP_USER}>`,
      to: cleanEmail,
      subject: "Your Code",
      text: `Your code is ${token}`,
    });
    console.log("DEBUG: Email sent successfully!");
  } catch (error) {
    console.error("DEBUG: SMTP FAILED with error:", error);
    throw error;
  }
}