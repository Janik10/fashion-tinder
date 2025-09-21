import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

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

const categories = ["All", "Outerwear", "Dresses", "Shoes", "Accessories"];

export default function Saved() {
  const { isAuthenticated } = useAuth();

  // Fetch saved items from backend or use fallback
  const { data: savedData } = useQuery({
    queryKey: ['saves'],
    queryFn: () => apiClient.getSavedItems(),
    enabled: isAuthenticated,
    retry: false,
  });

  // Format backend saved items or use fallback
  const backendSavedItems = savedData?.items ? savedData.items.map(({ item, savedAt }) => ({
    id: item.id,
    name: item.name,
    brand: item.brand,
    price: typeof item.price === 'string' ? parseInt(item.price) : item.price,
    imageUrl: item.images[0] || fallbackSavedItems[Math.floor(Math.random() * fallbackSavedItems.length)].imageUrl,
    category: item.category || 'Fashion',
    savedAt: new Date(savedAt).toISOString().split('T')[0]
  })) : [];

  const savedItems = backendSavedItems.length > 0 ? backendSavedItems : fallbackSavedItems;

  const handleRemoveItem = (itemId: string, itemName: string) => {
    toast.success(`Removed ${itemName} from saved items`);
  };

  const handleShareItem = (itemName: string) => {
    toast.success(`Shared ${itemName}!`);
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
              variant={category === "All" ? "default" : "secondary"}
              className="whitespace-nowrap cursor-pointer hover:scale-105 transition-transform"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="px-6">
        <div className="grid grid-cols-2 gap-4">
          {savedItems.map((item) => (
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
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full w-10 h-10 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={() => handleRemoveItem(item.id, item.name)}
                  >
                    <X className="w-4 h-4 text-white" />
                  </Button>
                </div>

                {/* Category Badge */}
                <Badge className="absolute top-2 left-2 bg-black/50 text-white">
                  {item.category}
                </Badge>

                {/* Like Button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 bg-white/20 backdrop-blur-sm"
                >
                  <Heart className="w-4 h-4 text-white" />
                </Button>
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
        {savedItems.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No saved items yet</h3>
            <p className="text-muted-foreground mb-6">
              Start swiping and save items you love!
            </p>
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