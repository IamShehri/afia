import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { searchPubMed, searchScholar } from "@/lib/external-search";
import { BookOpen, Globe, GraduationCap, Search } from "lucide-react";

export interface ExternalSearchMenuProps {
  query: string;
  /** Called when the menu is opened with an empty query (e.g. focus the input). */
  onEmptyQuery?: () => void;
  /** When set, menu leads with "Search AFIA" and nests literature under a submenu (top bar). */
  onSearchAfia?: () => void;
  trigger?: ReactNode;
  align?: "start" | "center" | "end";
}

export function ExternalSearchMenu({
  query,
  onEmptyQuery,
  onSearchAfia,
  trigger,
  align = "end",
}: ExternalSearchMenuProps) {
  const [open, setOpen] = useState(false);
  const trimmed = query.trim();

  const handleOpenChange = (next: boolean) => {
    if (next && !trimmed && !onSearchAfia) {
      onEmptyQuery?.();
      return;
    }
    setOpen(next);
  };

  const runSearch = (search: (q: string) => void) => {
    if (!trimmed) {
      onEmptyQuery?.();
      return;
    }
    search(trimmed);
    setOpen(false);
  };

  const handleSearchAfia = () => {
    onSearchAfia?.();
    setOpen(false);
  };

  const literatureItems = (
    <>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => runSearch(searchPubMed)}
      >
        <BookOpen className="size-4" />
        Search PubMed
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => runSearch(searchScholar)}
      >
        <GraduationCap className="size-4" />
        Search Google Scholar
      </DropdownMenuItem>
    </>
  );

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Search external literature"
            title="Search PubMed or Google Scholar"
          >
            <Globe className="size-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {onSearchAfia ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleSearchAfia}
            >
              <Search className="size-4" />
              Search AFIA
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Globe className="size-4" />
                Search literature
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>{literatureItems}</DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        ) : (
          literatureItems
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
