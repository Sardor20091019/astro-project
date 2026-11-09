import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-08-26.dahlia" as any,
  });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured on the server");
    return NextResponse.json(
      { error: "Webhook endpoint not configured" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("Stripe Webhook Signature Verification Failed:", err?.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const tierId = session.metadata?.tierId;

        if (userId && tierId) {
          // If the user bought a creator tier, ensure user record is updated
          if (tierId === "PREMIUM_CREATOR") {
            await db
              .updateTable("User")
              .set({ role: "USER" })
              .where("id", "=", userId)
              .execute();
          }
        }
        break;
      }
      default:
        // Gracefully ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Event Processing Error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook event" },
      { status: 500 },
    );
  }
}
