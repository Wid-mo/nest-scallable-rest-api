import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BookmarkService } from './bookmark/bookmark.service';
import { BookmarkController } from './bookmark/bookmark.controller';
import configuration from './config/config';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookmarksModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [AppController, BookmarkController],
  providers: [AppService, BookmarkService],
})
export class AppModule {}
