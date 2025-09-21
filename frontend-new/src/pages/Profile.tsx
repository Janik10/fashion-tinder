import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, Edit, Heart, Bookmark, Users, TrendingUp, LogOut } from "lucide-react";
import { toast } from "sonner";

// Mock user data
const user = {
  id: "1",
  username: "fashionLover",
  email: "fashion@example.com",
  avatar: "/api/placeholder/120/120",
  preferences: {
    favoriteBrands: ["Zara", "H&M", "Urban Outfitters", "Nike"],
    preferredCategories: ["Casual", "Streetwear", "Vintage"],
    favoriteColors: ["Black", "White", "Denim Blue"],
    budgetRange: { min: 50, max: 200 }
  },
  stats: {
    totalLikes: 156,
    totalSaves: 34,
    totalPasses: 89,
    friendsCount: 12,
    voteSessionsJoined: 8
  }
};

export default function Profile() {
  const handleLogout = () => {
    toast.success("Logged out successfully");
  };

  const StatCard = ({ icon: Icon, label, value, color = "text-primary" }: any) => (
    <Card className="p-4 text-center hover:shadow-md transition-shadow">
      <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background page-enter pb-20">
      {/* Header */}
      <header className="p-6 pt-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button variant="outline" size="icon" className="rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Profile Info */}
      <div className="px-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              <Button size="sm" variant="outline" className="rounded-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Your Fashion Journey</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <StatCard 
            icon={Heart} 
            label="Items Liked" 
            value={user.stats.totalLikes}
            color="text-like"
          />
          <StatCard 
            icon={Bookmark} 
            label="Items Saved" 
            value={user.stats.totalSaves}
            color="text-save"
          />
          <StatCard 
            icon={Users} 
            label="Friends" 
            value={user.stats.friendsCount}
            color="text-primary"
          />
          <StatCard 
            icon={TrendingUp} 
            label="Vote Sessions" 
            value={user.stats.voteSessionsJoined}
            color="text-accent"
          />
        </div>
      </div>

      {/* Style Preferences */}
      <div className="px-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Style Preferences</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Favorite Brands</p>
              <div className="flex flex-wrap gap-2">
                {user.preferences.favoriteBrands.map((brand) => (
                  <Badge key={brand} variant="secondary">{brand}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Preferred Categories</p>
              <div className="flex flex-wrap gap-2">
                {user.preferences.preferredCategories.map((category) => (
                  <Badge key={category} variant="outline">{category}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Favorite Colors</p>
              <div className="flex flex-wrap gap-2">
                {user.preferences.favoriteColors.map((color) => (
                  <Badge key={color} className="bg-muted">{color}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Budget Range</p>
              <Badge className="bg-primary/10 text-primary">
                ${user.preferences.budgetRange.min} - ${user.preferences.budgetRange.max}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Actions */}
      <div className="px-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account</h3>
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Heart className="w-4 h-4 mr-3" />
              Privacy & Security
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-3" />
              Help & Support
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </Card>
      </div>

      <Navigation />
    </div>
  );
}