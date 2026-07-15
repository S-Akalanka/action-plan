// types/next-auth.d.ts
//
// Extends NextAuth's built-in Session type with the extra fields we attach
// in lib/session.ts's session() callback. Without this, TypeScript won't
// know session.user.id / .role / .microsoftId exist.

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "TEAM" | "ADMIN" | "CEO";
      microsoftId: string;
    } & DefaultSession["user"];
  }
}
