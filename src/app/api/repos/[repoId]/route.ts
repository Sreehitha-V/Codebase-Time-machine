export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { repoId: string } }
) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId } = params;

  try {
    const repo = await prisma.repo.findFirst({
      where: { id: repoId, userId: auth.userId },
      include: {
        _count: { select: { commits: true } },
      },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    return NextResponse.json({ repo });
  } catch (error) {
    console.error("Error fetching repo:", error);
    return NextResponse.json({ error: "Failed to fetch repository" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { repoId: string } }
) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId } = params;

  try {
    const repo = await prisma.repo.findFirst({
      where: { id: repoId, userId: auth.userId },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    await prisma.repo.delete({ where: { id: repoId } });

    return NextResponse.json({ message: "Repository deleted" });
  } catch (error) {
    console.error("Error deleting repo:", error);
    return NextResponse.json({ error: "Failed to delete repository" }, { status: 500 });
  }
}
