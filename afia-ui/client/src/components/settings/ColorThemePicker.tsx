import { cn } from "@/lib/utils";
import {
  COLOR_THEME_OPTIONS,
  type ColorTheme,
} from "@/lib/color-themes";
import { useTheme } from "@/contexts/ThemeContext";
import { Check } from "lucide-react";

export function ColorThemePicker() {
  const { colorTheme, setColorTheme, switchable } = useTheme();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {COLOR_THEME_OPTIONS.map((option) => {
        const selected = colorTheme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={!switchable}
            onClick={() => setColorTheme(option.id as ColorTheme)}
            className={cn(
              "relative rounded-lg border p-4 text-left transition-colors",
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-hairline bg-surface hover:border-hairline-strong hover:bg-elevated",
              !switchable && "cursor-not-allowed opacity-60",
            )}
            aria-pressed={selected}
          >
            {selected && (
              <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            )}
            <div className="mb-3 flex gap-1.5">
              {option.swatches.map((color) => (
                <span
                  key={`${option.id}-${color}`}
                  className="size-6 rounded-md border border-hairline shadow-sm"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
              ))}
            </div>
            <div className="font-medium">{option.label}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
