import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, MessageCircle, Vote, Users, Search } from "lucide-react";
import { toast } from "sonner";

// Mock friends data
const friends = [
  {
    id: "1",
    username: "styleQueen",
    email: "sarah@example.com",
    avatar: "/api/placeholder/60/60",
    compatibility: {
      score: 87,
      sharedLikes: 24,
      totalInteractions: 156
    },
    status: "online"
  },
  {
    id: "2", 
    username: "fashionista_mike",
    email: "mike@example.com",
    avatar: "/api/placeholder/60/60",
    compatibility: {
      score: 72,
      sharedLikes: 18,
      totalInteractions: 89
    },
    status: "offline"
  },
  {
    id: "3",
    username: "vintageVibes",
    email: "alex@example.com", 
    avatar: "/api/placeholder/60/60",
    compatibility: {
      score: 64,
      sharedLikes: 12,
      totalInteractions: 67
    },
    status: "online"
  }
];

const pendingRequests = [
  {
    id: "4",
    username: "trendSetter22",
    avatar: "/api/placeholder/60/60",
    mutualFriends: 3
  }
];

export default function Friends() {
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "bg-like text-like-foreground";
    if (score >= 60) return "bg-yellow-500 text-white";
    if (score >= 40) return "bg-orange-500 text-white"; 
    return "bg-pass text-pass-foreground";
  };

  const handleAcceptRequest = (username: string) => {
    toast.success(`Added ${username} as a friend!`);
  };

  const handleStartVoteSession = (username: string) => {
    toast.success(`Started vote session with ${username}!`);
  };

  return (
    <div className="min-h-screen bg-background page-enter pb-20">
      {/* Header */}
      <header className="p-6 pt-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Friends</h1>
          <Button className="btn-primary" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friend
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Search friends..."
            className="pl-10 rounded-full"
          />
        </div>
      </header>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friend Requests
          </h2>
          
          {pendingRequests.map((request) => (
            <Card key={request.id} className="p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.avatar} />
                    <AvatarFallback>{request.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{request.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.mutualFriends} mutual friends
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="btn-like"
                    onClick={() => handleAcceptRequest(request.username)}
                  >
                    Accept
                  </Button>
                  <Button size="sm" variant="outline">
                    Decline
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Friends List */}
      <div className="px-6">
        <h2 className="text-lg font-semibold mb-3">
          My Friends ({friends.length})
        </h2>
        
        <div className="space-y-3">
          {friends.map((friend) => (
            <Card key={friend.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {friend.status === "online" && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-like rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold">{friend.username}</p>
                    <p className="text-sm text-muted-foreground mb-2">{friend.email}</p>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getCompatibilityColor(friend.compatibility.score)}>
                        {friend.compatibility.score}% match
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {friend.compatibility.sharedLikes} shared likes
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                  <Button 
                    size="sm" 
                    className="btn-primary w-full"
                    onClick={() => handleStartVoteSession(friend.username)}
                  >
                    <Vote className="w-4 h-4 mr-1" />
                    Vote
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {friends.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No friends yet</h3>
            <p className="text-muted-foreground mb-6">
              Connect with friends to discover fashion together!
            </p>
            <Button className="btn-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Find Friends
            </Button>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}