import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { KyselyService } from '../database/kysely.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly db: KyselyService) {
    const secretKey = process.env.STRIPE_SECRET_KEY ?? '';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-08-26.dahlia',
    });
  }

  async createCheckoutSession(
    photoId?: number,
    amount?: number,
    name?: string,
  ): Promise<{ url: string | null }> {
    let finalAmount = 500; // $5.00 fixed tier for archival download
    let finalName = name ? name.trim().slice(0, 100) : 'Archival Print License';

    if (photoId !== undefined && photoId !== null) {
      const parsedId = Number(photoId);
      if (!Number.isInteger(parsedId)) {
        throw new BadRequestException('Invalid photo identity target');
      }

      const photo = await this.db
        .selectFrom('Photo')
        .select(['id', 'title'])
        .where('id', '=', parsedId)
        .executeTakeFirst();

      if (!photo) {
        throw new BadRequestException('Photo item not found in catalog');
      }

      finalName = `High-Res Archival License: ${photo.title}`;
      finalAmount = 500; // Enforce server-side authoritative pricing ($5.00)
    } else if (amount && amount >= 50) {
      finalAmount = Math.max(50, Math.round(Number(amount)));
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: finalName },
            unit_amount: finalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      managed_payments: { enabled: false },
      success_url: `${frontendUrl}/photos?success=true`,
      cancel_url: `${frontendUrl}/photos?canceled=true`,
    });

    return { url: session.url };
  }
}
