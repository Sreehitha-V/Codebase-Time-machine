"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Commit, AIExplanation } from "@/types";
import { X, GitCommit, Plus, Minus, Brain, Loader2, ExternalLink, ChevronDown, ChevronUp, FileCode } from "lucide-react";
import { formatDateTime, shortenSha, getStatusColor, getStatusIcon } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { DiffViewer } from "./DiffViewer";

interface Props {
  commit: Commit;
  onClose: () => void;
}

type ExplainTab = "simple" | "technical" | "why" | "impact";

export function CommitDetailPanel({ commit, onClose }: Props) {
  const { token } = useAuthStore();
  const [explanation, setExplanation] = useState<AIExplanation | null>(
    commit.explanation || null
  );
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<ExplainTab>("simple");
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  async function generateExplanation() {
    setIsLoadingAI(true);
    try {
      const res = await fetch(`/api/commits/${commit.id}/explain`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setExplanation(data.explanation);
    } catch {
      // ignore
    } finally {
      setIsLoadingAI(false);
    }
  }

  const tabs: { id: ExplainTab; label: string; emoji: string }[] = [
    { id: "simple", label: "Simple", emoji: "💬" },
    { id: "technical", label: "Technical", emoji: "⚙️" },
    { id: "why", label: "Why", emoji: "🤔" },
    { id: "impact", label: "Impact", emoji: "💥" },
  ];

  const explanationContent: Record<ExplainTab, string> = {
    simple: explanation?.simpleExplanation || "",
    technical: explanation?.technicalExplanation || "",
    why: explanation?.whyItChanged || "",
    impact: explanation?.impact || "",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-sm text-cyan-400">{shortenSha(commit.sha)}</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {/* Commit info */}
        <div>
          <h3 className="font-medium text-white text-sm leading-relaxed mb-3">
            {commit.message.split("\n")[0]}
          </h3>
          {commit.message.includes("\n") && (
            <p className="text-xs text-white/40 leading-relaxed mb-3 whitespace-pre-line">
              {commit.message.split("\n").slice(1).join("\n").trim()}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 rounded-lg p-2.5">
              <div className="text-white/30 mb-0.5">Author</div>
              <div className="flex items-center gap-1.5">
                {commit.authorAvatar && (
                  <img src={commit.authorAvatar} alt="" className="w-4 h-4 rounded-full" />
                )}
                <span className="text-white/70 truncate">{commit.authorName}</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5">
              <div className="text-white/30 mb-0.5">Date</div>
              <div className="text-white/70">{formatDateTime(commit.committedAt)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5">
              <div className="text-white/30 mb-0.5">Changes</div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">+{commit.additions}</span>
                <span className="text-red-400">-{commit.deletions}</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5">
              <div className="text-white/30 mb-0.5">Files</div>
              <div className="text-white/70">{commit.filesChanged}</div>
            </div>
          </div>

          {commit.url && (
            <a
              href={commit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              View on GitHub
            </a>
          )}
        </div>

        {/* AI Explanation */}
        <div className="bg-white/3 rounded-xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-medium text-white/70">AI Analysis</span>
            </div>
            {!explanation && !isLoadingAI && (
              <button
                onClick={generateExplanation}
                className="text-xs bg-violet-500/20 text-violet-400 px-2.5 py-1 rounded-lg hover:bg-violet-500/30 transition-all"
              >
                Generate
              </button>
            )}
          </div>

          {isLoadingAI ? (
            <div className="flex items-center gap-2 p-4 text-white/40 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analyzing with AI...
            </div>
          ) : explanation ? (
            <div>
              {/* Tabs */}
              <div className="flex border-b border-white/5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-2 py-2 text-xs transition-all ${
                      activeTab === tab.id
                        ? "bg-white/5 text-white"
                        : "text-white/30 hover:text-white/50"
                    }`}
                  >
                    <span className="mr-1">{tab.emoji}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3"
              >
                <p className="text-xs text-white/60 leading-relaxed">
                  {explanationContent[activeTab]}
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="p-4 text-center">
              <Brain className="w-6 h-6 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">
                Click Generate to get AI-powered insights
              </p>
            </div>
          )}
        </div>

        {/* Files changed */}
        {commit.fileChanges && commit.fileChanges.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-white/50 mb-2">
              Files Changed ({commit.fileChanges.length})
            </h4>
            <div className="space-y-1">
              {commit.fileChanges.map((fc) => (
                <div key={fc.id}>
                  <button
                    onClick={() =>
                      setExpandedFile(expandedFile === fc.id ? null : fc.id)
                    }
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-all text-left"
                  >
                    <span className={`text-xs font-bold w-3 ${getStatusColor(fc.status)}`}>
                      {getStatusIcon(fc.status)}
                    </span>
                    <span className="text-xs text-white/60 flex-1 truncate font-mono">
                      {fc.filename}
                    </span>
                    <div className="flex items-center gap-2 text-xs flex-shrink-0">
                      {fc.additions > 0 && <span className="text-green-400">+{fc.additions}</span>}
                      {fc.deletions > 0 && <span className="text-red-400">-{fc.deletions}</span>}
                      {fc.patch && (
                        expandedFile === fc.id
                          ? <ChevronUp className="w-3 h-3 text-white/30" />
                          : <ChevronDown className="w-3 h-3 text-white/30" />
                      )}
                    </div>
                  </button>
                  {expandedFile === fc.id && fc.patch && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 mb-2"
                    >
                      <DiffViewer patch={fc.patch} filename={fc.filename} />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
