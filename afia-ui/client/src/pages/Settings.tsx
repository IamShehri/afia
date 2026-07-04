import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { currentUser } from "@/data/clinicians";
import { Monogram, PageHeader } from "@/components/primitives";
import { useTheme } from "@/contexts/ThemeContext";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { theme, toggleTheme, switchable } = useTheme();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-hairline px-6 py-4">
        <PageHeader
          title="Settings"
          subtitle="Manage your account and preferences"
        />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <Card>
              <CardContent className="flex items-center gap-4">
                <Monogram name={currentUser.name} size={48} />
                <div>
                  <div className="font-semibold">{currentUser.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentUser.role} • {currentUser.specialty}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Preferences</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receive alerts for critical patients
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {theme === "dark"
                      ? "Dark mode is currently enabled"
                      : "Light mode is currently enabled"}
                  </p>
                </div>
                <Switch
                  id="theme"
                  checked={theme === "dark"}
                  onCheckedChange={() => toggleTheme?.()}
                  disabled={!switchable}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
