import { useState } from "react";
import { Redirect, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser } from "@/data/clinicians";
import { Monogram, PageHeader } from "@/components/primitives";
import { ColorThemePicker } from "@/components/settings/ColorThemePicker";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamWorkspace } from "@/contexts/TeamWorkspaceContext";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Palette,
  SlidersHorizontal,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export const SETTINGS_SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "workspace", label: "Workspace", icon: Users },
  { id: "advanced", label: "Advanced", icon: SlidersHorizontal },
] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]["id"];

function isSettingsSection(value: string | undefined): value is SettingsSection {
  return SETTINGS_SECTIONS.some((section) => section.id === value);
}

function SettingsNav({
  active,
  onSelect,
}: {
  active: SettingsSection;
  onSelect: (id: SettingsSection) => void;
}) {
  return (
    <nav
      aria-label="Settings sections"
      className="flex w-full flex-col gap-0.5 lg:w-52 lg:shrink-0"
    >
      {SETTINGS_SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onSelect(section.id)}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
            active === section.id
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-elevated hover:text-foreground",
          )}
        >
          <section.icon className="size-4 shrink-0 opacity-80" />
          {section.label}
        </button>
      ))}
    </nav>
  );
}

function SettingsSectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-hairline pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

function AccountSettings() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();

  const displayEmail = user?.email ?? "Not signed in";

  const handleSignOut = async () => {
    await signOut();
    setLocation("/login");
  };

  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title="Profile"
        description="Your AFIA pilot account and clinical workspace identity."
      >
        <div className="flex items-start gap-4">
          <Monogram name={currentUser.name} size={48} />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="font-semibold">{currentUser.name}</div>
            <div className="text-sm text-muted-foreground">
              {currentUser.role} · {currentUser.specialty}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {displayEmail}
            </div>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Session"
        description="Sign out on shared or clinical workstations."
      >
        <Button variant="outline" size="sm" onClick={() => void handleSignOut()}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </SettingsSectionCard>
    </div>
  );
}

function AppearanceSettings() {
  const { colorMode, toggleColorMode, switchable } = useTheme();

  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title="Color palette"
        description="Research palettes for charts and accents. Clinical warning and danger colors stay fixed."
      >
        <ColorThemePicker />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Theme mode"
        description="Light or dark appearance for the workspace shell."
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="settings-color-mode">Dark mode</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              {colorMode === "dark"
                ? "Dark mode is enabled"
                : "Light mode is enabled"}
            </p>
          </div>
          <Switch
            id="settings-color-mode"
            checked={colorMode === "dark"}
            onCheckedChange={() => toggleColorMode?.()}
            disabled={!switchable}
          />
        </div>
      </SettingsSectionCard>
    </div>
  );
}

function WorkspaceSettingsPanel() {
  const [, setLocation] = useLocation();
  const {
    activeWorkspaceId,
    setActiveWorkspaceId,
    workspaces,
    activeWorkspace,
    createWorkspace,
  } = useTeamWorkspace();
  const [creating, setCreating] = useState(false);

  const handleQuickCreate = async () => {
    const name = window.prompt("Workspace name");
    if (!name?.trim()) return;
    setCreating(true);
    try {
      await createWorkspace(name.trim());
      toast.success("Workspace created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title="Active library"
        description="Documents and analytics filter by the workspace selected in the top bar."
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-surface px-3 py-2.5">
            <div>
              <div className="text-sm font-medium">
                {activeWorkspace?.name ?? "Personal"}
              </div>
              <div className="text-xs text-muted-foreground">
                {activeWorkspaceId
                  ? `${activeWorkspace?.myRole ?? "member"} access`
                  : "Private documents only"}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveWorkspaceId(null)}
              disabled={activeWorkspaceId === null}
            >
              Use Personal
            </Button>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Team workspaces"
        description="Shared libraries for collaborative research."
      >
        {workspaces.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No team workspaces yet. Create one to share documents with colleagues.
          </p>
        ) : (
          <ul className="divide-y divide-hairline rounded-md border border-hairline">
            {workspaces.map((workspace) => (
              <li
                key={workspace.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {workspace.name}
                  </div>
                  <div className="text-xs capitalize text-muted-foreground">
                    {workspace.myRole}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation(`/workspace/${workspace.id}`)}
                >
                  Manage
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button
          className="mt-4"
          variant="outline"
          size="sm"
          disabled={creating}
          onClick={() => void handleQuickCreate()}
        >
          Create workspace
        </Button>
      </SettingsSectionCard>
    </div>
  );
}

function AdvancedSettings() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title="Notifications"
        description="Pilot alerts and workspace activity (coming soon)."
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="settings-notifications">Email alerts</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Critical patient and workspace events
            </p>
          </div>
          <Switch
            id="settings-notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="About"
        description="Local-first analysis — documents stay encrypted on your infrastructure."
      >
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Product</dt>
            <dd className="font-medium">AFIA v1.0</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Build</dt>
            <dd className="font-mono text-xs">pilot</dd>
          </div>
        </dl>
      </SettingsSectionCard>
    </div>
  );
}

const SECTION_META: Record<
  SettingsSection,
  { title: string; subtitle: string; icon: LucideIcon }
> = {
  account: {
    title: "Account",
    subtitle: "Profile, email, and session",
    icon: User,
  },
  appearance: {
    title: "Appearance",
    subtitle: "Theme, palette, and display",
    icon: Palette,
  },
  workspace: {
    title: "Workspace",
    subtitle: "Personal vs team libraries",
    icon: Users,
  },
  advanced: {
    title: "Advanced",
    subtitle: "Notifications and system info",
    icon: SlidersHorizontal,
  },
};

function SettingsContent({ section }: { section: SettingsSection }) {
  switch (section) {
    case "account":
      return <AccountSettings />;
    case "appearance":
      return <AppearanceSettings />;
    case "workspace":
      return <WorkspaceSettingsPanel />;
    case "advanced":
      return <AdvancedSettings />;
    default:
      return null;
  }
}

export default function Settings() {
  const params = useParams<{ section?: string }>();
  const [, setLocation] = useLocation();

  if (!params.section) {
    return <Redirect to="/settings/account" />;
  }

  if (!isSettingsSection(params.section)) {
    return <Redirect to="/settings/account" />;
  }

  const section = params.section;
  const meta = SECTION_META[section];

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-hairline px-6 py-4">
        <PageHeader title="Settings" subtitle="Manage your account and workspace" />
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-auto p-6 lg:flex-row lg:gap-8">
        <SettingsNav
          active={section}
          onSelect={(id) => setLocation(`/settings/${id}`)}
        />

        <div className="min-w-0 flex-1 lg:max-w-2xl">
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight">{meta.title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>
          <SettingsContent section={section} />
        </div>
      </div>
    </div>
  );
}
