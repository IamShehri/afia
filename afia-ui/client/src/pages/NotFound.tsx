import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { AfiaMark } from "@/components/brand/AfiaMark";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background bg-dotgrid">
      <div className="text-center px-6">
        <div className="flex justify-center mb-8">
          <AfiaMark className="size-12 opacity-90" />
        </div>
        <p className="font-mono text-sm tracking-widest text-muted-foreground mb-3">
          ERROR 404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3">
          This page doesn't exist
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          The route you followed may have moved, or it was never part of the
          workspace. Let's get you back to familiar ground.
        </p>
        <Button onClick={() => setLocation("/")} className="press">
          <ArrowLeft className="size-4" />
          Back to workspace
        </Button>
      </div>
    </div>
  );
}
