// Tailwind configuration for the AFIA desktop UI.
// TODO(S03-T04): Define content globs, design tokens, and shadcn/ui theme.
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
