import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async requestFriendship(userAId: string, username: string) {
    const userB = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!userB) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.friendship.create({
      data: {
        userAId,
        userBId: userB.id,
        status: 'pending',
      },
      include: {
        userB: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async acceptFriendship(userBId: string, userAId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        userAId,
        userBId,
        status: 'pending',
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship request not found');
    }

    return this.prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: 'accepted' },
      include: {
        userA: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { userAId: userId, status: 'accepted' },
          { userBId: userId, status: 'accepted' },
        ],
      },
      include: {
        userA: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        userB: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return friendships.map((f) => ({
      friend: f.userAId === userId ? f.userB : f.userA,
      since: f.createdAt,
    }));
  }

  async getCompatibility(userId: string, friendId: string) {
    const [userLikes, friendLikes] = await Promise.all([
      this.prisma.like.findMany({
        where: { userId },
        select: { itemId: true },
      }),
      this.prisma.like.findMany({
        where: { userId: friendId },
        select: { itemId: true },
      }),
    ]);

    const userItemIds = new Set(userLikes.map((l) => l.itemId));
    const friendItemIds = new Set(friendLikes.map((l) => l.itemId));
    const sharedLikes = [...userItemIds].filter((id) => friendItemIds.has(id));

    // Simple compatibility score based on shared likes
    const score = userItemIds.size && friendItemIds.size
      ? (sharedLikes.length * 100) / Math.min(userItemIds.size, friendItemIds.size)
      : 0;

    return {
      score: Math.round(score),
      sharedLikes,
    };
  }
}