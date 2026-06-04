 
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hash, ...userData } = body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("CRITICAL: TELEGRAM_BOT_TOKEN is missing in .env");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // 1. Prepare Secret: SHA256 of the bot token
    const secret = crypto.createHash("sha256").update(botToken).digest();

    // 2. Prepare Data Check String
    // MUST sort keys alphabetically, MUST map values as strings
    const sortedKeys = Object.keys(userData).sort();
    const dataCheckString = sortedKeys
      .map((key) => `${key}=${userData[key]}`)
      .join("\n");
    // 3. Compute HMAC
    const hmac = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

    // Add these logs right inside your POST function in route.ts
    console.log("--- DEBUG START ---");
    console.log("Bot Token Present:", !!process.env.TELEGRAM_BOT_TOKEN);
    console.log("Received Data Keys:", Object.keys(userData));
    console.log("Constructed String:", dataCheckString); // This is the crucial line
    console.log("Calculated Hash:", hmac);
    console.log("Sent Hash:", hash);
    console.log("--- DEBUG END ---");

    // --- DEBUGGING: If you see a mismatch, look at these logs in your terminal ---
    console.log("--- AUTH DEBUG ---");
    console.log("String being hashed:", dataCheckString);
    console.log("Calculated HMAC:", hmac);
    console.log("Received Hash:", hash);
    // ----------------------------------------------------------------------------

    if (hmac !== hash) {
      console.error("HMAC Mismatch!");
      return NextResponse.json({ error: "Invalid authentication hash" }, { status: 401 });
    }

    const authDate = parseInt(userData.auth_date);
    if (isNaN(authDate) || Math.abs(Date.now() / 1000 - authDate) > 86400) {
      return NextResponse.json({ error: "Authentication data expired" }, { status: 401 });
    }

    // Database logic
    const user = await prisma.user.upsert({
      where: { telegramId: userData.id.toString() },
      update: {
        telegramUsername: userData.username,
        image: userData.photo_url || null,
        name: [userData.first_name, userData.last_name].filter(Boolean).join(" "),
      },
      create: {
        telegramId: userData.id.toString(),
        telegramUsername: userData.username,
        image: userData.photo_url || null,
        name: [userData.first_name, userData.last_name].filter(Boolean).join(" "),
      },
    });

    const response = NextResponse.json({ success: true, user });

    response.cookies.set("user_session", user.id, {
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

