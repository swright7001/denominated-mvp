import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/auth";

const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/billing(.*)",
  "/dashboard(.*)",
  "/watchlist(.*)",
  "/api/billing(.*)",
  "/api/checkout(.*)",
  "/api/email(.*)",
]);

const middleware = isClerkConfigured()
  ? clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
})
  : function passThroughMiddleware() {
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
