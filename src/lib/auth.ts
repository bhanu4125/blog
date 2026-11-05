import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string" ||
          credentials.email.length > 254 ||
          credentials.password.length > 1024
        ) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        if (!email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (
          !user ||
          !(await compare(credentials.password, user.passwordHash))
        ) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.imageUrl,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
};
