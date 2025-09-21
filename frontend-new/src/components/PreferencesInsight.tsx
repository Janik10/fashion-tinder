import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, TrendingUp, Palette, Tag, RotateCcw } from "lucide-react";
import { recommendationEngine } from "@/services/recommendationEngine";
import { toast } from "sonner";

export const PreferencesInsight = () => {
  const [isOpen, setIsOpen] = useState(false);
  const preferences = recommendationEngine.getTopPreferences();

  const handleResetPreferences = () => {
    recommendationEngine.resetPreferences();
    toast.success("Your preferences have been reset!");
    setIsOpen(false);
  };

  const hasPreferences = preferences.categories.length > 0 ||
                        preferences.brands.length > 0 ||
                        preferences.colors.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full ${hasPreferences ? 'bg-primary/10 border-primary' : ''}`}
        >
          <Brain className="w-4 h-4 mr-2" />
          AI Insights
          {hasPreferences && (
            <div className="w-2 h-2 bg-primary rounded-full ml-1" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Your Fashion Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!hasPreferences ? (
            <div className="text-center py-8">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Learning Your Style</h3>
              <p className="text-muted-foreground text-sm">
                Keep swiping! Our AI is learning your preferences with each like, save, and pass.
              </p>
            </div>
          ) : (
            <>
              {/* Categories */}
              {preferences.categories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Favorite Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {preferences.categories.map(({ name, score }) => (
                      <Badge
                        key={name}
                        variant="secondary"
                        className="text-xs"
                      >
                        {name}
                        <span className="ml-1 text-primary font-semibold">
                          +{score}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {preferences.brands.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Favorite Brands
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {preferences.brands.map(({ name, score }) => (
                      <Badge
                        key={name}
                        variant="outline"
                        className="text-xs"
                      >
                        {name}
                        <span className="ml-1 text-primary font-semibold">
                          +{score}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {preferences.colors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Favorite Colors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {preferences.colors.map(({ color, score }) => (
                      <div
                        key={color}
                        className="flex items-center gap-1 text-xs"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-primary font-semibold">
                          +{score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Card className="p-4 bg-muted/50">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">How it works</p>
                    <p className="text-muted-foreground">
                      Our AI learns from your swipes: saves (+3 points), likes (+2 points),
                      and passes (-1 point). Items matching your preferences appear first!
                    </p>
                  </div>
                </div>
              </Card>

              {/* Reset Button */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetPreferences}
                  className="w-full text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Preferences
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};