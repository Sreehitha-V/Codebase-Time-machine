export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchAllCommits, fetchCommitDetail } from "@/lib/github";
import { sleep } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { repoId: string } }
) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId } = params;

  try {
    // Get repo from DB
    const repo = await prisma.repo.findFirst({
      where: { id: repoId, userId: auth.userId },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // Fetch commits from GitHub
    let commits;
    try {
      commits = await fetchAllCommits(repo.owner, repo.name, 50);
    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to fetch commits: ${error.message}` },
        { status: 400 }
      );
    }

    if (commits.length === 0) {
      await prisma.repo.update({
        where: { id: repoId },
        data: { analyzedAt: new Date() },
      });
      return NextResponse.json({
        message: "Repository analyzed (no commits found)",
        commitsProcessed: 0,
      });
    }

    // Process commits in batches
    let processed = 0;
    const batchSize = 5;

    for (let i = 0; i < commits.length; i += batchSize) {
      const batch = commits.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (ghCommit) => {
          try {
            // Skip if commit already exists
            const existing = await prisma.commit.findUnique({
              where: { repoId_sha: { repoId, sha: ghCommit.sha } },
            });

            if (existing) {
              processed++;
              return;
            }

            // Fetch detailed commit info
            let detail = ghCommit;
            if (!ghCommit.stats) {
              try {
                detail = await fetchCommitDetail(repo.owner, repo.name, ghCommit.sha);
                await sleep(50);
              } catch {
                // Fall back to basic info if detail fetch fails
              }
            }

            // Persist commit
            await prisma.commit.create({
              data: {
                sha: ghCommit.sha,
                message: ghCommit.commit.message,
                authorName: ghCommit.commit.author.name,
                authorEmail: ghCommit.commit.author.email,
                authorAvatar: ghCommit.author?.avatar_url,
                committedAt: new Date(ghCommit.commit.author.date),
                additions: detail.stats?.additions || 0,
                deletions: detail.stats?.deletions || 0,
                filesChanged: detail.files?.length || 0,
                url: ghCommit.html_url,
                repoId,
                fileChanges: {
                  create: (detail.files || []).slice(0, 20).map((f) => ({
                    filename: f.filename,
                    status: f.status,
                    additions: f.additions,
                    deletions: f.deletions,
                    patch: f.patch ? f.patch.substring(0, 5000) : null,
                  })),
                },
              },
            });

            processed++;
          } catch (err) {
            console.error(`Error processing commit ${ghCommit.sha}:`, err);
          }
        })
      );

      // Brief pause between batches to respect GitHub rate limits
      if (i + batchSize < commits.length) {
        await sleep(200);
      }
    }

    // Mark repo as analyzed
    await prisma.repo.update({
      where: { id: repoId },
      data: { analyzedAt: new Date() },
    });

    return NextResponse.json({
      message: "Repository analyzed successfully",
      commitsProcessed: processed,
    });
  } catch (error) {
    console.error("Error analyzing repo:", error);
    return NextResponse.json({ error: "Failed to analyze repository" }, { status: 500 });
  }
}
