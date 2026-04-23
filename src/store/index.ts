import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Repo, Commit, AuthState, AnalysisState } from "@/types";

// Auth Store
interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, token: null, error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// Analysis Store
interface AnalysisStore extends AnalysisState {
  setRepo: (repo: Repo | null) => void;
  setCommits: (commits: Commit[]) => void;
  setSelectedCommit: (commit: Commit | null) => void;
  setLoading: (loading: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  startStoryMode: () => void;
  stopStoryMode: () => void;
  nextStoryCommit: () => void;
  prevStoryCommit: () => void;
  setStorySpeed: (speed: number) => void;
  reset: () => void;
}

const initialAnalysisState: AnalysisState = {
  repo: null,
  commits: [],
  selectedCommit: null,
  isLoading: false,
  isAnalyzing: false,
  error: null,
  storyModeActive: false,
  storyModeIndex: 0,
  storyModeSpeed: 3000,
};

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  ...initialAnalysisState,

  setRepo: (repo) => set({ repo }),
  setCommits: (commits) => set({ commits }),
  setSelectedCommit: (selectedCommit) => set({ selectedCommit }),
  setLoading: (isLoading) => set({ isLoading }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setError: (error) => set({ error }),

  startStoryMode: () => {
    const { commits } = get();
    if (commits.length === 0) return;
    set({
      storyModeActive: true,
      storyModeIndex: commits.length - 1, // Start from oldest
      selectedCommit: commits[commits.length - 1],
    });
  },

  stopStoryMode: () => set({ storyModeActive: false }),

  nextStoryCommit: () => {
    const { storyModeIndex, commits } = get();
    const nextIndex = storyModeIndex - 1; // Going towards newest
    if (nextIndex < 0) {
      set({ storyModeActive: false });
      return;
    }
    set({
      storyModeIndex: nextIndex,
      selectedCommit: commits[nextIndex],
    });
  },

  prevStoryCommit: () => {
    const { storyModeIndex, commits } = get();
    const prevIndex = Math.min(storyModeIndex + 1, commits.length - 1);
    set({
      storyModeIndex: prevIndex,
      selectedCommit: commits[prevIndex],
    });
  },

  setStorySpeed: (speed) => set({ storyModeSpeed: speed }),

  reset: () => set(initialAnalysisState),
}));

// UI Store
interface UIStore {
  sidebarOpen: boolean;
  commitDetailOpen: boolean;
  theme: "light" | "dark" | "system";
  setSidebarOpen: (open: boolean) => void;
  setCommitDetailOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      commitDetailOpen: false,
      theme: "dark",

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCommitDetailOpen: (open) => set({ commitDetailOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "ui-storage",
    }
  )
);
