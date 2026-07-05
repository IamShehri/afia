import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/primitives";
import { ExternalSearchMenu } from "@/components/ExternalSearchMenu";
import { WorkspaceSwitcher } from "@/components/shell/WorkspaceSwitcher";
import { AccountMenu } from "@/components/shell/AccountMenu";
import { ShareMenu } from "@/components/ShareMenu";
import { AfiaWordmark } from "@/components/brand/AfiaMark";
import { APP_PUBLIC_URL } from "@/const";
import { HOME_SHARE_TEXT } from "@/lib/social-share";
import {
  studioNav,
  labNav,
  isNavItemActive,
} from "@/data/nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Moon, Sun, ChevronDown, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function NavMenuDropdown({
  label,
  items,
  location,
  onNavigate,
}: {
  label: string;
  items: typeof studioNav;
  location: string;
  onNavigate: (href: string) => void;
}) {
  const isActive = items.some((item) => isNavItemActive(location, item.href));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="sm"
          className={cn("gap-1 px-2.5 font-medium", isActive && "text-foreground")}
        >
          {label}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => onNavigate(item.href)}
            className={cn(
              "cursor-pointer gap-2",
              isNavItemActive(location, item.href) && "bg-accent",
            )}
          >
            <item.icon className="size-4 shrink-0 opacity-80" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopBar() {
  const { setPaletteOpen } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const openAfiaSearch = () => {
    setPaletteOpen(true);
  };

  const focusSearchInput = () => {
    searchInputRef.current?.focus();
  };

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-hairline bg-background px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation("/")}
        className="shrink-0 gap-2 px-2"
        aria-label="AFIA home"
      >
        <AfiaWordmark className="text-primary" />
      </Button>

      <WorkspaceSwitcher />

      <NavMenuDropdown
        label="Studio"
        items={studioNav}
        location={location}
        onNavigate={setLocation}
      />
      <NavMenuDropdown
        label="Lab"
        items={labNav}
        location={location}
        onNavigate={setLocation}
      />

      <div className="flex h-8 min-w-0 max-w-md flex-1 items-center rounded-md border border-hairline bg-surface transition-colors hover:border-hairline-strong">
        <button
          type="button"
          onClick={openAfiaSearch}
          className="flex shrink-0 items-center pl-3 press"
          aria-label="Open command palette"
          title="Open command palette (⌘K)"
        >
          <Search className="size-4 opacity-60" />
        </button>
        <input
          ref={searchInputRef}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patients, actions…"
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <ExternalSearchMenu
          query={searchQuery}
          onEmptyQuery={focusSearchInput}
          onSearchAfia={openAfiaSearch}
          align="start"
        />
        <Kbd className="mr-2 hidden shrink-0 sm:inline">⌘K</Kbd>
      </div>

      {/* Right cluster (right→left: account · notifications · theme · share) */}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <ShareMenu
          text={HOME_SHARE_TEXT}
          url={APP_PUBLIC_URL}
          variant="icon"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8"
          onClick={() => toggleTheme?.()}
          aria-label="Toggle appearance"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8"
          aria-label="Notifications"
          title="Notifications (coming soon)"
          onClick={() => toast.message("Notifications coming soon")}
        >
          <Bell className="size-4" />
        </Button>
        <AccountMenu />
      </div>
    </div>
  );
}
