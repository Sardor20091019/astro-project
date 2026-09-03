import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  async createSession(@Body() body: CreateCheckoutSessionDto) {
    return this.paymentsService.createCheckoutSession(body.amount, body.name);
  }
}