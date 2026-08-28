import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KyselyModule } from './database/kysely.module';
import { PhotosModule } from './photos/photos.module';

import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { OtpController } from './auth/otp.controller';
import { CommentsController } from './comments/comments.controller';
import { FollowController } from './follow/follow.controller';
import { LikesController } from './likes/likes.controller';
import { RatingsController } from './ratings/ratings.controller';
import { ReviewsController } from './reviews/reviews.controller';
import { TelegramWebhookController } from './telegram/telegram-webhook.controller';
import { UserCountController } from './user/user-count.controller';
import { UserFollowController } from './user/user-follow.controller';
import { UsersSearchController } from './users/users-search.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    KyselyModule,
    PhotosModule,
  ],
  controllers: [
    AppController,
    AuthController,
    OtpController,
    CommentsController,
    FollowController,
    LikesController,
    RatingsController,
    ReviewsController,
    TelegramWebhookController,
    UserCountController,
    UserFollowController,
    UsersSearchController,
  ],
})
export class AppModule {}