import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { currentUser } from "@/data/clinicians";
import { Monogram, PageHeader } from "@/components/primitives";
import { ColorThemePicker } from "@/components/settings/ColorThemePicker";
import { useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
  const { colorMode, toggleColorMode, switchable } = useTheme();
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
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Color palette</Label>
                <p className="mt-1 mb-3 text-xs text-muted-foreground">
                  Choose a research palette. Clinical warning and danger colors
                  stay consistent across palettes.
                </p>
                <ColorThemePicker />
              </div>

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
                  <Label htmlFor="color-mode">Appearance</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {colorMode === "dark"
                      ? "Dark mode is currently enabled"
                      : "Light mode is currently enabled"}
                  </p>
                </div>
                <Switch
                  id="color-mode"
                  checked={colorMode === "dark"}
                  onCheckedChange={() => toggleColorMode?.()}
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
