"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Commit, Repo } from "@/types";
import { groupCommitsByDate, getTopContributors, getTopFiles, getLanguageColor } from "@/lib/utils";
import { GitCommit, Users, FileCode, TrendingUp, Flame } from "lucide-react";

interface Props {
  commits: Commit[];
  repo: Repo | null;
}

const CHART_COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

export function InsightsDashboard({ commits, repo }: Props) {
  const stats = useMemo(() => {
    const totalAdditions = commits.reduce((acc, c) => acc + c.additions, 0);
    const totalDeletions = commits.reduce((acc, c) => acc + c.deletions, 0);
    const uniqueAuthors = new Set(commits.map((c) => c.authorName)).size;
    const byDay = groupCommitsByDate(commits);
    const topContributors = getTopContributors(commits);
    const allFileChanges = commits.flatMap((c) => c.fileChanges || []);
    const topFiles = getTopFiles(allFileChanges);

    return {
      totalCommits: commits.length,
      totalAdditions,
      totalDeletions,
      uniqueAuthors,
      byDay: byDay.slice(-30), // Last 30 days
      topContributors,
      topFiles,
      netChange: totalAdditions - totalDeletions,
    };
  }, [commits]);

  const statCards = [
    {
      label: "Total Commits",
      value: stats.totalCommits,
      icon: GitCommit,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Contributors",
      value: stats.uniqueAuthors,
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Lines Added",
      value: `+${stats.totalAdditions.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Lines Removed",
      value: `-${stats.totalDeletions.toLocaleString()}`,
      icon: Flame,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2 text-xs">
          <p className="text-white/50 mb-1">{label}</p>
          <p className="text-cyan-400 font-semibold">{payload[0].value} commits</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl p-4 border ${card.bg}`}
          >
            <card.icon className={`w-5 h-5 ${card.color} mb-3`} />
            <div className={`font-display text-2xl font-bold ${card.color} mb-0.5`}>
              {card.value}
            </div>
            <div className="text-xs text-white/40">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Commit frequency chart */}
      {stats.byDay.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 border border-white/10"
        >
          <h3 className="font-display font-semibold text-white text-sm mb-4">
            Commit Frequency (Last 30 days)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={stats.byDay} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.split("-").slice(1).join("/")}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#commitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top contributors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5 border border-white/10"
        >
          <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            Top Contributors
          </h3>
          <div className="space-y-3">
            {stats.topContributors.slice(0, 6).map((contributor, i) => {
              const maxCount = stats.topContributors[0]?.count || 1;
              const pct = (contributor.count / maxCount) * 100;
              return (
                <div key={contributor.name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                    {contributor.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/70 truncate">{contributor.name}</span>
                      <span className="text-xs text-white/40 ml-2">{contributor.count}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Hotspot files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5 border border-white/10"
        >
          <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Hotspot Files
            <span className="text-xs text-white/30 font-normal ml-1">most changed</span>
          </h3>
          <div className="space-y-2">
            {stats.topFiles.slice(0, 6).map((file, i) => {
              const maxChanges = stats.topFiles[0]?.changes || 1;
              const pct = (file.changes / maxChanges) * 100;
              const shortName = file.filename.split("/").pop() || file.filename;
              const dir = file.filename.includes("/")
                ? file.filename.split("/").slice(0, -1).join("/") + "/"
                : "";

              return (
                <div key={file.filename} className="flex items-center gap-3">
                  <FileCode className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="min-w-0">
                        <span className="text-xs text-white/30">{dir}</span>
                        <span className="text-xs text-white/70 font-mono">{shortName}</span>
                      </div>
                      <span className="text-xs text-orange-400/70 ml-2 flex-shrink-0">
                        {file.changes}
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
