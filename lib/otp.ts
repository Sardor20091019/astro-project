import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

export async function generateAndSendOtp(email: string, ip: string) {
  const cleanEmail = email.toLowerCase().trim();
  console.log("DEBUG: Starting generateAndSendOtp for", cleanEmail);


  const oneMinuteAgo = new Date(Date.now() - 60000);
  const recentRequestsCount = await prisma.otpToken.count({
    where: { ipAddress: ip, createdAt: { gte: oneMinuteAgo } },
  });

  if (recentRequestsCount >= 3) {
    throw new Error("Too many requests from this device. Please wait a minute.");
  }


  await prisma.otpToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });


  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 2 * 60 * 1000); 
  
  await prisma.otpToken.create({
    data: { email: cleanEmail, token, expires, ipAddress: ip },
  });


  try {
    await transporter.sendMail({
      from: `"Astrospectrum" <${process.env.SMTP_USER}>`,
      to: cleanEmail,
      subject: "Your Astrospectrum Verification Code",
      text: `Your login code is: ${token}. It expires in 2 minutes.`, 
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px; color: #333;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <div style="background-color: #E8421A; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase;">Astrospectrum</h1>
            </div>

            <div style="padding: 30px;">
              <h2 style="margin-top: 0; color: #1a1a1a; font-size: 18px;">Verification Required</h2>
              <p style="color: #666; font-size: 15px; line-height: 1.5;">
                Use the verification code below to access your account. This code is only valid for <strong>2 minutes</strong>.
              </p>

              <div style="margin: 30px 0; padding: 20px; background-color: #fff5f2; border: 1px dashed #E8421A; border-radius: 8px; text-align: center;">
                <span style="font-size: 36px; font-weight: bold; color: #E8421A; letter-spacing: 8px;">${token}</span>
              </div>

              <p style="color: #999; font-size: 13px; text-align: center;">
                If you did not request this code, you can safely ignore this email.
              </p>
            </div>

            <div style="padding: 20px; background-color: #f4f4f4; text-align: center; font-size: 12px; color: #888;">
              &copy; ${new Date().getFullYear()} Astrospectrum. All rights reserved.
            </div>
          </div>
        </div>
      `,
    });
    console.log("DEBUG: Email sent successfully!");
  } catch (error) {
    console.error("DEBUG: SMTP FAILED with error:", error);
    throw error;
  }
}

export async function verifyOtp(email: string, inputToken: string) {
  const cleanEmail = email.toLowerCase().trim();
  
  const tokenRecord = await prisma.otpToken.findFirst({
    where: { email: cleanEmail },
    orderBy: { createdAt: "desc" }, 
  });

  if (!tokenRecord) throw new Error("No active code found.");


  if (new Date() > tokenRecord.expires) {
    await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
    throw new Error("Code expired.");
  }


  if (tokenRecord.token === inputToken) {
    await prisma.otpToken.deleteMany({ where: { email: cleanEmail } });
    return { success: true };
  } else {

    const updated = await prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { failedAttempts: { increment: 1 } },
    });


    if (updated.failedAttempts >= 5) {
      await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
      throw new Error("Too many failed attempts. Code invalidated.");
    }

    throw new Error(`Invalid code. (${5 - updated.failedAttempts} attempts remaining)`);
  }
}