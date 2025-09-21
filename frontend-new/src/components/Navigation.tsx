import { Heart, Bookmark, Users, User, Home, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Discover', href: '/', icon: Home },
  { name: 'Saved', href: '/saved', icon: Bookmark },
  { name: 'Friends', href: '/friends', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around px-4 py-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10 scale-110" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Floating Action Button for Vote Sessions */}
      <Link
        to="/vote/create"
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 btn-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </nav>
  );
};