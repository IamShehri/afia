import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { COLOR_THEME_OPTIONS } from "@/lib/color-themes";
import { pickDefaultNerModelId, shortModelName } from "@/lib/model-platform";
import { getActiveModel } from "@/services/model-preference";
import { getModels, probeBridgeConnection } from "@/services/openmed-client";
import { cn } from "@/lib/utils";

const BRIDGE_POLL_MS = 30_000;

export function StatusBar() {
  const { colorTheme } = useTheme();
  const [bridgeOnline, setBridgeOnline] = useState(false);
  const [modelLabel, setModelLabel] = useState("—");

  const themeLabel = useMemo(
    () =>
      COLOR_THEME_OPTIONS.find((option) => option.id === colorTheme)?.label ??
      "Classic",
    [colorTheme],
  );

  useEffect(() => {
    let active = true;

    const checkBridge = () => {
      void probeBridgeConnection().then((online) => {
        if (active) setBridgeOnline(online);
      });
    };

    checkBridge();
    const intervalId = window.setInterval(checkBridge, BRIDGE_POLL_MS);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const resolveModelLabel = async () => {
      const stored = getActiveModel();
      if (stored) {
        if (active) setModelLabel(shortModelName(stored));
        return;
      }
      try {
        const catalog = await getModels();
        const fallback = pickDefaultNerModelId(catalog.ner);
        if (active) {
          setModelLabel(fallback ? shortModelName(fallback) : "—");
        }
      } catch {
        if (active) setModelLabel("—");
      }
    };

    void resolveModelLabel();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex h-7 items-center gap-4 border-t border-hairline bg-surface px-4 text-[11px] text-muted-foreground">
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            bridgeOnline ? "bg-success" : "bg-muted-foreground/50",
          )}
          aria-hidden
        />
        <span>{bridgeOnline ? "Connected" : "Offline"}</span>
      </div>

      <div className="flex-1 truncate text-center font-mono text-[10px]">
        AFIA v1.0
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-2 truncate">
        <span className="truncate" title={modelLabel}>
          {modelLabel}
        </span>
        <span className="text-hairline-strong">·</span>
        <span className="truncate">{themeLabel}</span>
      </div>
    </div>
  );
}
