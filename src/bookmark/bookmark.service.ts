import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  getBookmarks(userId: number) {
    return this.prisma.bookmarks.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmarks.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  createBookmark(userId: number, dto: CreateBookmarkDto) {
    return this.prisma.bookmarks.create({
      data: { userId, Desctiption: '', ...dto },
    });
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmarks.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resource denied');

    return this.prisma.bookmarks.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmarks.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.bookmarks.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
