// backend/src/admin/admin-comments.controller.ts
import {
  Controller,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { KyselyService } from '../database/kysely.service'; // Adjust path to your Kysely service
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard'; // Your NestJS admin guard

@Controller('admin/comments')
@UseGuards(AdminAuthGuard)
export class AdminCommentsController {
  constructor(private readonly db: KyselyService) {}

  @Delete()
  async deleteComment(@Query('id') idString: string) {
    if (!idString) {
      throw new BadRequestException('Missing comment identity target');
    }

    const commentId = parseInt(idString, 10);
    if (isNaN(commentId)) {
      throw new BadRequestException('Invalid identity format');
    }

    try {
      await this.db.deleteFrom('Comment').where('id', '=', commentId).execute();

      return { success: true };
    } catch (error) {
      console.error('Administrative execution error:', error);
      throw new InternalServerErrorException('Action execution failed');
    }
  }
}
