export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchRepo, parseRepoUrl } from "@/lib/github";

// GET /api/repos - List user's repos
export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repos = await prisma.repo.findMany({
      where: { userId: auth.userId },
      include: {
        _count: { select: { commits: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ repos });
  } catch (error) {
    console.error("Error fetching repos:", error);
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 });
  }
}

// POST /api/repos - Add a new repo
export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Invalid GitHub repository URL. Expected format: owner/repo or https://github.com/owner/repo",
        },
        { status: 400 }
      );
    }

    const { owner, repo: repoName } = parsed;

    // Fetch repo info from GitHub
    let githubRepo;
    try {
      githubRepo = await fetchRepo(owner, repoName);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Check if already exists for this user
    const existing = await prisma.repo.findUnique({
      where: {
        userId_fullName: {
          userId: auth.userId,
          fullName: githubRepo.full_name,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ repo: existing, message: "Repository already added" });
    }

    // Create new repo
    const newRepo = await prisma.repo.create({
      data: {
        name: githubRepo.name,
        fullName: githubRepo.full_name,
        description: githubRepo.description,
        url: githubRepo.html_url,
        owner: githubRepo.owner.login,
        isPrivate: githubRepo.private,
        stars: githubRepo.stargazers_count,
        language: githubRepo.language,
        userId: auth.userId,
      },
    });

    return NextResponse.json({ repo: newRepo, message: "Repository added successfully" });
  } catch (error) {
    console.error("Error adding repo:", error);
    return NextResponse.json({ error: "Failed to add repository" }, { status: 500 });
  }
}
