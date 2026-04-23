import { GitHubCommit, GitHubRepo } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  const ghToken = token || process.env.GITHUB_TOKEN;
  if (ghToken) {
    headers["Authorization"] = `Bearer ${ghToken}`;
  }

  return headers;
}

export async function fetchRepo(owner: string, repo: string): Promise<GitHubRepo> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers: getHeaders(),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found`);
    }
    if (response.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Please add a GitHub token.");
    }
    throw new Error(`Failed to fetch repository: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCommits(
  owner: string,
  repo: string,
  page = 1,
  perPage = 30
): Promise<GitHubCommit[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?page=${page}&per_page=${perPage}`,
    {
      headers: getHeaders(),
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      // Empty repository
      return [];
    }
    throw new Error(`Failed to fetch commits: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCommitDetail(
  owner: string,
  repo: string,
  sha: string
): Promise<GitHubCommit> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`,
    {
      headers: getHeaders(),
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch commit detail: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAllCommits(
  owner: string,
  repo: string,
  maxCommits = 100
): Promise<GitHubCommit[]> {
  const allCommits: GitHubCommit[] = [];
  let page = 1;
  const perPage = 30;

  while (allCommits.length < maxCommits) {
    const commits = await fetchCommits(owner, repo, page, perPage);

    if (commits.length === 0) break;

    allCommits.push(...commits);

    if (commits.length < perPage) break;

    page++;

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return allCommits.slice(0, maxCommits);
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  // Support formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo.git
  // github.com/owner/repo
  // owner/repo

  const patterns = [
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/,
    /^github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/,
    /^([^/]+)\/([^/]+?)(?:\.git)?$/,
  ];

  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }

  return null;
}

export async function getRateLimitStatus() {
  const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
    headers: getHeaders(),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.rate;
}
