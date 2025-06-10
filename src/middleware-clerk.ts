import { authMiddleware } from "@clerk/nextjs";
 
// Ce middleware protègera les routes Clerk
export default authMiddleware({
  // Routes publiques qui ne nécessitent pas d'authentification
  publicRoutes: [
    "/",
    "/blog",
    "/blog/(.*)",
    "/programs",
    "/programs/(.*)",
    "/api/public/(.*)",
    "/api/webhooks/(.*)",
    "/api/auth/jwt/(.*)", // Routes pour JWT auth (emails)
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/about",
    "/contact"
  ],
  // Routes ignorées par Clerk (gérées par d'autres systèmes)
  ignoredRoutes: [
    "/api/auth/jwt/(.*)", // Routes pour JWT auth (emails)
    "/api/admin/(.*)",    // Routes admin protégées par verifyAuthAdmin
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
