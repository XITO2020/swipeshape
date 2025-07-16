// middleware.ts — robust Clerk v5+ middleware without TS errors
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS: (string | RegExp)[] = [
  "/", "/about", "/contact",
  "/login", "/signup", "/forgot-password", "/reset-password",
  /^\/blog(?:\/.*)?$/,
  /^\/programs(?:\/.*)?$/,
  /^\/api\/public(?:\/.*)?$/,
  /^\/api\/webhooks(?:\/.*)?$/,
  /^\/api\/auth\/jwt(?:\/.*)?$/,
];

export default function middleware(req: NextRequest) {
  const { userId, sessionClaims } = getAuth(req);
  const { pathname } = req.nextUrl;

  // 1️⃣ Allow all public paths through
  if (PUBLIC_PATHS.some(p => typeof p === "string"
      ? p === pathname
      : p.test(pathname)
    )) {
    return NextResponse.next();
  }

  // 2️⃣ Redirect unauthenticated users to /login
  if (!userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 3️⃣ Protect /admin and /api/admin by role claim
  if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) 
      && sessionClaims?.role !== "admin") {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }

  // 4️⃣ Prevent signed‑in users from hitting /login again
  if (pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 5️⃣ All other authenticated requests pass
  return NextResponse.next();
}

// Apply to everything except Next.js static assets
export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
