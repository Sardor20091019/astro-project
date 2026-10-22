import Stripe from "stripe";

export const PRODUCT_TIERS: Record<
  string,
  { id: string; name: string; amount: number }
> = {
  PREMIUM_CREATOR: {
    id: "PREMIUM_CREATOR",
    name: "Astrospectrum Pro Creator Membership",
    amount: 1500,
  },
  TIP_COFFEE: {
    id: "TIP_COFFEE",
    name: "Support Artist - Coffee Tier",
    amount: 500,
  },
  TIP_STANDARD: {
    id: "TIP_STANDARD",
    name: "Support Artist - Patron Tier",
    amount: 1000,
  },
  TIP_SUPPORTER: {
    id: "TIP_SUPPORTER",
    name: "Support Artist - Stellar Supporter Tier",
    amount: 2500,
  },
};

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-08-26.dahlia" as any,
    });
  }
  return stripeClient;
}

export async function createCheckoutSession(
  tierId: string,
  userId?: string,
): Promise<{ url: string | null }> {
  const tier = PRODUCT_TIERS[tierId];
  if (!tier) {
    throw new Error("Invalid product tier specified");
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: tier.name },
          unit_amount: tier.amount,
        },
        quantity: 1,
      },
    ],
    client_reference_id: userId,
    metadata: {
      tierId: tier.id,
      userId: userId ?? "anonymous",
    },
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/photos?success=true`,
    cancel_url: `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/photos?canceled=true`,
  });

  return { url: session.url };
}

