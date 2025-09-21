import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  colors: string[];
  tags: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export const FilterModal = ({ isOpen, onClose, onApplyFilters, currentFilters }: FilterModalProps) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const categories = ['Sports Bras', 'Crop Tops', 'Leggings', 'Shorts', 'Hoodies', 'Yoga Wear', 'Swimwear', 'Fashion', 'Athletic Wear'];
  const brands = ['Gymshark', 'Alo Yoga', 'Altard State', 'Cupshe', 'Edikted', 'Nakd', 'Princess Polly', 'Vuori'];
  const popularTags = ['casual', 'formal', 'vintage', 'summer', 'winter', 'minimalist', 'sporty', 'trendy'];
  const commonColors = ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF'];

  const toggleArrayFilter = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      categories: [],
      brands: [],
      priceRange: [0, 500] as [number, number],
      colors: [],
      tags: []
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={filters.categories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    categories: toggleArrayFilter(prev.categories, category)
                  }))}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Brands</h3>
            <div className="flex flex-wrap gap-2">
              {brands.map(brand => (
                <Badge
                  key={brand}
                  variant={filters.brands.includes(brand) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    brands: toggleArrayFilter(prev.brands, brand)
                  }))}
                >
                  {brand}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Price Range</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
                  }))}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [prev.priceRange[0], parseInt(e.target.value) || 500]
                  }))}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                $${filters.priceRange[0]} - ${filters.priceRange[1]}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Style Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    tags: toggleArrayFilter(prev.tags, tag)
                  }))}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {commonColors.map(color => (
                <div
                  key={color}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                    filters.colors.includes(color) ? 'border-primary border-4' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    colors: toggleArrayFilter(prev.colors, color)
                  }))}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Clear All
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};