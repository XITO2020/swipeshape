import { NextRequest, NextResponse } from "next/server";

// Middleware de sécurité pour HTTPS et headers
export function middleware(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();

  // En dev ou localhost, on ne force pas HTTPS
  if (
    process.env.NODE_ENV === "development" ||
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1"
  ) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Si on est en prod et que ce n'est pas HTTPS, on redirige
  if (url.protocol !== "https:") {
    url.protocol = "https:";
    return NextResponse.redirect(url);
  }

  // Sinon on poursuit normalement
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

// Ajout des headers de sécurité
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("Content-Security-Policy", "upgrade-insecure-requests");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  return response;
}

// Appliquer à toutes les routes (sauf assets Next.js automatiques)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
};
