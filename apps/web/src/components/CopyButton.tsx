import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "복사됨" : "복사"}
      className={`flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
        copied
          ? "border-emerald-800 text-emerald-300"
          : "border-slate-700 bg-slate-800 text-slate-300 hover:border-indigo-500 hover:text-slate-100"
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "복사됨" : "복사"}
    </button>
  );
}
