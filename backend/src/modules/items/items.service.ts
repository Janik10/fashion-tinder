import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async getFeed(cursor?: string, take: number = 20) {
    const items = await this.prisma.item.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        active: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const lastItem = items[items.length - 1];
    const nextCursor = lastItem?.id;

    return {
      items,
      nextCursor,
    };
  }

  async getById(id: string) {
    return this.prisma.item.findUnique({
      where: { id },
    });
  }

  async importItems(items: Array<{
    name: string;
    brand: string;
    price: number;
    currency?: string;
    images: string[];
    tags: string[];
    gender?: string;
    season?: string;
  }>) {
    return this.prisma.item.createMany({
      data: items.map(item => ({
        ...item,
        currency: item.currency || 'USD',
      })),
    });
  }
}