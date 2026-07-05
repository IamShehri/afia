export type ColorTheme = "classic" | "coral";

export const COLOR_THEME_STORAGE_KEY = "afia-color-theme";

export interface ColorThemeOption {
  id: ColorTheme;
  label: string;
  description: string;
  /** Mini swatches for the Settings preview card */
  swatches: string[];
}

export const COLOR_THEME_OPTIONS: ColorThemeOption[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Graphite Atelier — AFIA blue signal on warm graphite surfaces",
    swatches: ["#5B8DEF", "#8B7CF6", "#4CB894", "#E8B84A", "#22304A"],
  },
  {
    id: "coral",
    label: "Coral",
    description: "Warm research lab — coral primary, navy text, cream surfaces",
    swatches: ["#FF7355", "#22304A", "#7A9E7E", "#D9A441", "#FAF6F0"],
  },
];
