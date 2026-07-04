import { useRef, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/primitives";
import { Monogram } from "@/components/primitives";
import { ExternalSearchMenu } from "@/components/ExternalSearchMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Moon, Sun, LogOut, Settings } from "lucide-react";
import { useLocation } from "wouter";

export function TopBar() {
  const { setPaletteOpen } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = user?.email?.split("@")[0] ?? "User";
  const displayEmail = user?.email ?? "Signed in";

  const handleSignOut = async () => {
    await signOut();
    setLocation("/login");
  };

  return (
    <div className="flex h-12 items-center justify-between gap-4 border-b border-hairline bg-background px-4">
      {/* Left: search input + external literature */}
      <div className="flex h-8 flex-1 max-w-sm items-center rounded-md border border-hairline bg-surface transition-colors hover:border-hairline-strong">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
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
          onEmptyQuery={() => searchInputRef.current?.focus()}
        />
        <Kbd className="mr-2 hidden shrink-0 sm:inline">⌘K</Kbd>
      </div>

      {/* Right: theme + user menu */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => toggleTheme?.()}
          aria-label="Toggle theme"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open account menu"
              className="rounded-full"
            >
              <Monogram name={displayName} hue={210} size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="flex items-center gap-3 px-3 py-2">
              <Monogram name={displayName} hue={210} size={32} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {displayName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {displayEmail}
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setLocation("/settings")}
              className="cursor-pointer"
            >
              <Settings className="size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void handleSignOut()}
              className="cursor-pointer text-destructive"
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
