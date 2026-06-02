import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAndSendOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    await generateAndSendOtp(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP Generation failure: ", error);
    return NextResponse.json({ error: "Failed to dispatch verification code." }, { status: 500 });
  }
}