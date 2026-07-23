import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { getServerSession } from "next-auth/next";
import { seedDatabaseIfEmpty } from "../lib/db-seed";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Manual ID",
      credentials: {
        username: { label: "Username / Manual ID", type: "text", placeholder: "e.g., admin1" },
        name: { label: "Name (optional)", type: "text", placeholder: "e.g., John Doe" },
        role: { label: "Role (optional)", type: "text", placeholder: "TEAM, ADMIN, or CEO" }
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;

        // Auto-seed database if empty
        await seedDatabaseIfEmpty();

        const username = credentials.username.trim();
        const roleInput = (credentials.role || "").toUpperCase();
        const role = ["TEAM", "ADMIN", "CEO"].includes(roleInput) ? (roleInput as "TEAM" | "ADMIN" | "CEO") : "TEAM";

        // Find user by username (mapped to microsoftId in db schema)
        let user = await prisma.user.findUnique({
          where: { microsoftId: username },
        });

        // Auto-create user if they don't exist yet for seamless manual usage
        if (!user) {
          user = await prisma.user.create({
            data: {
              microsoftId: username,
              name: credentials.name?.trim() || username,
              role,
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          username: user.microsoftId,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "TEAM" | "ADMIN" | "CEO";
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "default-development-secret-key",
};

const handler = NextAuth(authOptions);

export const handlers = {
  GET: handler,
  POST: handler,
};

export async function auth() {
  return await getServerSession(authOptions);
}
