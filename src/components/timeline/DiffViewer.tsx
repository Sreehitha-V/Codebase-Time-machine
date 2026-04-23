"use client";

import { useMemo } from "react";

interface Props {
  patch: string;
  filename: string;
}

interface DiffLine {
  type: "added" | "removed" | "context" | "header";
  content: string;
  lineNo?: number;
}

function parsePatch(patch: string): DiffLine[] {
  const lines = patch.split("\n");
  const result: DiffLine[] = [];

  for (const line of lines) {
    if (line.startsWith("@@")) {
      result.push({ type: "header", content: line });
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      result.push({ type: "added", content: line.substring(1) });
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      result.push({ type: "removed", content: line.substring(1) });
    } else if (!line.startsWith("---") && !line.startsWith("+++")) {
      result.push({ type: "context", content: line.substring(1) });
    }
  }

  return result;
}

export function DiffViewer({ patch, filename }: Props) {
  const lines = useMemo(() => parsePatch(patch), [patch]);

  return (
    <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40">
      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs text-white/40 font-mono truncate">{filename}</span>
      </div>
      <div className="overflow-x-auto scrollbar-thin max-h-64">
        <table className="w-full text-xs font-mono">
          <tbody>
            {lines.map((line, i) => {
              if (line.type === "header") {
                return (
                  <tr key={i} className="bg-blue-950/30">
                    <td className="px-3 py-0.5 text-blue-400/60 text-xs" colSpan={2}>
                      {line.content}
                    </td>
                  </tr>
                );
              }

              const bgClass =
                line.type === "added"
                  ? "bg-green-950/40"
                  : line.type === "removed"
                  ? "bg-red-950/40"
                  : "";

              const prefixClass =
                line.type === "added"
                  ? "text-green-400 bg-green-950/60 w-6"
                  : line.type === "removed"
                  ? "text-red-400 bg-red-950/60 w-6"
                  : "text-white/20 w-6";

              const prefix =
                line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

              return (
                <tr key={i} className={`${bgClass} hover:bg-white/3 transition-colors`}>
                  <td className={`${prefixClass} px-1 text-center select-none`}>
                    {prefix}
                  </td>
                  <td className="px-3 py-0.5 text-white/70 whitespace-pre break-all">
                    {line.content || " "}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
