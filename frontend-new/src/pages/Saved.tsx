import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

// Import fashion images as fallbacks
import fashion1 from "@/assets/fashion-1.jpg";
import fashion2 from "@/assets/fashion-2.jpg";
import fashion3 from "@/assets/fashion-3.jpg";
import fashion4 from "@/assets/fashion-4.jpg";

// Fallback saved items with real images
const fallbackSavedItems = [
  {
    id: "1",
    name: "Vintage Denim Jacket",
    brand: "Urban Style Co.",
    price: 89,
    imageUrl: fashion1,
    category: "Outerwear",
    savedAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Floral Summer Dress", 
    brand: "Bloom & Co",
    price: 125,
    imageUrl: fashion2,
    category: "Dresses",
    savedAt: "2024-01-14"
  },
  {
    id: "3",
    name: "Leather Crossbody Bag",
    brand: "Artisan Leather", 
    price: 165,
    imageUrl: fashion4,
    category: "Accessories",
    savedAt: "2024-01-12"
  },
  {
    id: "4",
    name: "Classic White Sneakers",
    brand: "MinimalStep",
    price: 75,
    imageUrl: fashion3, 
    category: "Shoes",
    savedAt: "2024-01-10"
  }
];

const categories = ["All", "Sports Bras", "Crop Tops", "Leggings", "Shorts", "Hoodies", "Yoga Wear", "Swimwear", "Fashion", "Athletic Wear"];

export default function Saved() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch saved items from backend or use fallback
  const { data: savedData } = useQuery({
    queryKey: ['saves'],
    queryFn: () => apiClient.getSavedItems(),
    enabled: isAuthenticated,
    retry: false,
  });

  // Format backend saved items
  const savedItems = savedData?.items ? savedData.items.map(({ item, savedAt }) => {
    // Generate diverse colors for saved items too
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
      const index = parseInt(item.id) || Math.floor(Math.random() * colorSets.length);
      return colorSets[index % colorSets.length];
    };

    return {
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : (item.price || 0),
      imageUrl: item.imageUrl || item.image_url || fallbackSavedItems[Math.floor(Math.random() * fallbackSavedItems.length)].imageUrl,
      category: item.category || 'Fashion',
      colors: item.colors && item.colors.length > 0 ? item.colors : generateColors(),
      savedAt: new Date(savedAt).toISOString().split('T')[0]
    };
  }) : fallbackSavedItems;

  // Filter items by selected category
  const filteredItems = selectedCategory === "All"
    ? savedItems
    : savedItems.filter(item => item.category === selectedCategory);

  // Mutations for actions
  const removeMutation = useMutation({
    mutationFn: (itemId: string) => apiClient.unsaveItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saves'] });
    },
    onError: () => {} // Silently fail, keep UI working
  });

  const handleRemoveItem = (itemId: string, itemName: string) => {
    if (isAuthenticated) {
      removeMutation.mutate(itemId);
    }
    toast.success(`Removed ${itemName} from saved items`);
  };

  const handleShareItem = (itemName: string) => {
    // Simple share functionality - could be enhanced with actual sharing
    if (navigator.share) {
      navigator.share({
        title: `Check out this fashion item: ${itemName}`,
        text: `I found this amazing piece on Fashion Tinder: ${itemName}`,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`Check out this fashion item: ${itemName}`);
      toast.success(`${itemName} link copied to clipboard!`);
    }
  };

  return (
    <div className="min-h-screen bg-background page-enter pb-20">
      {/* Header */}
      <header className="p-6 pt-12">
        <h1 className="text-3xl font-bold mb-2">Saved Items</h1>
        <p className="text-muted-foreground">Your fashion favorites</p>
      </header>

      {/* Category Filter */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === selectedCategory ? "default" : "secondary"}
              className="whitespace-nowrap cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="px-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <img 
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full w-10 h-10 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={() => handleShareItem(item.name)}
                  >
                    <Share2 className="w-4 h-4 text-white" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full w-10 h-10 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={() => toast.success(`Kept ${item.name} in saved items!`)}
                  >
                    <Bookmark className="w-4 h-4 text-white" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full w-10 h-10 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={() => handleRemoveItem(item.id, item.name)}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </Button>
                </div>

                {/* Category Badge */}
                <Badge className="absolute top-2 left-2 bg-black/50 text-white">
                  {item.category}
                </Badge>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{item.brand}</p>
                <p className="font-bold text-primary">${item.price}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {selectedCategory === "All" ? "No saved items yet" : `No ${selectedCategory} items saved`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {selectedCategory === "All"
                ? "Start swiping and save items you love!"
                : `Try browsing other categories or save some ${selectedCategory} items.`
              }
            </p>
            {selectedCategory !== "All" && (
              <Button
                variant="outline"
                onClick={() => setSelectedCategory("All")}
                className="mr-3"
              >
                View All Items
              </Button>
            )}
            <Button className="btn-primary">
              Discover Fashion
            </Button>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}