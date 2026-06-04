import { NextResponse } from "next/server";
import { verifyOtp } from "@/otplib/otp";

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await verifyOtp(email, token);
    
    // If we reach here, it's successful! 
    // You can now create your session or set a cookie here.
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}