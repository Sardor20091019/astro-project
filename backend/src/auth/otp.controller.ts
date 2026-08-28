// backend/src/auth/otp.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  BadRequestException, 
  ForbiddenException, 
  InternalServerErrorException 
} from '@nestjs/common';
import type { Request } from 'express';
// Ensure your otp utility is moved or imported from your shared backend library
import { verifyOtp, generateAndSendOtp } from '@shared/otp.js';

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

@Controller('otp')
export class OtpController {

  @Post()
  async sendOtp(
    @Body() body: { email?: string; turnstileToken?: string },
    @Req() req: Request
  ) {
    try {
      const { email, turnstileToken } = body;

      if (!turnstileToken) {
        throw new BadRequestException('Verification token missing');
      }

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      const verifyData = (await verifyRes.json()) as TurnstileResponse;
      if (!verifyData.success) {
        throw new ForbiddenException('Bot verification failed');
      }

      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded 
        ? (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (forwarded as string[])[0]) 
        : '127.0.0.1';

      if (!email) {
        throw new BadRequestException('Email required');
      }

      await generateAndSendOtp(email, ip);
      return { success: true };
      
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('OTP API Error:', errorMessage);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  @Post('verify')
  async verifyUserOtp(@Body() body: { email?: string; token?: string }) {
    try {
      const { email, token } = body;

      if (!email || !token) {
        throw new BadRequestException('Missing fields');
      }

      await verifyOtp(email, token);

      return { success: true };
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Authentication validation failed';
      throw new BadRequestException(errorMessage);
    }
  }
}