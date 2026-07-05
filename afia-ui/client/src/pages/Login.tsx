import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AfiaWordmark } from "@/components/brand/AfiaMark";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { storeInviteReturnToken } from "@/pages/InviteAccept";

type AuthMode = "signin" | "signup";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const search = useSearch();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams(
      search.startsWith("?") ? search.slice(1) : search,
    ).get("next");
    if (next?.startsWith("/invite/")) {
      const token = next.split("/").pop();
      if (token) storeInviteReturnToken(token);
    }
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (mode === "signup" && !consent) {
      setError("You must accept the pilot consent statement.");
      return;
    }

    setSubmitting(true);
    setError("");

    const result =
      mode === "signup"
        ? await signUp(trimmed, consent)
        : await signIn(trimmed);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSent(true);
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setSent(false);
    if (next === "signin") {
      setConsent(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-dotgrid px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AfiaWordmark className="text-2xl justify-center mb-4" />
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Welcome to AFIA
          </h1>
          <p className="text-muted-foreground">
            The AI-native healthcare operating system
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-hairline bg-surface p-6 text-center space-y-3">
            <Mail className="size-8 mx-auto text-primary" />
            <h2 className="text-lg font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to{" "}
              <span className="font-medium text-foreground">{email.trim()}</span>
              . Click the link to sign in.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex rounded-lg border border-hairline bg-surface p-1">
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "signin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => switchMode("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => switchMode("signup")}
              >
                Sign up
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode === "signup" && (
              <div className="flex items-start gap-3 rounded-md border border-hairline bg-surface p-3">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="consent"
                  className="text-sm font-normal leading-snug text-muted-foreground"
                >
                  I understand this is a pilot version and my data is used for
                  testing purposes
                </Label>
              </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full press"
              size="lg"
              disabled={
                submitting || !email.trim() || (mode === "signup" && !consent)
              }
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              {mode === "signup" ? "Create account" : "Send magic link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
