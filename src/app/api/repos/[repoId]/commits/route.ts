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
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const author = searchParams.get("author") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  try {
    // Verify repo belongs to user
    const repo = await prisma.repo.findFirst({
      where: { id: repoId, userId: auth.userId },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    const where: any = { repoId };

    if (search) {
      where.OR = [
        { message: { contains: search, mode: "insensitive" } },
        { authorName: { contains: search, mode: "insensitive" } },
        { sha: { startsWith: search } },
      ];
    }

    if (author) {
      where.authorName = { contains: author, mode: "insensitive" };
    }

    const [commits, total] = await Promise.all([
      prisma.commit.findMany({
        where,
        include: {
          fileChanges: {
            select: {
              id: true,
              filename: true,
              status: true,
              additions: true,
              deletions: true,
            },
          },
          explanation: true,
        },
        orderBy: { committedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.commit.count({ where }),
    ]);

    return NextResponse.json({
      commits,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching commits:", error);
    return NextResponse.json({ error: "Failed to fetch commits" }, { status: 500 });
  }
}
