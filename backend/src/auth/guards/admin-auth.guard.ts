import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { KyselyService } from '../../database/kysely.service';

export const ADMIN_EMAILS: string[] = [];

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly db: KyselyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // 1. Verify internal secret if identifying via proxy headers
    const headerEmail = request.headers['x-user-email'];
    const rawEmail = Array.isArray(headerEmail) ? headerEmail[0] : headerEmail;
    const internalSecretHeader = request.headers['x-internal-secret'];
    const rawSecret = Array.isArray(internalSecretHeader)
      ? internalSecretHeader[0]
      : internalSecretHeader;

    const expectedSecret = process.env.NEXTAUTH_SECRET || process.env.INTERNAL_SECRET;

    let verifiedEmail: string | null = null;

    if (rawEmail && typeof rawEmail === 'string' && rawSecret && typeof rawSecret === 'string') {
      if (expectedSecret) {
        const secretBuf = Buffer.from(rawSecret);
        const expectedBuf = Buffer.from(expectedSecret);
        if (
          secretBuf.length === expectedBuf.length &&
          crypto.timingSafeEqual(secretBuf, expectedBuf)
        ) {
          verifiedEmail = rawEmail.toLowerCase().trim();
        }
      }
    }

    // 2. Fall back to cookie session verification if no header email
    if (!verifiedEmail) {
      const cookies = request.cookies as Record<string, string> | undefined;
      const sessionUserId = cookies?.user_session;

      if (sessionUserId && typeof sessionUserId === 'string') {
        const user = await this.db
          .selectFrom('User')
          .select(['role', 'email'])
          .where('id', '=', sessionUserId)
          .executeTakeFirst();

        if (user && user.role === 'ADMIN' && user.email) {
          verifiedEmail = user.email.toLowerCase().trim();
        }
      }
    }

    if (!verifiedEmail) {
      throw new ForbiddenException('Forbidden: Administrative access required');
    }

    // 3. Confirm ADMIN role in database for verified email
    const dbUser = await this.db
      .selectFrom('User')
      .select('role')
      .where('email', '=', verifiedEmail)
      .executeTakeFirst();

    if (!dbUser || dbUser.role !== 'ADMIN') {
      throw new ForbiddenException('Forbidden: Insufficient role permissions');
    }

    return true;
  }
}
