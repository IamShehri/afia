import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shareOnLinkedIn, shareOnX, shareViaEmail } from "@/lib/social-share";
import { Share2, Linkedin, Twitter, Mail } from "lucide-react";

export interface ShareMenuProps {
  text: string;
  url: string;
  emailSubject?: string;
  /** Compact icon-only trigger for the top bar (32px). */
  variant?: "default" | "icon";
}

export function ShareMenu({
  text,
  url,
  emailSubject,
  variant = "default",
}: ShareMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Share"
            title="Share"
            className="size-8"
          >
            <Share2 className="size-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" aria-label="Share">
            <Share2 className="size-4" />
            Share
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => shareViaEmail(text, url, emailSubject)}
        >
          <Mail className="size-4" />
          Email summary
        </DropdownMenuItem>
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
