import {
  Search,
  Bell,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  PanelRight,
  Plus,
  LogOut,
  UserCog,
  CircleHelp,
} from "lucide-react";
import { useShell } from "@/stores/shell-store";
import { useTheme } from "@/app/providers/theme-provider";
import { findNavItem } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

function Breadcrumbs() {
  const { activeModule } = useShell();
  const item = findNavItem(activeModule);
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm"
    >
      <span className="text-muted-foreground">Mercy General</span>
      <ChevronRight className="size-3.5 text-muted-foreground/60" />
      <span className="font-medium text-foreground">{item?.label ?? "Workspace"}</span>
    </nav>
  );
}

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Toggle theme">
              {resolvedTheme === "dark" ? (
                <Moon className="size-[18px]" />
              ) : (
                <Sun className="size-[18px]" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Appearance</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={theme === "light"}
          onCheckedChange={() => setTheme("light")}
        >
          <Sun className="mr-2 size-4" /> Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "dark"}
          onCheckedChange={() => setTheme("dark")}
        >
          <Moon className="mr-2 size-4" /> Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "system"}
          onCheckedChange={() => setTheme("system")}
        >
          <Monitor className="mr-2 size-4" /> System
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CommandBar() {
  const {
    setPaletteOpen,
    toggleInspector,
    assistantOpen,
    toggleAssistant,
  } = useShell();

  return (
    <header className="drag-region flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur-xl">
      {/* macOS traffic-light spacer */}
      <div className="flex w-[68px] shrink-0 items-center gap-2 pl-1">
        <span className="size-3 rounded-full bg-destructive/80" />
        <span className="size-3 rounded-full bg-warning/80" />
        <span className="size-3 rounded-full bg-success/80" />
      </div>

      <div className="no-drag flex items-center gap-2">
        <Breadcrumbs />
      </div>

      {/* Global search / command */}
      <div className="no-drag mx-auto flex w-full max-w-lg items-center">
        <button
          onClick={() => setPaletteOpen(true)}
          className="group flex h-8 w-full items-center gap-2.5 rounded-md border border-border bg-surface px-3 text-sm text-muted-foreground shadow-soft transition-colors hover:border-border-strong hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="size-4" />
          <span>Search patients, orders, commands…</span>
          <Kbd className="ml-auto">⌘K</Kbd>
        </button>
      </div>

      {/* Right cluster */}
      <div className="no-drag flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Plus className="size-4" /> New
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create encounter</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={assistantOpen ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={toggleAssistant}
              aria-label="AI assistant"
              className={assistantOpen ? "text-primary" : ""}
            >
              <Sparkles className="size-[18px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            AI Assistant <Kbd>⌘J</Kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive ring-2 ring-background" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        <ThemeToggle />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleInspector}
              aria-label="Toggle inspector"
            >
              <PanelRight className="size-[18px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            Inspector <Kbd>⌘I</Kbd>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-8 ring-1 ring-border">
                <AvatarImage src="/avatars/clinician.png" alt="Dr. Elena Reyes" />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2.5 px-2.5 py-2">
              <Avatar className="size-9">
                <AvatarImage src="/avatars/clinician.png" alt="" />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  Dr. Elena Reyes
                </p>
                <p className="truncate text-2xs text-muted-foreground">
                  Attending · Cardiology
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCog className="size-4" /> Account settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CircleHelp className="size-4" /> Help & support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="size-4 !text-destructive" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
