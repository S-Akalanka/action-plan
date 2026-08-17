import { handlers } from "@/lib/session";

// GET /api/auth/[...nextauth] — NextAuth provider callbacks and authentication routes
// POST /api/auth/[...nextauth] — NextAuth signin/callback handling
export const { GET, POST } = handlers;
