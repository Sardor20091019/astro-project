import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function generateAndSendOtp(email: string) {
  const cleanEmail = email.toLowerCase().trim();
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes lifespan

  // Clean out any old remaining tokens for this email to prevent DB unique index pollution
  await prisma.otpToken.deleteMany({
    where: { email: cleanEmail },
  }).catch(() => {});

  // Write new authorization row
  await prisma.otpToken.create({
    data: {
      email: cleanEmail,
      token,
      expires,
    },
  });

  const mailOptions = {
    from: `"Astrospectrum" <${process.env.SMTP_USER}>`,
    to: cleanEmail,
    subject: "Your Astrospectrum Verification Code",
    text: `Your login code is: ${token}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: monospace; background: #0A0A0A; color: #F0EBE1; padding: 40px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(240,235,225,0.08);">
        <h2 style="color: #E8421A; font-weight: 200; letter-spacing: -0.02em;">ASTROSPECTRUM</h2>
        <p style="color: rgba(240,235,225,0.6); font-size: 13px;">Use the following verification code to access your profile matrix:</p>
        <div style="background: rgba(240,235,225,0.03); border: 1px solid rgba(232,66,26,0.3); padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 0.25em; color: #F0EBE1; margin: 24px 0;">
          ${token}
        </div>
        <p style="color: rgba(240,235,225,0.3); font-size: 10px;">This single-use security token expires in exactly 5 minutes. If you did not request this code, safely disregard this notification.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}