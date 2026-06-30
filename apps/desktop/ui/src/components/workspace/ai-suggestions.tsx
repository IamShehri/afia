import { Sparkles, Check, X } from "lucide-react";
import { aiSuggestions } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AiSuggestions() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <CardTitle>AFIA suggestions</CardTitle>
        </div>
        <Badge variant="primary">3 new</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {aiSuggestions.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-border bg-surface-inset p-3 transition-colors hover:border-primary/30"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium leading-snug text-foreground">
                {s.title}
              </p>
              <Badge variant="outline" className="shrink-0">
                {s.tag}
              </Badge>
            </div>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {s.rationale}
            </p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${s.confidence * 100}%` }}
                  />
                </span>
                {Math.round(s.confidence * 100)}% confidence
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Dismiss">
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-success" aria-label="Accept">
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
