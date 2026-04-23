"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import {
  Loader2, GitBranch, Play, Square, ChevronLeft,
  BarChart3, Search, Filter, Zap, RefreshCw
} from "lucide-react";
import { useAuthStore, useAnalysisStore } from "@/store";
import { Commit, Repo } from "@/types";
import { CommitTimeline } from "@/components/timeline/CommitTimeline";
import { CommitDetailPanel } from "@/components/timeline/CommitDetailPanel";
import { InsightsDashboard } from "@/components/charts/InsightsDashboard";
import { StoryModeOverlay } from "@/components/timeline/StoryModeOverlay";
import Link from "next/link";

type View = "timeline" | "insights";

export default function AnalyzePage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const { token } = useAuthStore();
  const {
    repo, commits, selectedCommit, isLoading, isAnalyzing,
    error, storyModeActive,
    setRepo, setCommits, setSelectedCommit,
    setLoading, setAnalyzing, setError,
    startStoryMode, stopStoryMode,
  } = useAnalysisStore();

  const [view, setView] = useState<View>("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCommits, setFilteredCommits] = useState<Commit[]>([]);
  const [repoData, setRepoData] = useState<Repo | null>(null);

  const loadRepo = useCallback(async () => {
    try {
      const res = await fetch(`/api/repos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const found = data.repos?.find((r: Repo) => r.id === repoId);
        if (found) {
          setRepoData(found);
          setRepo(found);
        }
      }
    } catch {}
  }, [repoId, token, setRepo]);

  const loadCommits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/repos/${repoId}/commits?pageSize=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCommits(data.commits || []);
        setFilteredCommits(data.commits || []);
      }
    } catch {
      setError("Failed to load commits");
    } finally {
      setLoading(false);
    }
  }, [repoId, token, setCommits, setLoading, setError]);

  const analyzeRepo = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch(`/api/repos/${repoId}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analysis failed");
      } else {
        await loadCommits();
        await loadRepo();
      }
    } catch {
      setError("Network error during analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    loadRepo();
    loadCommits();
  }, [repoId]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCommits(commits);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredCommits(
        commits.filter(
          (c) =>
            c.message.toLowerCase().includes(q) ||
            c.authorName.toLowerCase().includes(q) ||
            c.sha.startsWith(q)
        )
      );
    }
  }, [searchQuery, commits]);

  const shouldAnalyze = !isLoading && commits.length === 0 && !isAnalyzing;

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Repos
        </Link>

        <div className="w-px h-4 bg-white/10" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-white/10">
            <GitBranch className="w-3 h-3 text-cyan-400" />
          </div>
          <span className="font-display font-semibold text-white text-sm">
            {repoData?.fullName || "Loading..."}
          </span>
          {commits.length > 0 && (
            <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/40">
              {commits.length} commits
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* View tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {(["timeline", "insights"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                view === v
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {v === "timeline" ? (
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  Timeline
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Insights
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Story mode button */}
        {commits.length > 0 && (
          <button
            onClick={() => (storyModeActive ? stopStoryMode() : startStoryMode())}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              storyModeActive
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                : "bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30"
            }`}
          >
            {storyModeActive ? (
              <>
                <Square className="w-3 h-3" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                Story Mode
              </>
            )}
          </button>
        )}

        {/* Analyze button */}
        <button
          onClick={analyzeRepo}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3" />
              {commits.length > 0 ? "Re-analyze" : "Analyze"}
            </>
          )}
        </button>
      </div>

      {/* Search bar (shown in timeline view) */}
      {view === "timeline" && commits.length > 0 && (
        <div className="px-6 py-3 border-b border-white/5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search commits, authors, SHA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/30 transition-all"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-3" />
              <p className="text-white/40 text-sm">Loading commits...</p>
            </div>
          </div>
        ) : shouldAnalyze ? (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">
                Ready to analyze
              </h3>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                Click analyze to fetch commits from GitHub and build your interactive timeline
              </p>
              <button
                onClick={analyzeRepo}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all mx-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Analyze Repository
                  </>
                )}
              </button>
              {error && (
                <p className="text-red-400 text-sm mt-4">{error}</p>
              )}
            </motion.div>
          </div>
        ) : view === "timeline" ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Timeline */}
            <div className={`flex-1 overflow-hidden transition-all ${selectedCommit ? "pr-0" : ""}`}>
              <CommitTimeline
                commits={filteredCommits}
                selectedCommit={selectedCommit}
                onSelectCommit={setSelectedCommit}
              />
            </div>

            {/* Detail panel */}
            <AnimatePresence>
              {selectedCommit && (
                <motion.div
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="w-96 border-l border-white/5 overflow-y-auto scrollbar-thin"
                >
                  <CommitDetailPanel
                    commit={selectedCommit}
                    onClose={() => setSelectedCommit(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <InsightsDashboard commits={commits} repo={repoData} />
          </div>
        )}
      </div>

      {/* Story Mode Overlay */}
      <AnimatePresence>
        {storyModeActive && <StoryModeOverlay />}
      </AnimatePresence>
    </div>
  );
}
