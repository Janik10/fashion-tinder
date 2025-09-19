import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  async like(userId: string, itemId: string) {
    return this.prisma.like.create({
      data: {
        userId,
        itemId,
      },
    });
  }

  async pass(userId: string, itemId: string) {
    return this.prisma.pass.create({
      data: {
        userId,
        itemId,
      },
    });
  }

  async save(userId: string, itemId: string) {
    return this.prisma.save.create({
      data: {
        userId,
        itemId,
      },
    });
  }

  async getUserLikes(userId: string) {
    return this.prisma.like.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserSaves(userId: string) {
    return this.prisma.save.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}