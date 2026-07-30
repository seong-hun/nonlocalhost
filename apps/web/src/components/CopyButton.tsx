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
      className="shrink-0 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:border-indigo-500 hover:text-slate-100"
    >
      {copied ? "복사됨" : "복사"}
    </button>
  );
}
