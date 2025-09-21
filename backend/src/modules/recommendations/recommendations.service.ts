import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UserPreferences {
  topTags: Array<{ tag: string; count: number; score: number }>;
  topBrands: Array<{ brand: string; count: number; score: number }>;
  totalLikes: number;
}

interface ItemScore {
  itemId: string;
  score: number;
  tagOverlap: number;
  brandAffinity: number;
  friendBoost: number;
}

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getRecommendedFeed(userId: string, take: number = 20, cursor?: string) {
    const [userPreferences, seenItemIds, friendIds] = await Promise.all([
      this.getUserPreferences(userId),
      this.getSeenItemIds(userId),
      this.getFriendIds(userId),
    ]);

    const activeItems = await this.prisma.item.findMany({
      where: {
        active: true,
        NOT: {
          id: {
            in: seenItemIds,
          },
        },
      },
      include: {
        likes: {
          where: {
            userId: {
              in: friendIds,
            },
          },
          select: {
            userId: true,
          },
        },
      },
      take: take * 3, // Get more items to score and filter
    });

    if (activeItems.length === 0) {
      return {
        items: [],
        nextCursor: null,
      };
    }

    const scoredItems = activeItems.map(item => 
      this.scoreItem(item, userPreferences, friendIds)
    );

    scoredItems.sort((a, b) => b.score - a.score);

    const recommendedItems = scoredItems
      .slice(0, take)
      .map(scored => activeItems.find(item => item.id === scored.itemId))
      .filter(item => item !== undefined);

    const lastItem = recommendedItems[recommendedItems.length - 1];

    return {
      items: recommendedItems.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        currency: item.currency,
        images: item.images,
        tags: item.tags,
        gender: item.gender,
        season: item.season,
        createdAt: item.createdAt,
      })),
      nextCursor: lastItem?.id,
    };
  }

  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    const likes = await this.prisma.like.findMany({
      where: { userId },
      include: {
        item: {
          select: {
            tags: true,
            brand: true,
          },
        },
      },
    });

    const totalLikes = likes.length;

    if (totalLikes === 0) {
      return {
        topTags: [],
        topBrands: [],
        totalLikes: 0,
      };
    }

    // Calculate tag preferences
    const tagCounts = new Map<string, number>();
    const brandCounts = new Map<string, number>();

    likes.forEach(like => {
      like.item.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
      brandCounts.set(like.item.brand, (brandCounts.get(like.item.brand) || 0) + 1);
    });

    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({
        tag,
        count,
        score: count / totalLikes,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const topBrands = Array.from(brandCounts.entries())
      .map(([brand, count]) => ({
        brand,
        count,
        score: count / totalLikes,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      topTags,
      topBrands,
      totalLikes,
    };
  }

  private async getSeenItemIds(userId: string): Promise<string[]> {
    const [likes, passes, saves] = await Promise.all([
      this.prisma.like.findMany({
        where: { userId },
        select: { itemId: true },
      }),
      this.prisma.pass.findMany({
        where: { userId },
        select: { itemId: true },
      }),
      this.prisma.save.findMany({
        where: { userId },
        select: { itemId: true },
      }),
    ]);

    return [
      ...likes.map(l => l.itemId),
      ...passes.map(p => p.itemId),
      ...saves.map(s => s.itemId),
    ];
  }

  private async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { userAId: userId, status: 'accepted' },
          { userBId: userId, status: 'accepted' },
        ],
      },
    });

    return friendships.map(f => 
      f.userAId === userId ? f.userBId : f.userAId
    );
  }

  private scoreItem(
    item: any,
    preferences: UserPreferences,
    friendIds: string[]
  ): ItemScore {
    const weights = {
      tagOverlap: 0.5,
      brandAffinity: 0.3,
      friendBoost: 0.2,
    };

    // Tag overlap score (Jaccard similarity)
    const userTags = new Set(preferences.topTags.map(t => t.tag));
    const itemTags = new Set(item.tags);
    const intersection = new Set([...userTags].filter(tag => itemTags.has(tag)));
    const union = new Set([...userTags, ...itemTags]);
    
    const tagOverlap = union.size > 0 ? intersection.size / union.size : 0;
    
    // Apply tag preference weights
    const weightedTagScore = Array.from(intersection).reduce((score, tag) => {
      const preference = preferences.topTags.find(t => t.tag === tag);
      return score + (preference ? preference.score : 0);
    }, 0);

    // Brand affinity score
    const brandPreference = preferences.topBrands.find(b => b.brand === item.brand);
    const brandAffinity = brandPreference ? brandPreference.score : 0;

    // Friend boost score
    const friendLikes = item.likes.filter((like: any) => 
      friendIds.includes(like.userId)
    ).length;
    const friendBoost = friendLikes > 0 ? Math.min(friendLikes / friendIds.length, 1) : 0;

    // Calculate final score
    const finalTagScore = Math.max(tagOverlap, weightedTagScore);
    const score = 
      weights.tagOverlap * finalTagScore +
      weights.brandAffinity * brandAffinity +
      weights.friendBoost * friendBoost;

    // Add some randomness for cold start and exploration
    const randomBoost = Math.random() * 0.1;
    const finalScore = score + randomBoost;

    return {
      itemId: item.id,
      score: finalScore,
      tagOverlap: finalTagScore,
      brandAffinity,
      friendBoost,
    };
  }

  async getCompatibilityScore(userAId: string, userBId: string): Promise<{
    score: number;
    sharedLikes: string[];
    totalUserALikes: number;
    totalUserBLikes: number;
  }> {
    const [userALikes, userBLikes] = await Promise.all([
      this.prisma.like.findMany({
        where: { userId: userAId },
        select: { itemId: true },
      }),
      this.prisma.like.findMany({
        where: { userId: userBId },
        select: { itemId: true },
      }),
    ]);

    const userALikeIds = new Set(userALikes.map(l => l.itemId));
    const userBLikeIds = new Set(userBLikes.map(l => l.itemId));
    
    const sharedLikes = Array.from(userALikeIds).filter(id => userBLikeIds.has(id));
    const totalLikes = new Set([...userALikeIds, ...userBLikeIds]).size;
    
    // Jaccard similarity for compatibility
    const score = totalLikes > 0 ? (sharedLikes.length / totalLikes) * 100 : 0;

    return {
      score: Math.round(score),
      sharedLikes,
      totalUserALikes: userALikes.length,
      totalUserBLikes: userBLikes.length,
    };
  }
}