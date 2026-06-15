import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json() as { email?: string; token?: string };

    if (!email || !token) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await verifyOtp(email, token);

    return NextResponse.json({ success: true });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Authentication validation failed";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}