// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}