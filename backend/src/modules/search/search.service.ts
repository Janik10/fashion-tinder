import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    const terms = query.toLowerCase().split(/\s+/);

    return this.prisma.item.findMany({
      where: {
        OR: [
          // Search by brand
          {
            brand: {
              contains: query,
              mode: 'insensitive',
            },
          },
          // Search by tags
          {
            tags: {
              hasSome: terms,
            },
          },
          // Search by name
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        active: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
  }
}