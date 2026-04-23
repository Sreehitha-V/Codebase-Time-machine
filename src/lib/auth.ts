import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// JWT_SECRET is read inside functions, never at module load, so Next.js
// build-time static analysis never touches process.env.JWT_SECRET.
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "fallback-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getTokenFromRequest(req: NextRequest): Promise<string | null> {
  // Check Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check cookie
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    if (tokenMatch) return tokenMatch[1];
  }

  return null;
}

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  const token = await getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete("token");
}
