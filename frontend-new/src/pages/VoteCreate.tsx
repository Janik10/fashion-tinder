import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Bookmark, Shuffle, Copy, Share2, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Import fashion images
import fashion1 from "@/assets/fashion-1.jpg";
import fashion2 from "@/assets/fashion-2.jpg";
import fashion3 from "@/assets/fashion-3.jpg";
import fashion4 from "@/assets/fashion-4.jpg";
import fashion5 from "@/assets/fashion-5.jpg";

const availableItems = [
  {
    id: "1",
    name: "Vintage Denim Jacket",
    brand: "Urban Style Co.",
    price: 89,
    imageUrl: fashion1,
    category: "Outerwear"
  },
  {
    id: "2",
    name: "Floral Summer Dress",
    brand: "Bloom & Co",
    price: 125,
    imageUrl: fashion2,
    category: "Dresses"
  },
  {
    id: "3",
    name: "Classic White Sneakers",
    brand: "MinimalStep",
    price: 75,
    imageUrl: fashion3,
    category: "Shoes"
  },
  {
    id: "4",
    name: "Leather Crossbody Bag",
    brand: "Artisan Leather",
    price: 165,
    imageUrl: fashion4,
    category: "Accessories"
  },
  {
    id: "5",
    name: "Oversized Wool Sweater",
    brand: "Cozy Knits",
    price: 95,
    imageUrl: fashion5,
    category: "Sweaters"
  }
];

export default function VoteCreate() {
  const [step, setStep] = useState(1);
  const [selectionType, setSelectionType] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sessionCode, setSessionCode] = useState("");

  const handleSelectionType = (type: string) => {
    setSelectionType(type);
    if (type === "random") {
      // Auto-select random items
      const randomItems = availableItems
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(item => item.id);
      setSelectedItems(randomItems);
      setStep(3);
      createSession();
    } else {
      setStep(2);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const createSession = () => {
    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSessionCode(code);
    setStep(3);
    toast.success("Vote session created!");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    toast.success("Session code copied!");
  };

  const shareSession = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Fashion Vote Session',
        text: `Join my fashion vote session with code: ${sessionCode}`,
        url: window.location.origin + '/vote/join'
      });
    } else {
      copyCode();
    }
  };

  return (
    <div className="min-h-screen bg-background page-enter pb-20">
      {/* Header */}
      <header className="p-6 pt-12">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Vote Session</h1>
            <p className="text-muted-foreground">Let friends help you decide</p>
          </div>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= stepNum 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div 
                  className={`w-12 h-1 mx-2 rounded transition-colors ${
                    step > stepNum ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Step 1: Selection Type */}
      {step === 1 && (
        <div className="px-6">
          <h2 className="text-xl font-semibold mb-6">Choose items to vote on</h2>
          
          <div className="space-y-4">
            <Card 
              className="p-6 cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/30"
              onClick={() => handleSelectionType('liked')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-like/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-like" />
                </div>
                <div>
                  <h3 className="font-semibold">From Liked Items</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from items you've previously liked
                  </p>
                </div>
              </div>
            </Card>
            
            <Card 
              className="p-6 cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/30"
              onClick={() => handleSelectionType('saved')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-save/10 flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-save" />
                </div>
                <div>
                  <h3 className="font-semibold">From Saved Items</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from your saved favorites
                  </p>
                </div>
              </div>
            </Card>
            
            <Card 
              className="p-6 cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/30"
              onClick={() => handleSelectionType('random')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shuffle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Random Items</h3>
                  <p className="text-sm text-muted-foreground">
                    Let us pick trending items for you
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Item Selection */}
      {step === 2 && (
        <div className="px-6">
          <h2 className="text-xl font-semibold mb-6">
            Select items to vote on ({selectedItems.length}/5)
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {availableItems.map((item) => (
              <Card 
                key={item.id}
                className={`overflow-hidden cursor-pointer transition-all ${
                  selectedItems.includes(item.id) 
                    ? "ring-2 ring-primary shadow-lg" 
                    : "hover:shadow-md"
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="relative">
                  <img 
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                  
                  {selectedItems.includes(item.id) && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-primary-foreground fill-current" />
                      </div>
                    </div>
                  )}
                  
                  <Badge className="absolute top-2 left-2">
                    {item.category}
                  </Badge>
                </div>
                
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                  <p className="font-bold text-primary">${item.price}</p>
                </div>
              </Card>
            ))}
          </div>
          
          <Button 
            className="w-full btn-primary"
            onClick={createSession}
            disabled={selectedItems.length === 0}
          >
            Create Session ({selectedItems.length} items)
          </Button>
        </div>
      )}

      {/* Step 3: Session Created */}
      {step === 3 && (
        <div className="px-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Session Created!</h2>
            <p className="text-muted-foreground">
              Share this code with friends to let them join
            </p>
          </div>
          
          <Card className="p-8 mb-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Session Code</p>
            <div className="text-4xl font-mono font-bold text-primary mb-4 tracking-wider">
              {sessionCode}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={copyCode}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
              <Button 
                className="flex-1 btn-primary"
                onClick={shareSession}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </Card>
          
          <div className="space-y-3">
            <Button className="w-full btn-primary" size="lg">
              Start Voting
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setStep(1);
                setSelectedItems([]);
                setSessionCode("");
              }}
            >
              Create Another Session
            </Button>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}