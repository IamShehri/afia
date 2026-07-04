import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { searchPubMed, searchScholar } from "@/lib/external-search";
import { BookOpen, Globe, GraduationCap } from "lucide-react";

export interface ExternalSearchMenuProps {
  query: string;
  /** Called when the menu is opened with an empty query (e.g. focus the input). */
  onEmptyQuery?: () => void;
  trigger?: ReactNode;
  align?: "start" | "center" | "end";
}

export function ExternalSearchMenu({
  query,
  onEmptyQuery,
  trigger,
  align = "end",
}: ExternalSearchMenuProps) {
  const [open, setOpen] = useState(false);
  const trimmed = query.trim();

  const handleOpenChange = (next: boolean) => {
    if (next && !trimmed) {
      onEmptyQuery?.();
      return;
    }
    setOpen(next);
  };

  const runSearch = (search: (q: string) => void) => {
    if (!trimmed) return;
    search(trimmed);
    setOpen(false);
  };

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
