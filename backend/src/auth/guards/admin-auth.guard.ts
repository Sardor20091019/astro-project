import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { KyselyService } from '../../database/kysely.service';

export const ADMIN_EMAILS: string[] = ['sardor091019@gmail.com'];

@Injectable()
export class AdminAuthGuard implements CanActivate, OnModuleInit {
  constructor(private readonly db: KyselyService) {}

  async onModuleInit() {
    await this.refreshAdminEmails();
  }

  async refreshAdminEmails() {
    try {
      const admins = await this.db
        .selectFrom('User')
        .select('email')
        .where('role', '=', 'ADMIN')
        .execute();

      const dbEmails = admins.map((a) => a.email).filter(Boolean) as string[];

      ADMIN_EMAILS.length = 0;
      ADMIN_EMAILS.push(...new Set(['sardor091019@gmail.com', ...dbEmails]));
    } catch (error) {
      console.error('Failed to load admin emails from SQL:', error);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const email = request.headers['x-user-email'] || request.user?.email;

    if (!email) {
      throw new ForbiddenException('Forbidden');
    }

    const normalizedEmail = email.toLowerCase().trim();

    await this.refreshAdminEmails();

    const isListed = ADMIN_EMAILS.some(
      (adminEmail) => adminEmail.toLowerCase().trim() === normalizedEmail
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