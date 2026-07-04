import { aiSuggestions } from "@/data/workspace";
import { AiTag, PageHeader } from "@/components/primitives";
import { TrendingUp, AlertCircle } from "lucide-react";

export default function Insights() {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-hairline px-6 py-4">
        <PageHeader
          title="Insights"
          subtitle="AI-powered analysis of your practice"
        />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {aiSuggestions.map((s) => (
            <div
              key={s.id}
              className={`rounded-lg border p-4 ${
                s.tone === "warning"
                  ? "border-destructive/30 bg-destructive/5"
                  : s.tone === "action"
                    ? "border-primary/30 bg-primary/5"
                    : "border-ai/25 bg-ai/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {s.tone === "warning" && (
                    <AlertCircle className="size-5 text-destructive" />
                  )}
                  {s.tone === "action" && (
                    <TrendingUp className="size-5 text-primary" />
                  )}
                  {s.tone === "insight" && (
                    <AiTag />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {s.body}
                  </p>
                  {s.cta && (
                    <button className="mt-2 text-sm font-medium text-primary hover:underline">
                      {s.cta} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
