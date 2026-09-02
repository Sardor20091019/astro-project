import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import type { Request } from 'express';
import { KyselyService } from '../../database/kysely.service';

export const ADMIN_EMAILS: string[] = ['sardor091019@gmail.com'];

@Injectable()
export class AdminAuthGuard implements CanActivate, OnModuleInit {
  constructor(private readonly db: KyselyService) {}

  async onModuleInit(): Promise<void> {
    await this.refreshAdminEmails();
  }

  async refreshAdminEmails(): Promise<void> {
    try {
      const admins = await this.db
        .selectFrom('User')
        .select('email')
        .where('role', '=', 'ADMIN')
        .execute();

      const dbEmails: string[] = admins
        .map((a) => a.email)
        .filter((email): email is string => typeof email === 'string');

      ADMIN_EMAILS.length = 0;
      ADMIN_EMAILS.push(
        ...Array.from(new Set(['sardor091019@gmail.com', ...dbEmails])),
      );
    } catch (error: unknown) {
      console.error('Failed to load admin emails from SQL:', error);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const headerEmail = request.headers['x-user-email'];
    const rawEmail = Array.isArray(headerEmail) ? headerEmail[0] : headerEmail;
    const userEmail = (request as { user?: { email?: unknown } }).user?.email;
    const email = rawEmail || userEmail;

    if (!email || typeof email !== 'string') {
      throw new ForbiddenException('Forbidden');
    }

    const normalizedEmail = email.toLowerCase().trim();

    await this.refreshAdminEmails();

    const isListed = ADMIN_EMAILS.some(
      (adminEmail: string) =>
        adminEmail.toLowerCase().trim() === normalizedEmail,
    );

    if (isListed) {
      return true;
    }

    const dbUser = await this.db
      .selectFrom('User')
      .select('role')
      .where('email', '=', normalizedEmail)
      .executeTakeFirst();

    if (!dbUser || dbUser.role !== 'ADMIN') {
      throw new ForbiddenException('Forbidden');
    }

    return true;
  }
}
