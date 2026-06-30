import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, ArrowUp, Paperclip, Stethoscope } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const seed: Message[] = [
  {
    id: "m-1",
    role: "assistant",
    content:
      "Good morning, Dr. Lin. Your unit has 42 active patients. Three are flagged for review — Daniel Reyes shows the strongest deterioration signal. Want me to summarize?",
  },
];

const prompts = [
  "Summarize critical patients",
  "Draft discharge note for Yuki Tanaka",
  "What changed overnight?",
];

export function AssistantPanel() {
  const { assistantOpen, setAssistantOpen } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>(seed);
  const [input, setInput] = useState("");

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: value },
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          "Here's a synthesized view based on current charts. (This is a presentation demo — AFIA would stream a grounded, cited response here.)",
      },
    ]);
    setInput("");
  }

  return (
    <AnimatePresence>
      {assistantOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm xl:hidden"
            onClick={() => setAssistantOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col border-l border-border bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground ring-1 ring-inset ring-white/10">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold leading-tight">AFIA Assistant</p>
                <p className="text-[11px] text-success">Online · grounded on this unit</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setAssistantOpen(false)}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-2.5",
                    m.role === "user" && "flex-row-reverse",
                  )}
                >
                  {m.role === "assistant" && (
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-surface-raised text-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested prompts */}
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-inset px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Stethoscope className="h-3 w-3" />
                  {p}
                </button>
              ))}
            </div>

            {/* Composer */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-end gap-2 rounded-xl border border-border bg-surface-inset p-2 focus-within:border-primary/40"
              >
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Attach">
                  <Paperclip className="h-4 w-4" />
                </Button>
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
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder="Ask about a patient, draft a note…"
                  className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70"
                />
                <Button type="submit" size="icon-sm" disabled={!input.trim()} aria-label="Send">
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </form>
              <p className="mt-1.5 px-1 text-[10px] text-muted-foreground/70">
                AFIA can make mistakes. Verify clinical decisions.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
