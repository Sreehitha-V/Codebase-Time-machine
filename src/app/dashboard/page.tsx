"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, GitBranch, Clock, Loader2, ArrowRight, Search, Star, Lock } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { Repo } from "@/types";
import { AddRepoModal } from "@/components/layout/AddRepoModal";
import { formatDate, formatNumber } from "@/lib/utils";
import { getLanguageColor } from "@/lib/utils";

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  async function loadRepos() {
    try {
      const res = await fetch("/api/repos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRepos(data.repos || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRepos();
  }, [token]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {repos.length} repositor{repos.length !== 1 ? "ies" : "y"} analyzed
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Repository
        </button>
      </motion.div>

      {/* Repos grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      ) : repos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="font-display text-xl font-semibold text-white/60 mb-2">
            No repositories yet
          </h3>
          <p className="text-white/30 text-sm mb-6">
            Add a GitHub repository to start exploring its history
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Your First Repo
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo, i) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/analyze/${repo.id}`}>
                <div className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group cursor-pointer hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-white/10">
                        <GitBranch className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-semibold text-white text-sm">{repo.name}</h3>
                          {repo.isPrivate && <Lock className="w-3 h-3 text-white/30" />}
                        </div>
                        <p className="text-xs text-white/30">{repo.owner}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors group-hover:translate-x-0.5" />
                  </div>

                  {repo.description && (
                    <p className="text-xs text-white/40 mb-3 line-clamp-2 leading-relaxed">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-white/30">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getLanguageColor(repo.language) }}
                        />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {formatNumber(repo.stars)}
                    </span>
                    {(repo._count?.commits ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {repo._count?.commits} commits
                      </span>
                    )}
                  </div>

                  {repo.analyzedAt && (
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/5 text-xs text-white/20">
                      <Clock className="w-3 h-3" />
                      Analyzed {formatDate(repo.analyzedAt)}
                    </div>
                  )}

                  {!repo.analyzedAt && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <span className="text-xs text-cyan-500/60">Not analyzed yet — click to analyze</span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Add more card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: repos.length * 0.05 }}
          >
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full glass rounded-2xl p-5 border border-dashed border-white/10 hover:border-white/20 transition-all group cursor-pointer hover:-translate-y-0.5 h-full min-h-32 flex flex-col items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6 text-white/20 group-hover:text-white/40 transition-colors" />
              <span className="text-sm text-white/30 group-hover:text-white/50 transition-colors">
                Add repository
              </span>
            </button>
          </motion.div>
        </div>
      )}

      <AddRepoModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadRepos();
        }}
      />
    </div>
  );
}
