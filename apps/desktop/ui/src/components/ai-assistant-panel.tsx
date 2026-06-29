import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  X,
  ArrowUp,
  Paperclip,
  FlaskConical,
  FileText,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { useShell } from "@/stores/shell-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

const seed: Message[] = [
  {
    id: "m1",
    role: "user",
    content: "Summarize James Whitfield's overnight status.",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "James Whitfield (MRN-39112) remained in atrial fibrillation overnight with HR ranging 98–124 bpm. A critical potassium of 6.1 mmol/L was flagged at 09:18 and cardiology was notified. BP is elevated at 148/92. I'd recommend a repeat ECG and electrolyte recheck.",
    sources: ["Telemetry", "Lab panel 09:18", "Nursing notes"],
  },
];

const prompts = [
  { icon: FileText, label: "Draft discharge summary" },
  { icon: Stethoscope, label: "Suggest differential diagnosis" },
  { icon: FlaskConical, label: "Interpret latest labs" },
  { icon: TrendingUp, label: "Show 7-day vitals trend" },
];

export function AiAssistantPanel() {
  const { assistantOpen, setAssistantOpen } = useShell();
  const [messages, setMessages] = useState<Message[]>(seed);
  const [input, setInput] = useState("");

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Analyzing the chart and recent encounters… I'll surface the most relevant findings and cite their sources so you can verify each one.",
        sources: ["EHR context", "Clinical guidelines"],
      },
    ]);
    setInput("");
  };

  return (
    <AnimatePresence>
      {assistantOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setAssistantOpen(false)}
            className="fixed inset-0 z-30 bg-background/40 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[420px] flex-col border-l border-border bg-canvas shadow-overlay"
            aria-label="AI assistant"
          >
            {/* Header */}
            <div className="flex h-12 shrink-0 items-center gap-2.5 border-b border-border px-4">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/12">
                <Sparkles className="size-4 text-primary" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  AFIA Assistant
                </p>
              </div>
              <Badge variant="success" className="gap-1">
                <span className="size-1.5 rounded-full bg-success" /> Online
              </Badge>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setAssistantOpen(false)}
                aria-label="Close assistant"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex flex-col gap-1.5",
                      m.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[0.8125rem] leading-relaxed",
                        m.role === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md border border-border bg-surface text-foreground",
                      )}
                    >
                      {m.content}
                    </div>
                    {m.sources && (
                      <div className="flex flex-wrap gap-1">
                        {m.sources.map((s) => (
                          <Badge key={s} variant="neutral">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Suggested prompts */}
            <div className="border-t border-border px-4 pt-3">
              <div className="grid grid-cols-2 gap-1.5">
                {prompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setInput(p.label)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-left text-2xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <p.icon className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Composer */}
            <div className="p-4 pt-3">
              <div className="rounded-xl border border-border bg-surface p-2 shadow-soft focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing &&
                      e.keyCode !== 229
                    ) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={2}
                  placeholder="Ask about a patient, draft a note, or run analysis…"
                  className="w-full resize-none bg-transparent px-1.5 py-1 text-[0.8125rem] text-foreground outline-none placeholder:text-muted-foreground"
                />
                <div className="flex items-center gap-1.5 px-1">
                  <Button variant="ghost" size="icon-xs" aria-label="Attach">
                    <Paperclip className="size-4" />
                  </Button>
                  <span className="text-2xs text-muted-foreground">
                    Cites every source · HIPAA-safe
                  </span>
                  <Button
                    size="icon-xs"
                    className="ml-auto"
                    onClick={send}
                    disabled={!input.trim()}
                    aria-label="Send"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
