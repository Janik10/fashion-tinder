import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeedQueryDto, ItemDto } from './dto/items.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async getFeed(query: FeedQueryDto, take: number = 20) {
    const { cursor, gender, season } = query;
    
    const items = await this.prisma.item.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        active: true,
        ...(gender && { gender }),
        ...(season && { season }),
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
    const item = await this.prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async importItems(items: ItemDto[]) {
    return this.prisma.item.createMany({
      data: items.map(item => ({
        ...item,
        currency: item.currency || 'USD',
      })),
    });
  }
}