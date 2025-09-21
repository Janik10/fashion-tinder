import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bell,
  Moon,
  Trash2,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: {
      push: true
    },
    appearance: {
      darkMode: localStorage.getItem('darkMode') === 'true' || false
    }
  });

  // Apply dark mode to document
  useEffect(() => {
    if (settings.appearance.darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [settings.appearance.darkMode]);

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    toast.success("Setting updated");
  };

  const SettingRow = ({
    icon: Icon,
    title,
    description,
    children
  }: {
    icon: any;
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 flex-1">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background page-enter pb-20">
      {/* Header */}
      <header className="p-6 pt-12">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground">Manage your preferences</p>
      </header>

      <div className="px-6 space-y-6">
        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>

          <SettingRow
            icon={Bell}
            title="Push Notifications"
            description="Get notified about fashion items and updates"
          >
            <Switch
              checked={settings.notifications.push}
              onCheckedChange={(checked) => updateSetting('notifications', 'push', checked)}
            />
          </SettingRow>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>

          <SettingRow
            icon={Moon}
            title="Dark Mode"
            description="Switch to dark theme"
          >
            <Switch
              checked={settings.appearance.darkMode}
              onCheckedChange={(checked) => updateSetting('appearance', 'darkMode', checked)}
            />
          </SettingRow>
        </Card>


        {/* App Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">About</h3>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span>2025.01.15</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span>January 15, 2025</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Fashion Tinder © 2025
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Made with ❤️ for fashion lovers
            </p>
          </div>
        </Card>
      </div>

      <Navigation />
    </div>
  );
}