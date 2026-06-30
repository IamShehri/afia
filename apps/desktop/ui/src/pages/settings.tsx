import { useState } from "react";
import { Bell, Monitor, Moon, Palette, ShieldCheck, Sun, User } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState("profile");
  const [notifs, setNotifs] = useState({ critical: true, mentions: true, digest: false });

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-5 p-5 lg:p-6">
      <PageHeader title="Settings" description="Manage your account, workspace, and preferences." />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        {/* Section nav */}
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active === s.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex flex-col gap-5">
          {active === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>This information is visible to your care team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
                    DL
                  </div>
                  <Button variant="outline" size="sm">
                    Change photo
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Full name</label>
                    <Input defaultValue="Dr. Marcus Lin" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Role</label>
                    <Input defaultValue="Attending Physician" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Work email</label>
                    <Input defaultValue="dr.lin@afia.health" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Department</label>
                    <Input defaultValue="Internal Medicine" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                  <Button size="sm">Save changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how AFIA looks on this device.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setTheme(opt.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                            theme === opt.value
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border text-muted-foreground hover:border-muted-foreground/40",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what you want to be alerted about.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {[
                  { key: "critical" as const, label: "Critical patient alerts", desc: "Vitals out of range, new critical labs." },
                  { key: "mentions" as const, label: "Mentions & assignments", desc: "When a colleague tags you on a case." },
                  { key: "digest" as const, label: "Daily digest", desc: "A morning summary of your panel." },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <Toggle
                      checked={notifs[item.key]}
                      onChange={(v) => setNotifs((n) => ({ ...n, [item.key]: v }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Keep your clinical account protected.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <div className="text-sm font-medium">Two-factor authentication</div>
                    <div className="text-xs text-muted-foreground">Add an extra layer of security.</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <div className="text-sm font-medium">Active sessions</div>
                    <div className="text-xs text-muted-foreground">3 devices currently signed in.</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
