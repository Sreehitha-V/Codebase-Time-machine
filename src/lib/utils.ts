import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return format(d, "MMM d, yyyy");
}

export function formatDateRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return format(d, "MMM d, yyyy HH:mm");
}

export function shortenSha(sha: string): string {
  return sha.substring(0, 7);
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Rust: "#dea584",
    Go: "#00ADD8",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#ffac45",
    Kotlin: "#A97BFF",
    Scala: "#c22d40",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Dockerfile: "#384d54",
  };

  return colors[language || ""] || "#8b949e";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    added: "text-green-400",
    modified: "text-yellow-400",
    removed: "text-red-400",
    renamed: "text-blue-400",
  };
  return colors[status] || "text-gray-400";
}

export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    added: "+",
    modified: "~",
    removed: "-",
    renamed: "→",
  };
  return icons[status] || "?";
}

export function calculateChurnScore(additions: number, deletions: number): number {
  return additions + deletions;
}

export function groupCommitsByDate(commits: { committedAt: Date | string }[]) {
  const groups: Record<string, number> = {};

  commits.forEach((commit) => {
    const date = format(new Date(commit.committedAt), "yyyy-MM-dd");
    groups[date] = (groups[date] || 0) + 1;
  });

  return Object.entries(groups)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getTopContributors(
  commits: { authorName: string; authorAvatar?: string | null }[]
) {
  const contributors: Record<string, { count: number; avatar?: string }> = {};

  commits.forEach((commit) => {
    if (!contributors[commit.authorName]) {
      contributors[commit.authorName] = { count: 0, avatar: commit.authorAvatar || undefined };
    }
    contributors[commit.authorName].count++;
  });

  return Object.entries(contributors)
    .map(([name, { count, avatar }]) => ({ name, count, avatar }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function getTopFiles(
  fileChanges: { filename: string; additions: number; deletions: number }[]
) {
  const files: Record<string, number> = {};

  fileChanges.forEach((fc) => {
    files[fc.filename] = (files[fc.filename] || 0) + fc.additions + fc.deletions;
  });

  return Object.entries(files)
    .map(([filename, changes]) => ({ filename, changes }))
    .sort((a, b) => b.changes - a.changes)
    .slice(0, 10);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}
