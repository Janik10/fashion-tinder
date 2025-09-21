import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    preferences: {
      style: user?.preferences?.style || '',
      size: user?.preferences?.size || '',
      brands: user?.preferences?.brands || []
    }
  });

  const availableBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gymshark', 'Forever21', 'Mango', 'Alo Yoga', 'Vuori', 'Cupshe', 'Edikted', 'NA-KD', 'Princess Polly'];
  const styleOptions = ['Casual', 'Formal', 'Sporty', 'Trendy', 'Minimalist', 'Bohemian', 'Vintage', 'Streetwear'];
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateProfile(data),
    onSuccess: (response) => {
      if (response.success) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully!');
        onClose();
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const toggleBrand = (brand: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        brands: prev.preferences.brands.includes(brand)
          ? prev.preferences.brands.filter(b => b !== brand)
          : [...prev.preferences.brands, brand]
      }
    }));
  };

  const handleSave = () => {
    updateProfileMutation.mutate({
      username: formData.username,
      email: formData.email,
      preferences: formData.preferences
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Edit Profile</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email"
              />
            </div>
          </div>

          {/* Style Preferences */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Style Preference</Label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map(style => (
                <Badge
                  key={style}
                  variant={formData.preferences.style === style ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, style }
                  }))}
                >
                  {style}
                </Badge>
              ))}
            </div>
          </div>

          {/* Size Preference */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Size Preference</Label>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map(size => (
                <Badge
                  key={size}
                  variant={formData.preferences.size === size ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, size }
                  }))}
                >
                  {size}
                </Badge>
              ))}
            </div>
          </div>

          {/* Favorite Brands */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Favorite Brands</Label>
            <div className="flex flex-wrap gap-2">
              {availableBrands.map(brand => (
                <Badge
                  key={brand}
                  variant={formData.preferences.brands.includes(brand) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleBrand(brand)}
                >
                  {brand}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Select your favorite brands to get personalized recommendations
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};