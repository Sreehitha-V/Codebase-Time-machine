export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCommitExplanation } from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: { commitId: string } }
) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commitId } = params;

  try {
    const commit = await prisma.commit.findFirst({
      where: {
        id: commitId,
        repo: { userId: auth.userId },
      },
      include: {
        fileChanges: true,
        explanation: true,
      },
    });

    if (!commit) {
      return NextResponse.json({ error: "Commit not found" }, { status: 404 });
    }

    // Return cached explanation if it already exists
    if (commit.explanation) {
      return NextResponse.json({ explanation: commit.explanation });
    }

    // Generate a new explanation via AI
    const explanationData = await generateCommitExplanation(
      {
        message: commit.message,
        authorName: commit.authorName,
        committedAt: commit.committedAt,
        additions: commit.additions,
        deletions: commit.deletions,
        filesChanged: commit.filesChanged,
      },
      commit.fileChanges as any
    );

    // Persist and return
    const explanation = await prisma.aIExplanation.create({
      data: {
        ...explanationData,
        commitId,
      },
    });

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Error generating explanation:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { commitId: string } }
) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commitId } = params;

  try {
    const explanation = await prisma.aIExplanation.findUnique({
      where: { commitId },
    });

    return NextResponse.json({ explanation: explanation ?? null });
  } catch (error) {
    console.error("Error fetching explanation:", error);
    return NextResponse.json({ error: "Failed to fetch explanation" }, { status: 500 });
  }
}
