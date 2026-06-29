import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col p-6">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </header>

      <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
          <Sparkles className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-medium text-foreground">{title} workspace</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground text-pretty">
          This module is part of the AFIA platform. Connect a data source or ask the AI assistant to scaffold this
          workflow for your team.
        </p>
        <Button className="mt-5 gap-2">
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </div>
    </div>
  );
}
