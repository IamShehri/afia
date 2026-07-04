import { useLocation } from "wouter";
import { inboxItems } from "@/data/workspace";
import { fmtRelative } from "@/data/workspace";
import { RiskBadge, PageHeader } from "@/components/primitives";
import { AlertCircle, Mail } from "lucide-react";

export default function Inbox() {
  const [, setLocation] = useLocation();
  const unread = inboxItems.filter((i) => i.unread);
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-hairline px-6 py-4">
        <PageHeader title="Inbox" subtitle={`${unread.length} unread`} />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-hairline">
          {inboxItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.patientId) setLocation(`/patients/${item.patientId}`);
              }}
              className={`w-full text-left px-6 py-4 hover:bg-surface transition-colors cursor-pointer ${
                item.unread ? "bg-surface/50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {item.kind === "result" && (
                    <AlertCircle className="size-5 text-destructive" />
                  )}
                  {item.kind === "ai" && (
                    <Mail className="size-5 text-ai" />
                  )}
                  {!["result", "ai"].includes(item.kind) && (
                    <Mail className="size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {item.preview}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <RiskBadge risk={item.priority} showLabel={false} />
                    {item.patientName && (
                      <span className="text-xs text-muted-foreground">
                        {item.patientName}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {fmtRelative(item.at)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
