import { NextRequest, NextResponse } from "next/server";

// Middleware de sécurité pour HTTPS et headers
export default function middleware(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host");
  
  // Skip HTTPS redirect for localhost and development environments
  if (
    host?.startsWith("localhost") ||
    host?.startsWith("127.0.0.1") ||
    process.env.NODE_ENV === "development"
  ) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
  
  // Redirect to HTTPS if the connection is using HTTP
  if (forwardedProto && forwardedProto !== "https") {
    return NextResponse.redirect(
      new URL(`https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`),
      301
    );
  }
  
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

// Fonction utilitaire pour ajouter les en-têtes de sécurité
function addSecurityHeaders(response: NextResponse) {
  // Strict-Transport-Security header
  response.headers.set(
    "Strict-Transport-Security", 
    "max-age=31536000; includeSubDomains; preload"
  );
  
  // Content-Security-Policy for secure connections
  response.headers.set(
    "Content-Security-Policy", 
    "upgrade-insecure-requests"
  );
  
  // Additional security headers
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  return response;
}

// Configuration du matcher pour le middleware
export const config = {
  matcher: ["/:path*"],
};
