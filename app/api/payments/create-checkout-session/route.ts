import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/auth.helper";
import { createCheckoutSession } from "@/server/payments.service";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required for checkout" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { tierId } = body;

    if (!tierId || typeof tierId !== "string") {
      return NextResponse.json(
        { error: "Invalid product tier specified" },
        { status: 400 },
      );
    }

    const session = await createCheckoutSession(tierId, user.id);
    return NextResponse.json(session);
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    const isClientError = err.message?.includes("Invalid product tier");
    const status = isClientError ? 400 : 500;
    const clientMessage = isClientError
      ? "Invalid product tier specified"
      : "An internal error occurred while processing checkout";
    return NextResponse.json(
      { error: clientMessage },
      { status },
    );
  }
}

