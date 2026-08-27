/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await db
      .selectFrom("User")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst();

    return NextResponse.json({ user: user ?? null });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}