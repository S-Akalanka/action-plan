import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (!session.user?.email) return session;

      const microsoftId = token.sub as string;

      let user = await prisma.user.findUnique({ where: { microsoftId } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            microsoftId,
            name: session.user.name ?? "Unknown",
            role: "TEAM",
          },
        });
      }

      session.user.id = user.id;
      session.user.microsoftId = user.microsoftId;
      session.user.role = user.role;

      return session;
    },
  },
});
