// backend/src/auth/guards/admin-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export const ADMIN_EMAILS: string[] = ['sardor091019@gmail.com'];

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const email = request.headers['x-user-email'] || request.user?.email;

    if (!email || !ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
      throw new ForbiddenException('Forbidden');
    }

    return true;
  }
}
