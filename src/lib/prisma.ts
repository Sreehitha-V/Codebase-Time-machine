import { PrismaClient } from "@prisma/client";

// PrismaClient is NOT instantiated at module load — only on first property
// access inside a request handler. This prevents Next.js from running DB
// code during build-time static page-data collection.

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function getPrismaClient(): PrismaClient {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }
  return global.__prisma;
}

// Proxy so existing `prisma.user.findMany(...)` call-sites work unchanged,
// but the real PrismaClient is only created on first property access at runtime.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string) {
    return (getPrismaClient() as any)[prop];
  },
});
