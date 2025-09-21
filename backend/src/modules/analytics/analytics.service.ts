import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export type EventType = 
  | 'app_open'
  | 'swipe_like'
  | 'swipe_pass'
  | 'save_item'
  | 'share_item'
  | 'friend_add'
  | 'vote_cast'
  | 'session_create'
  | 'compatibility_view'
  | 'search_query'
  | 'feed_load'
  | 'item_view'
  | 'profile_view';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(
    event: EventType,
    userId?: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      // For MVP, we'll just log events to console and optionally store them
      const eventData: AnalyticsEvent = {
        event,
        userId,
        properties,
        timestamp: new Date(),
      };

      console.log('Analytics Event:', JSON.stringify(eventData, null, 2));

      // In a real app, you'd send this to an analytics service like:
      // - Google Analytics
      // - Mixpanel
      // - Amplitude
      // - Custom analytics endpoint
      
      // For now, we'll store basic events in a simple log
      // In production, you might want a separate events table
      await this.logEventToDatabase(eventData);
    } catch (error) {
      console.error('Analytics tracking failed:', error);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  private async logEventToDatabase(event: AnalyticsEvent): Promise<void> {
    // In a real app, you'd have an Events table for this
    // For now, we'll just track some key metrics in user activity
    
    if (!event.userId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Track daily active users
    if (event.event === 'app_open') {
      // We could maintain a separate analytics table, but for MVP
      // we'll just update user's last seen
      await this.prisma.user.update({
        where: { id: event.userId },
        data: { 
          // We don't have lastSeen in schema, so we'll skip DB update for now
          // In real app you'd add this field or use a separate analytics table
        },
      }).catch(() => {
        // Ignore errors for analytics
      });
    }
  }

  async getAnalyticsSummary() {
    try {
      const [
        totalUsers,
        totalItems,
        totalLikes,
        totalSaves,
        totalVoteSessions,
        topBrands,
        topTags,
        userActivity
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.item.count(),
        this.prisma.like.count(),
        this.prisma.save.count(),
        this.prisma.voteSession.count(),
        this.getTopBrands(),
        this.getTopTags(),
        this.getUserActivity(),
      ]);

      return {
        overview: {
          totalUsers,
          totalItems,
          totalLikes,
          totalSaves,
          totalVoteSessions,
        },
        engagement: {
          avgLikesPerUser: totalUsers > 0 ? Math.round((totalLikes / totalUsers) * 100) / 100 : 0,
          avgSavesPerUser: totalUsers > 0 ? Math.round((totalSaves / totalUsers) * 100) / 100 : 0,
          saveRate: totalLikes > 0 ? Math.round((totalSaves / totalLikes) * 100) : 0,
        },
        content: {
          topBrands,
          topTags,
        },
        users: userActivity,
      };
    } catch (error) {
      console.error('Analytics summary failed:', error);
      return null;
    }
  }

  private async getTopBrands() {
    const brands = await this.prisma.item.groupBy({
      by: ['brand'],
      _count: { brand: true },
      where: { active: true },
      orderBy: { _count: { brand: 'desc' } },
      take: 10,
    });

    return brands.map(b => ({
      brand: b.brand,
      count: b._count.brand,
    }));
  }

  private async getTopTags() {
    const items = await this.prisma.item.findMany({
      select: { tags: true },
      where: { active: true },
    });

    const tagCounts = new Map<string, number>();
    items.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));
  }

  private async getUserActivity() {
    const users = await this.prisma.user.findMany({
      include: {
        _count: {
          select: {
            likes: true,
            saves: true,
            passes: true,
          },
        },
      },
      take: 10,
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
    });

    return users.map(user => ({
      username: user.username,
      totalActions: user._count.likes + user._count.saves + user._count.passes,
      likes: user._count.likes,
      saves: user._count.saves,
      passes: user._count.passes,
    }));
  }

  // Helper methods for tracking specific events with proper context
  async trackSwipe(userId: string, itemId: string, action: 'like' | 'pass'): Promise<void> {
    await this.trackEvent(action === 'like' ? 'swipe_like' : 'swipe_pass', userId, {
      itemId,
      action,
    });
  }

  async trackSave(userId: string, itemId: string): Promise<void> {
    await this.trackEvent('save_item', userId, { itemId });
  }

  async trackFriendAction(userId: string, friendId: string, action: 'add' | 'remove'): Promise<void> {
    await this.trackEvent('friend_add', userId, { friendId, action });
  }

  async trackVoteSession(hostId: string, sessionId: string, itemCount: number): Promise<void> {
    await this.trackEvent('session_create', hostId, { sessionId, itemCount });
  }

  async trackVote(userId: string, sessionId: string, itemId: string, value: number): Promise<void> {
    await this.trackEvent('vote_cast', userId, { sessionId, itemId, value });
  }

  async trackCompatibilityView(userId: string, friendId: string, score: number): Promise<void> {
    await this.trackEvent('compatibility_view', userId, { friendId, score });
  }

  async trackSearch(userId: string, query: string, resultCount: number): Promise<void> {
    await this.trackEvent('search_query', userId, { query, resultCount });
  }

  async trackFeedLoad(userId: string, itemCount: number): Promise<void> {
    await this.trackEvent('feed_load', userId, { itemCount });
  }

  async trackAppOpen(userId?: string): Promise<void> {
    await this.trackEvent('app_open', userId);
  }
}