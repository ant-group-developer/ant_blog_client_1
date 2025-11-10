import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./src/i18n/routing";

const nextIntlMiddleware = createMiddleware(routing);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/admin/users", req.url));
  }

  return nextIntlMiddleware(req);
}

// Optional: apply to all routes
export const config = {
  matcher: ["/"],
};
