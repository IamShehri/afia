/**
 * AFIA brand mark — "Graphite Atelier"
 * An abstract glyph that reads as both a lowercase "a" and an ECG/pulse stroke.
 * Single-color, scalable, no text. Color follows currentColor by default so it
 * adapts to context; pass `accent` to force AFIA Blue.
 */
import { cn } from "@/lib/utils";

export function AfiaMark({
  className,
  accent = true,
}: {
  className?: string;
  accent?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="9"
        className={cn(
          accent ? "fill-primary/12" : "fill-current/10",
        )}
      />
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8.5"
        className={accent ? "stroke-primary/30" : "stroke-current/20"}
        strokeWidth="1"
      />
      {/* pulse / "a" stroke */}
      <path
        d="M7 18.5h3.4l1.6-5.2 2.6 9 2.2-7 1.5 3.2H25"
        className={accent ? "stroke-primary" : "stroke-current"}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AfiaWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <AfiaMark className="size-[1.15em]" />
      <span className="lowercase">
        afia
        <span className="text-primary">.</span>
      </span>
    </span>
  );
}
