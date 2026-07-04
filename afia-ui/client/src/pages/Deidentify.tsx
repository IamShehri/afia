import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SectionLabel } from "@/components/primitives";
import {
  deidentifyText,
  type DeidentifyResult,
} from "@/services/openmed-client";
import { logAction } from "@/lib/audit";
import { Shield, Download, Copy, Check, Loader2, AlertCircle } from "lucide-react";

const SAMPLE =
  "Patient Sarah Johnson, DOB 03/15/1978, MRN 4471829, was seen at Memorial Hospital on 06/20/2026 by Dr. Chen for follow-up of hypertension. Contact: 555-0142.";

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Deidentify() {
  const [inputText, setInputText] = useState(SAMPLE);
  const [result, setResult] = useState<DeidentifyResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDeidentify = async () => {
    if (!inputText.trim() || processing) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const res = await deidentifyText(inputText);
      setResult(res);
      logAction("deidentify", "analysis");
    } catch (e) {
      setError(e instanceof Error ? e.message : "De-identification failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadFile(
      result.deidentified,
      `deidentified_${timestamp}.txt`,
      "text/plain",
    );
    logAction("export", "analysis");
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.deidentified);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <PageHeader
          title="De-identification"
          subtitle="Remove personally identifiable information from clinical text"
        />

        <Card>
          <CardContent className="space-y-4">
            <div>
              <SectionLabel>Clinical text</SectionLabel>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste clinical text to de-identify…"
                className="mt-2 min-h-40 font-mono text-sm"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleDeidentify}
              disabled={!inputText.trim() || processing}
            >
              {processing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Shield className="size-4" />
              )}
              {processing ? "Processing…" : "De-identify"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="space-y-3">
                  <SectionLabel>Original</SectionLabel>
                  <div className="rounded-md border border-hairline bg-surface p-3 font-mono text-sm whitespace-pre-wrap">
                    {result.original}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3">
                  <SectionLabel>De-identified</SectionLabel>
                  <div className="rounded-md border border-success/20 bg-success/5 p-3 font-mono text-sm whitespace-pre-wrap">
                    {result.deidentified}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="size-4" />
                Download De-identified Text
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleCopy}>
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
