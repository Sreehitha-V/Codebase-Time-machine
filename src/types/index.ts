// Core application types

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  createdAt: Date;
}

export interface Repo {
  id: string;
  name: string;
  fullName: string;
  description?: string | null;
  url: string;
  owner: string;
  isPrivate: boolean;
  stars: number;
  language?: string | null;
  createdAt: Date;
  analyzedAt?: Date | null;
  userId: string;
  commits?: Commit[];
  _count?: { commits: number };
}

export interface Commit {
  id: string;
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string | null;
  committedAt: Date;
  additions: number;
  deletions: number;
  filesChanged: number;
  url?: string | null;
  repoId: string;
  fileChanges?: FileChange[];
  explanation?: AIExplanation | null;
}

export interface FileChange {
  id: string;
  filename: string;
  status: "added" | "modified" | "removed" | "renamed";
  additions: number;
  deletions: number;
  patch?: string | null;
  commitId: string;
}

export interface AIExplanation {
  id: string;
  simpleExplanation: string;
  technicalExplanation: string;
  whyItChanged: string;
  impact: string;
  commitId: string;
  createdAt: Date;
}

// GitHub API types
export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author?: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: GitHubFile[];
}

export interface GitHubFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  stargazers_count: number;
  language: string | null;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// UI State types
export interface TimelineNode {
  commit: Commit;
  position: number;
  isSelected: boolean;
}

export interface DashboardStats {
  totalCommits: number;
  totalRepos: number;
  totalContributors: number;
  totalFilesChanged: number;
  commitsByDay: { date: string; count: number }[];
  topContributors: { name: string; count: number; avatar?: string }[];
  topFiles: { filename: string; changes: number }[];
  languageBreakdown: { language: string; percentage: number }[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AnalysisState {
  repo: Repo | null;
  commits: Commit[];
  selectedCommit: Commit | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  storyModeActive: boolean;
  storyModeIndex: number;
  storyModeSpeed: number;
}
