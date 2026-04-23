"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Square, SkipForward, SkipBack, ChevronLeft, ChevronRight } from "lucide-react";
import { useAnalysisStore } from "@/store";
import { formatDateRelative, shortenSha } from "@/lib/utils";

export function StoryModeOverlay() {
  const {
    commits, storyModeIndex, storyModeSpeed, storyModeActive,
    selectedCommit, nextStoryCommit, prevStoryCommit,
    stopStoryMode, setStorySpeed,
  } = useAnalysisStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (storyModeActive) {
      intervalRef.current = setInterval(() => {
        nextStoryCommit();
      }, storyModeSpeed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [storyModeActive, storyModeSpeed, nextStoryCommit]);

  const total = commits.length;
  const current = total - storyModeIndex;
  const progress = current / total;

  if (!selectedCommit) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />

      <div className="relative p-6 max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="w-full h-0.5 bg-white/10 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Current commit info */}
        <motion.div
          key={selectedCommit.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <div className="flex items-center gap-3 mb-2">
            {selectedCommit.authorAvatar && (
              <img
                src={selectedCommit.authorAvatar}
                alt=""
                className="w-8 h-8 rounded-full border border-white/20"
              />
            )}
            <div>
              <p className="text-white font-medium text-sm">
                {selectedCommit.message.split("\n")[0]}
              </p>
              <p className="text-white/40 text-xs">
                {selectedCommit.authorName} • {formatDateRelative(selectedCommit.committedAt)} •{" "}
                <span className="font-mono">{shortenSha(selectedCommit.sha)}</span>
              </p>
            </div>
          </div>

          {selectedCommit.explanation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 italic leading-relaxed"
            >
              "{selectedCommit.explanation.simpleExplanation}"
            </motion.div>
          )}
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/40">
            {current} / {total} commits
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevStoryCommit}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Speed control */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
              <span className="text-xs text-white/40">Speed</span>
              {[5000, 3000, 1500, 800].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setStorySpeed(speed)}
                  className={`text-xs px-2 py-0.5 rounded transition-all ${
                    storyModeSpeed === speed
                      ? "bg-white/20 text-white"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {speed === 5000 ? "0.5x" : speed === 3000 ? "1x" : speed === 1500 ? "2x" : "4x"}
                </button>
              ))}
            </div>

            <button
              onClick={nextStoryCommit}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={stopStoryMode}
              className="flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-all"
            >
              <Square className="w-3 h-3" />
              Stop
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
