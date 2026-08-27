import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hash, ...userData } = body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("CRITICAL: TELEGRAM_BOT_TOKEN is missing in .env");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const secret = crypto.createHash("sha256").update(botToken).digest();

    const sortedKeys = Object.keys(userData).sort();
    const dataCheckString = sortedKeys
      .map((key) => `${key}=${userData[key]}`)
      .join("\n");

    const hmac = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

    console.log("--- DEBUG START ---");
    console.log("Bot Token Present:", !!process.env.TELEGRAM_BOT_TOKEN);
    console.log("Received Data Keys:", Object.keys(userData));
    console.log("Constructed String:", dataCheckString); 
    console.log("Calculated Hash:", hmac);
    console.log("Sent Hash:", hash);
    console.log("--- DEBUG END ---");

    if (hmac !== hash) {
      console.error("HMAC Mismatch!");
      return NextResponse.json({ error: "Invalid authentication hash" }, { status: 401 });
    }

    const authDate = parseInt(userData.auth_date);
    const nowSec = Math.floor(Date.now() / 1000);
    if (isNaN(authDate) || Math.abs(nowSec - authDate) > 86400) {
      return NextResponse.json({ error: "Authentication data expired" }, { status: 401 });
    }

    const telegramIdStr = userData.id.toString();
    const telegramUsername = userData.username || null;
    const userImage = userData.photo_url || null;
    const userName = [userData.first_name, userData.last_name].filter(Boolean).join(" ");

    // Kysely Upsert with generated UUID id for insertion
    const user = await db
      .insertInto("User")
      .values({
        id: crypto.randomUUID(),
        telegramId: telegramIdStr,
        telegramUsername,
        image: userImage,
        name: userName,
      })
      .onConflict((oc) =>
        oc.column("telegramId").doUpdateSet({
          telegramUsername,
          image: userImage,
          name: userName,
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow();

    const response = NextResponse.json({ success: true, user });

    response.cookies.set("user_session", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error("Telegram Auth Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}