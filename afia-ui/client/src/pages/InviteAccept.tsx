import { useEffect, useRef, useState } from "react";
import { Redirect, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamWorkspace } from "@/contexts/TeamWorkspaceContext";
import { Button } from "@/components/ui/button";
import { AfiaWordmark } from "@/components/brand/AfiaMark";
import { acceptWorkspaceInvite } from "@/lib/team-workspaces";
import { Loader2 } from "lucide-react";

const INVITE_RETURN_KEY = "afia:invite-return";

export function storeInviteReturnToken(token: string): void {
  try {
    sessionStorage.setItem(INVITE_RETURN_KEY, token);
  } catch {
    // ignore
  }
}

export function consumeInviteReturnToken(): string | null {
  try {
    const token = sessionStorage.getItem(INVITE_RETURN_KEY);
    if (token) sessionStorage.removeItem(INVITE_RETURN_KEY);
    return token;
  } catch {
    return null;
  }
}

export default function InviteAccept() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";
  const { session, loading: authLoading } = useAuth();
  const { refreshWorkspaces, setActiveWorkspaceId } = useTeamWorkspace();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"pending" | "done" | "error">("pending");
  const [message, setMessage] = useState("");
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (authLoading || !token) return;
    if (!session) {
      storeInviteReturnToken(token);
      return;
    }
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    void acceptWorkspaceInvite(token)
      .then(async (result) => {
        await refreshWorkspaces();
        setActiveWorkspaceId(result.workspaceId);
        setStatus("done");
        toast.success("You joined the workspace");
        setLocation("/research");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Failed to accept invite");
      });
  }, [
    authLoading,
    session,
    token,
    refreshWorkspaces,
    setActiveWorkspaceId,
    setLocation,
  ]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Invalid invite link.</p>
      </div>
    );
  }

  if (!authLoading && !session) {
    storeInviteReturnToken(token);
    return <Redirect to={`/login?next=/invite/${token}`} />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <AfiaWordmark className="text-xl" />
      {status === "error" ? (
        <>
          <p className="text-sm text-destructive">{message}</p>
          <Button variant="outline" onClick={() => setLocation("/")}>
            Go to Home
          </Button>
        </>
      ) : (
        <>
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Accepting invitation…</p>
        </>
      )}
    </div>
  );
}
