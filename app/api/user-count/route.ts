/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db
      .selectFrom("User")
      .select((eb) => eb.fn.count("id").as("count"))
      .executeTakeFirst();

    const count = Number(result?.count ?? 0);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("User count error:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}