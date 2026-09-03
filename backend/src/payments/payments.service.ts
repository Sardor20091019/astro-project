import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY ?? '';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-08-26.dahlia' as any,
    });
  }

  async createCheckoutSession(amount: number, name: string): Promise<{ url: string | null }> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/photos?success=true`,
      cancel_url: `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/photos?canceled=true`,
    });

    return { url: session.url };
  }
}