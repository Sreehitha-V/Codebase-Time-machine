"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Commit } from "@/types";
import { formatDateRelative, shortenSha } from "@/lib/utils";
import { GitCommit, Plus, Minus } from "lucide-react";

interface Props {
  commits: Commit[];
  selectedCommit: Commit | null;
  onSelectCommit: (commit: Commit) => void;
}

export function CommitTimeline({ commits, selectedCommit, onSelectCommit }: Props) {
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCommit && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedCommit]);

  if (commits.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        No commits match your search
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-6 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[20px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 via-white/5 to-transparent" />

          <div className="space-y-1">
            {commits.map((commit, index) => {
              const isSelected = selectedCommit?.id === commit.id;
              const totalChanges = commit.additions + commit.deletions;
              const intensity = Math.min(totalChanges / 200, 1);

              return (
                <motion.div
                  key={commit.id}
                  ref={isSelected ? selectedRef : undefined}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  onClick={() => onSelectCommit(commit)}
                  className={`relative flex items-start gap-4 pl-12 pr-4 py-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white/8 border border-white/10"
                      : "hover:bg-white/4 border border-transparent"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-[13px] top-4">
                    <div
                      className={`w-3.5 h-3.5 rounded-full transition-all ${
                        isSelected
                          ? "bg-cyan-400 ring-2 ring-cyan-400/30 ring-offset-1 ring-offset-black"
                          : "bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      {/* Author avatar */}
                      {commit.authorAvatar ? (
                        <img
                          src={commit.authorAvatar}
                          alt={commit.authorName}
                          className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0 mt-0.5">
                          {commit.authorName[0]?.toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug truncate ${isSelected ? "text-white" : "text-white/70"}`}>
                          {commit.message.split("\n")[0]}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-white/30 font-mono">
                            {shortenSha(commit.sha)}
                          </span>
                          <span className="text-xs text-white/30">
                            {commit.authorName}
                          </span>
                          <span className="text-xs text-white/20">
                            {formatDateRelative(commit.committedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats bar */}
                    <div className="flex items-center gap-3 mt-1.5 ml-7">
                      {commit.additions > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-green-400/70">
                          <Plus className="w-3 h-3" />
                          {commit.additions}
                        </span>
                      )}
                      {commit.deletions > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-red-400/70">
                          <Minus className="w-3 h-3" />
                          {commit.deletions}
                        </span>
                      )}
                      {commit.filesChanged > 0 && (
                        <span className="text-xs text-white/20">
                          {commit.filesChanged} file{commit.filesChanged !== 1 ? "s" : ""}
                        </span>
                      )}

                      {/* Change intensity bar */}
                      {totalChanges > 0 && (
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"
                            style={{ width: `${Math.max(intensity * 100, 2)}%` }}
                          />
                        </div>
                      )}

                      {commit.explanation && (
                        <span className="text-xs bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded">
                          AI ✓
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
