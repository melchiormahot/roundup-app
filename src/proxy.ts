import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/session";

const sessionOptions = {
  password: process.env.SESSION_SECRET || "roundup-dev-secret-key-must-be-at-least-32-chars",
  cookieName: "roundup_session",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicPaths = ["/login", "/signup", "/api/auth/login", "/api/auth/signup", "/api/early-access", "/api/charities"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check session
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/charities/:path*",
    "/tax/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/api/((?!auth).*)",
  ],
};
