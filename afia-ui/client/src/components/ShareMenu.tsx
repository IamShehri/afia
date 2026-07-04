import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shareOnLinkedIn, shareOnX } from "@/lib/social-share";
import { Share2, Linkedin, Twitter } from "lucide-react";

export interface ShareMenuProps {
  text: string;
  url: string;
}

export function ShareMenu({ text, url }: ShareMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Share">
          <Share2 className="size-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => shareOnLinkedIn(url)}
        >
          <Linkedin className="size-4" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => shareOnX(text, url)}
        >
          <Twitter className="size-4" />
          X
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
