import { Navigation } from "@/components/Navigation";
import { EditProfileModal } from "@/components/EditProfileModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Heart, Bookmark, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Fetch user's saved items to calculate stats
  const { data: savedData } = useQuery({
    queryKey: ['saves'],
    queryFn: () => apiClient.getSavedItems(),
    enabled: isAuthenticated,
    retry: false,
  });

  const handleLogout = () => {
    logout();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  // Calculate user stats from saved items
  const stats = {
    totalLikes: savedData?.items?.filter(item => item.action === 'like').length || 0,
    totalSaves: savedData?.items?.filter(item => item.action === 'save').length || 0
  };

  if (!isAuthenticated || !user) {
    navigate("/auth");
    return null;
  }

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
        </div>
      </header>

      {/* Profile Info */}
      <div className="px-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || "/api/placeholder/120/120"} />
              <AvatarFallback className="text-2xl">{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs sm:text-sm px-2 sm:px-3"
                onClick={() => setShowEditProfile(true)}
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
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
            value={stats.totalLikes}
            color="text-like"
          />
          <StatCard
            icon={Bookmark}
            label="Items Saved"
            value={stats.totalSaves}
            color="text-save"
          />
        </div>
      </div>

      {/* Recent Liked/Saved Items */}
      <div className="px-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

          {savedData?.items && savedData.items.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                {savedData.items.slice(0, 4).map(({ item, savedAt, action }) => (
                  <div key={`${item.id}-${action}`} className="relative group">
                    <img
                      src={item.imageUrl || item.image_url || "/api/placeholder/120/120"}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-1 right-1">
                      <Badge variant={action === 'like' ? 'destructive' : 'secondary'} className="text-xs px-1 py-0">
                        {action === 'like' ? <Heart className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="text-white text-center text-xs">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-xs opacity-75">{item.brand}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {savedData.items.length > 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/saved')}
                >
                  View All {savedData.items.length} Items
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="flex justify-center space-x-2 mb-3">
                <Heart className="w-8 h-8 text-muted-foreground" />
                <Bookmark className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-3">
                No liked or saved items yet
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Start Discovering Fashion
              </Button>
            </div>
          )}
        </Card>
      </div>


      {/* Account Actions */}
      <div className="px-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account</h3>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/settings')}
            >
              <Edit className="w-4 h-4 mr-3" />
              Settings
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </div>
  );
}