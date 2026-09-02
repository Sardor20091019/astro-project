// backend/src/user/user-count.controller.ts
import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { KyselyService } from '../database/kysely.service';

@Controller('user-count')
export class UserCountController {
  constructor(private readonly db: KyselyService) {}

  @Get()
  async getUserCount() {
    try {
      const result = await this.db
        .selectFrom('User')
        .select((eb) => eb.fn.count('id').as('count'))
        .executeTakeFirst();

      const count = Number(result?.count ?? 0);
      return { count };
    } catch (error) {
      console.error('User count error:', error);
      throw new InternalServerErrorException({ count: 0 });
    }
  }
}
