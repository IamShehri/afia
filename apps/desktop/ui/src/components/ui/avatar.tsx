import { cn, initialsFromName } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  status?: "online" | "busy" | "away" | "offline";
}

const sizeMap = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

const statusColor = {
  online: "bg-success",
  busy: "bg-destructive",
  away: "bg-warning",
  offline: "bg-muted-foreground",
};

export function Avatar({ name, src, size = "md", className, status }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/70 font-semibold text-primary-foreground ring-1 ring-inset ring-white/10 overflow-hidden",
          sizeMap[size],
        )}
      >
        {src ? (
          <img src={src || "/placeholder.svg"} alt={name} className="h-full w-full object-cover" />
        ) : (
          initialsFromName(name)
        )}
      </span>
      {status && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
            statusColor[status],
          )}
          aria-label={status}
        />
      )}
    </span>
  );
}
