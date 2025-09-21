import type { FashionItem } from '@/types';

interface UserPreferences {
  categories: Record<string, number>; // category -> score
  brands: Record<string, number>; // brand -> score
  priceRange: { min: number; max: number; preference: number }; // preferred price range
  colors: Record<string, number>; // color -> score
  tags: Record<string, number>; // tag -> score
}

interface UserInteraction {
  itemId: string;
  action: 'like' | 'pass' | 'save';
  item: FashionItem;
  timestamp: number;
}

export class RecommendationEngine {
  private static STORAGE_KEY = 'fashion_user_preferences';
  private static INTERACTIONS_KEY = 'fashion_user_interactions';

  private preferences: UserPreferences;
  private interactions: UserInteraction[];

  constructor() {
    this.preferences = this.loadPreferences();
    this.interactions = this.loadInteractions();
  }

  // Load user preferences from localStorage
  private loadPreferences(): UserPreferences {
    const saved = localStorage.getItem(RecommendationEngine.STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      categories: {},
      brands: {},
      priceRange: { min: 0, max: 500, preference: 0 },
      colors: {},
      tags: {}
    };
  }

  // Load user interactions from localStorage
  private loadInteractions(): UserInteraction[] {
    const saved = localStorage.getItem(RecommendationEngine.INTERACTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  // Save preferences to localStorage
  private savePreferences(): void {
    localStorage.setItem(RecommendationEngine.STORAGE_KEY, JSON.stringify(this.preferences));
  }

  // Save interactions to localStorage
  private saveInteractions(): void {
    // Keep only last 1000 interactions to prevent storage bloat
    const recentInteractions = this.interactions.slice(-1000);
    localStorage.setItem(RecommendationEngine.INTERACTIONS_KEY, JSON.stringify(recentInteractions));
  }

  // Record user interaction and update preferences
  recordInteraction(item: FashionItem, action: 'like' | 'pass' | 'save'): void {
    // Record the interaction
    const interaction: UserInteraction = {
      itemId: item.id,
      action,
      item,
      timestamp: Date.now()
    };

    this.interactions.push(interaction);
    this.saveInteractions();

    // Update preferences based on action
    const weight = this.getActionWeight(action);
    this.updatePreferences(item, weight);
    this.savePreferences();
  }

  // Get weight for different actions
  private getActionWeight(action: 'like' | 'pass' | 'save'): number {
    switch (action) {
      case 'save': return 3; // Strongest positive signal
      case 'like': return 2; // Strong positive signal
      case 'pass': return -1; // Negative signal
      default: return 0;
    }
  }

  // Update user preferences based on item and action weight
  private updatePreferences(item: FashionItem, weight: number): void {
    // Update category preference
    this.preferences.categories[item.category] =
      (this.preferences.categories[item.category] || 0) + weight;

    // Update brand preference
    this.preferences.brands[item.brand] =
      (this.preferences.brands[item.brand] || 0) + weight;

    // Update price preference (only for positive actions)
    if (weight > 0 && item.price > 0) {
      const currentPref = this.preferences.priceRange.preference;
      this.preferences.priceRange.preference = (currentPref + item.price * weight) / (Math.abs(currentPref) + Math.abs(weight));

      // Adjust price range based on liked items
      if (item.price < this.preferences.priceRange.min || this.preferences.priceRange.min === 0) {
        this.preferences.priceRange.min = Math.max(0, item.price - 50);
      }
      if (item.price > this.preferences.priceRange.max) {
        this.preferences.priceRange.max = item.price + 100;
      }
    }

    // Update color preferences
    item.colors.forEach(color => {
      this.preferences.colors[color] =
        (this.preferences.colors[color] || 0) + weight;
    });

    // Update tag preferences
    item.tags.forEach(tag => {
      this.preferences.tags[tag] =
        (this.preferences.tags[tag] || 0) + weight;
    });
  }

  // Calculate recommendation score for an item
  calculateItemScore(item: FashionItem): number {
    let score = 0;

    // Category score (weight: 3)
    const categoryScore = this.preferences.categories[item.category] || 0;
    score += categoryScore * 3;

    // Brand score (weight: 2)
    const brandScore = this.preferences.brands[item.brand] || 0;
    score += brandScore * 2;

    // Price score (weight: 1.5)
    if (item.price > 0) {
      const pricePreference = this.preferences.priceRange.preference;
      if (pricePreference > 0) {
        const priceDiff = Math.abs(item.price - pricePreference);
        const priceScore = Math.max(0, 100 - priceDiff) / 100;
        score += priceScore * 1.5;
      }
    }

    // Color score (weight: 1)
    const colorScore = item.colors.reduce((sum, color) => {
      return sum + (this.preferences.colors[color] || 0);
    }, 0);
    score += colorScore * 1;

    // Tag score (weight: 1)
    const tagScore = item.tags.reduce((sum, tag) => {
      return sum + (this.preferences.tags[tag] || 0);
    }, 0);
    score += tagScore * 1;

    // Diversity bonus - slightly favor items from categories/brands we haven't seen much
    const categoryCount = this.getInteractionCount('category', item.category);
    const brandCount = this.getInteractionCount('brand', item.brand);
    const diversityBonus = Math.max(0, 10 - (categoryCount + brandCount) / 2);
    score += diversityBonus;

    // Recency penalty - slightly prefer newer interactions
    const lastInteraction = this.getLastInteractionTime(item);
    if (lastInteraction) {
      const hoursSince = (Date.now() - lastInteraction) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        score -= 5; // Reduce score for recently seen items
      }
    }

    return score;
  }

  // Get count of interactions for a specific attribute
  private getInteractionCount(attribute: 'category' | 'brand', value: string): number {
    return this.interactions.filter(interaction => {
      return interaction.item[attribute] === value;
    }).length;
  }

  // Get last interaction time for an item
  private getLastInteractionTime(item: FashionItem): number | null {
    const lastInteraction = this.interactions
      .filter(interaction => interaction.itemId === item.id)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    return lastInteraction ? lastInteraction.timestamp : null;
  }

  // Sort items by recommendation score
  recommendItems(items: FashionItem[]): FashionItem[] {
    // Don't recommend items the user has already interacted with recently
    const recentItemIds = new Set(
      this.interactions
        .filter(interaction => Date.now() - interaction.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
        .map(interaction => interaction.itemId)
    );

    const availableItems = items.filter(item => !recentItemIds.has(item.id));

    // If no preferences yet, return a diverse sample
    if (this.interactions.length === 0) {
      return this.getInitialRecommendations(availableItems);
    }

    // Calculate scores and sort
    const scoredItems = availableItems.map(item => ({
      item,
      score: this.calculateItemScore(item)
    }));

    // Sort by score (highest first) with some randomization to avoid monotony
    scoredItems.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      // Add small random factor for items with similar scores
      if (Math.abs(scoreDiff) < 5) {
        return Math.random() - 0.5;
      }
      return scoreDiff;
    });

    return scoredItems.map(scored => scored.item);
  }

  // Get initial recommendations for new users
  private getInitialRecommendations(items: FashionItem[]): FashionItem[] {
    // Group by category and brand to ensure diversity
    const categorized = items.reduce((acc, item) => {
      const key = `${item.category}-${item.brand}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, FashionItem[]>);

    // Take 1-2 items from each category/brand combination
    const diverseItems: FashionItem[] = [];
    Object.values(categorized).forEach(group => {
      const shuffled = group.sort(() => Math.random() - 0.5);
      diverseItems.push(...shuffled.slice(0, 2));
    });

    return diverseItems.sort(() => Math.random() - 0.5);
  }

  // Get user's top preferences for display
  getTopPreferences(): {
    categories: Array<{ name: string; score: number }>;
    brands: Array<{ name: string; score: number }>;
    colors: Array<{ color: string; score: number }>;
  } {
    const topCategories = Object.entries(this.preferences.categories)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([name, score]) => ({ name, score }));

    const topBrands = Object.entries(this.preferences.brands)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([name, score]) => ({ name, score }));

    const topColors = Object.entries(this.preferences.colors)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 8)
      .map(([color, score]) => ({ color, score }));

    return { categories: topCategories, brands: topBrands, colors: topColors };
  }

  // Reset all preferences (for testing or user request)
  resetPreferences(): void {
    this.preferences = {
      categories: {},
      brands: {},
      priceRange: { min: 0, max: 500, preference: 0 },
      colors: {},
      tags: {}
    };
    this.interactions = [];
    this.savePreferences();
    this.saveInteractions();
  }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine();