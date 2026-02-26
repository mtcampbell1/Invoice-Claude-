import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /favicon.ico, /robots.txt, etc.
  // - Static files with extensions
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
