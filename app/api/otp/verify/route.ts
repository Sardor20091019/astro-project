import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await verifyOtp(email, token);
    
    // Tokens validated completely at this junction. 
    // Secure NextAuth cookies or application sessions can follow here.
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}