import { useState, useEffect } from "react";
import { FashionCard } from "@/components/FashionCard";
import { FilterModal } from "@/components/FilterModal";
import { PreferencesInsight } from "@/components/PreferencesInsight";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Heart, X, Bookmark, Filter, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { recommendationEngine } from "@/services/recommendationEngine";
import type { FashionItem } from "@/types";

// Import fashion images as fallbacks
import fashion1 from "@/assets/fashion-1.jpg";
import fashion2 from "@/assets/fashion-2.jpg";
import fashion3 from "@/assets/fashion-3.jpg";
import fashion4 from "@/assets/fashion-4.jpg";
import fashion5 from "@/assets/fashion-5.jpg";

// Fallback fashion data for offline mode
const fallbackItems = [
  {
    id: "1",
    name: "Vintage Denim Jacket",
    brand: "Urban Style Co.",
    price: 89,
    imageUrl: fashion1,
    category: "Outerwear",
    tags: ["vintage", "casual", "denim"],
    colors: ["#4A90E2", "#E8E8E8", "#2C3E50"]
  },
  {
    id: "2", 
    name: "Floral Summer Dress",
    brand: "Bloom & Co",
    price: 125,
    imageUrl: fashion2,
    category: "Dresses",
    tags: ["floral", "summer", "midi"],
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"]
  },
  {
    id: "3",
    name: "Classic White Sneakers", 
    brand: "MinimalStep",
    price: 75,
    imageUrl: fashion3,
    category: "Shoes",
    tags: ["minimalist", "white", "comfortable"],
    colors: ["#FFFFFF", "#F5F5F5", "#E8E8E8"]
  },
  {
    id: "4",
    name: "Leather Crossbody Bag",
    brand: "Artisan Leather",
    price: 165,
    imageUrl: fashion4, 
    category: "Accessories",
    tags: ["leather", "crossbody", "handmade"],
    colors: ["#8B4513", "#D2691E", "#A0522D"]
  },
  {
    id: "5",
    name: "Oversized Wool Sweater",
    brand: "Cozy Knits",
    price: 95,
    imageUrl: fashion5,
    category: "Sweaters", 
    tags: ["wool", "oversized", "cozy"],
    colors: ["#F4A460", "#DEB887", "#D2B48C"]
  }
];

// Convert backend item to frontend format
const formatItem = (item: FashionItem) => {
  // Generate more diverse colors based on item properties
  const generateColors = () => {
    const colorSets = [
      ['#FF6B6B', '#4ECDC4', '#45B7D1'], // Pink, Teal, Blue
      ['#8B4513', '#D2691E', '#A0522D'], // Browns
      ['#000000', '#2C3E50', '#34495E'], // Dark colors
      ['#E74C3C', '#C0392B', '#922B21'], // Reds
      ['#3498DB', '#2980B9', '#1F618D'], // Blues
      ['#9B59B6', '#8E44AD', '#7D3C98'], // Purples
      ['#1ABC9C', '#16A085', '#138D75'], // Greens
      ['#F39C12', '#E67E22', '#D35400'], // Oranges
    ];

    // Use item ID to consistently assign color set
    const index = parseInt(item.id) || Math.floor(Math.random() * colorSets.length);
    return colorSets[index % colorSets.length];
  };

  return {
    id: item.id,
    name: item.name,
    brand: item.brand,
    price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : (item.price || 0),
    imageUrl: item.imageUrl || item.image_url || fallbackItems[Math.floor(Math.random() * fallbackItems.length)].imageUrl,
    category: item.category || 'Fashion',
    tags: item.tags || [],
    colors: item.colors && item.colors.length > 0 ? item.colors : generateColors(),
  };
};

interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  colors: string[];
  tags: string[];
}

export default function Home() {
  const { isAuthenticated, initializeAuth } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState<FashionItem[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    categories: [],
    brands: [],
    priceRange: [0, 500],
    colors: [],
    tags: []
  });

  // Initialize auth on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && !isAuthenticated) {
      initializeAuth();
    }
  }, []);

  // Fetch fashion feed from backend or use fallback
  const { data: feedData, refetch } = useQuery({
    queryKey: ['feed'],
    queryFn: () => apiClient.getFeed({ limit: 30 }),
    enabled: isAuthenticated,
    retry: false,
    onError: (error) => {
      console.log('Using fallback data:', error);
    }
  });

  // Initialize recommended items when data changes
  useEffect(() => {
    const backendItems = feedData?.items ? feedData.items.map(formatItem) : [];
    const rawItems = backendItems.length > 0 ? backendItems : fallbackItems;

    // Only update recommended items if we don't have any or if this is a fresh load
    if (recommendedItems.length === 0 || currentIndex === 0) {
      const recommended = recommendationEngine.recommendItems(rawItems);
      setRecommendedItems(recommended);
    }
  }, [feedData, recommendedItems.length, currentIndex]);

  // Create mutations for backend actions (optional - fallback to local only)
  const likeMutation = useMutation({
    mutationFn: (itemId: string) => apiClient.likeItem(itemId),
    onError: () => {} // Silently fail, keep UI working
  });

  const passMutation = useMutation({
    mutationFn: (itemId: string) => apiClient.passItem(itemId),
    onError: () => {}
  });

  const saveMutation = useMutation({
    mutationFn: (itemId: string) => apiClient.saveItem(itemId),
    onError: () => {}
  });

  // Use cached recommended items to prevent re-sorting during swipes
  const allItems = recommendedItems;

  // Apply filters to items
  const filteredItems = allItems.filter(item => {
    // Category filter
    if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(item.category)) {
      return false;
    }

    // Brand filter
    if (activeFilters.brands.length > 0 && !activeFilters.brands.includes(item.brand)) {
      return false;
    }

    // Price filter
    if (item.price < activeFilters.priceRange[0] || item.price > activeFilters.priceRange[1]) {
      return false;
    }

    // Tags filter
    if (activeFilters.tags.length > 0 && !activeFilters.tags.some(tag => item.tags.includes(tag))) {
      return false;
    }

    // Colors filter (check if any item color matches selected colors)
    if (activeFilters.colors.length > 0 && !activeFilters.colors.some(color => item.colors.includes(color))) {
      return false;
    }

    return true;
  });

  const currentItems = filteredItems;

  const handleSwipe = async (direction: 'like' | 'pass' | 'save') => {
    const currentItem = currentItems[currentIndex];

    // Record user interaction for recommendation engine
    recommendationEngine.recordInteraction(currentItem, direction);

    // Try backend action if authenticated, but don't block UI
    if (isAuthenticated && feedData?.items?.length > 0) {
      try {
        switch (direction) {
          case 'like':
            likeMutation.mutate(currentItem.id);
            break;
          case 'pass':
            passMutation.mutate(currentItem.id);
            break;
          case 'save':
            saveMutation.mutate(currentItem.id);
            break;
        }
      } catch (error) {
        // Silently handle errors, don't break the UI
      }
    }

    // Show toast feedback
    switch (direction) {
      case 'like':
        toast.success(`Liked ${currentItem.name}!`, {
          icon: <Heart className="w-4 h-4 fill-current text-like" />
        });
        break;
      case 'pass':
        toast(`Passed on ${currentItem.name}`, {
          icon: <X className="w-4 h-4 text-pass" />
        });
        break;
      case 'save':
        toast.success(`Saved ${currentItem.name}!`, {
          icon: <Bookmark className="w-4 h-4 fill-current text-save" />
        });
        break;
    }

    // Move to next item
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);

      // Load more items when running low
      if (currentIndex >= currentItems.length - 2) {
        loadMoreItems();
      }
    }, 300);
  };

  const loadMoreItems = () => {
    setIsLoading(true);

    // Refresh recommendations with current preferences
    const backendItems = feedData?.items ? feedData.items.map(formatItem) : [];
    const rawItems = backendItems.length > 0 ? backendItems : fallbackItems;
    const newRecommendations = recommendationEngine.recommendItems(rawItems);

    if (isAuthenticated && backendItems.length > 0) {
      // Try to fetch more from backend
      refetch().finally(() => {
        setRecommendedItems(newRecommendations);
        setCurrentIndex(0);
        setIsLoading(false);
      });
    } else {
      // Update recommendations with fallback data
      setTimeout(() => {
        setRecommendedItems(newRecommendations);
        setCurrentIndex(0);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleActionClick = (action: 'like' | 'pass' | 'save') => {
    handleSwipe(action);
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    setCurrentIndex(0); // Reset to start with filtered items
    toast.success("Filters applied!");
  };

  const hasActiveFilters = activeFilters.categories.length > 0 ||
                          activeFilters.brands.length > 0 ||
                          activeFilters.tags.length > 0 ||
                          activeFilters.colors.length > 0 ||
                          activeFilters.priceRange[0] > 0 ||
                          activeFilters.priceRange[1] < 500;

  // Show auth prompt if not authenticated and no fallback data
  if (!isAuthenticated && (!feedData?.items?.length) && currentIndex >= currentItems.length) {
    return (
      <div className="min-h-screen bg-background page-enter">
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <Heart className="w-24 h-24 text-primary mb-6" />
          <h2 className="text-2xl font-bold text-center mb-4">
            Welcome to Fashion Tinder!
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            Create an account to get personalized fashion recommendations and connect with friends.
          </p>
          <div className="space-y-4 w-full max-w-sm">
            <Button 
              onClick={() => window.open('/?register=true', '_self')}
              className="btn-primary w-full"
            >
              Sign Up
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('/?login=true', '_self')}
              className="w-full"
            >
              Log In
            </Button>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  // Show empty state when no more items
  if (currentIndex >= currentItems.length && !isLoading) {
    const hasFilters = hasActiveFilters;

    return (
      <div className="min-h-screen bg-background page-enter">
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <Sparkles className="w-24 h-24 text-primary mb-6" />
          <h2 className="text-2xl font-bold text-center mb-4">
            {hasFilters ? "No items match your filters!" : "You've seen everything!"}
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            {hasFilters
              ? "Try adjusting your filters to discover more fashion items."
              : "Great taste! Check back later for new fashion items or browse your saved favorites."
            }
          </p>
          <div className="flex gap-3">
            {hasFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  setActiveFilters({
                    categories: [],
                    brands: [],
                    priceRange: [0, 500],
                    colors: [],
                    tags: []
                  });
                  setCurrentIndex(0);
                  toast.success("Filters cleared!");
                }}
                className="btn-secondary"
              >
                Clear Filters
              </Button>
            )}
            <Button
              onClick={() => {
                if (hasFilters) {
                  // Reset filters first
                  setActiveFilters({
                    categories: [],
                    brands: [],
                    priceRange: [0, 500],
                    colors: [],
                    tags: []
                  });
                }
                loadMoreItems();
              }}
              className="btn-primary"
            >
              Discover More
            </Button>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-enter">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-12">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Fashion Tinder
          </h1>
          <p className="text-muted-foreground text-sm">Swipe your style</p>
        </div>
        <div className="flex items-center gap-2">
          <PreferencesInsight />
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full ${hasActiveFilters ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setShowFilters(true)}
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Swipe Area */}
      <div className="flex-1 flex items-center justify-center px-4 pb-32">
        <div className="relative w-[420px] h-[680px] card-stack">
          {/* Show next 3 cards */}
          {currentItems.slice(currentIndex, currentIndex + 3).map((item, index) => (
            <FashionCard
              key={item.id}
              item={item}
              onSwipe={index === 0 ? handleSwipe : () => {}}
              style={{
                zIndex: 30 - index * 10,
                transform: `scale(${1 - index * 0.05}) translateY(${index * 8}px)`,
              }}
            />
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-card rounded-2xl p-8 shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading more styles...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
        <Button
          size="lg"
          variant="outline"
          className="btn-pass w-14 h-14 rounded-full p-0 border-2"
          onClick={() => handleActionClick('pass')}
        >
          <X className="w-6 h-6" />
        </Button>
        
        <Button
          size="lg"
          className="btn-save w-12 h-12 rounded-full p-0"
          onClick={() => handleActionClick('save')}
        >
          <Bookmark className="w-5 h-5" />
        </Button>
        
        <Button
          size="lg"
          className="btn-like w-16 h-16 rounded-full p-0"
          onClick={() => handleActionClick('like')}
        >
          <Heart className="w-7 h-7" />
        </Button>
      </div>

      <Navigation />

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </div>
  );
}