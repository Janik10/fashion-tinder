import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async createSession(hostId: string, itemIds?: string[]) {
    let items = itemIds;
    if (!items || items.length === 0) {
      // If no items provided, get 10 random active items
      const randomItems = await this.prisma.item.findMany({
        where: { active: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      items = randomItems.map(item => item.id);
    }

    // Generate a random 6-digit code
    const code = Math.random().toString().substring(2, 8);

    return this.prisma.voteSession.create({
      data: {
        hostId,
        code,
        itemIds: items,
      },
    });
  }

  async joinSession(code: string) {
    const session = await this.prisma.voteSession.findUnique({
      where: { code },
      include: {
        votes: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Vote session not found');
    }

    return session;
  }

  async castVote(sessionId: string, userId: string, itemId: string, value: number) {
    return this.prisma.vote.create({
      data: {
        sessionId,
        userId,
        itemId,
        value,
      },
    });
  }

  async getSessionResults(sessionId: string) {
    const session = await this.prisma.voteSession.findUnique({
      where: { id: sessionId },
      include: {
        votes: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Vote session not found');
    }

    const itemResults = session.itemIds.map(itemId => {
      const votes = session.votes.filter(v => v.itemId === itemId);
      const likes = votes.filter(v => v.value === 1).length;
      const passes = votes.filter(v => v.value === 0).length;
      return { itemId, likes, passes };
    });

    // Sort by likes desc, passes asc
    itemResults.sort((a, b) => {
      if (a.likes !== b.likes) return b.likes - a.likes;
      return a.passes - b.passes;
    });

    return {
      perItem: itemResults,
      top: itemResults.slice(0, 3).map(r => r.itemId),
    };
  }
}