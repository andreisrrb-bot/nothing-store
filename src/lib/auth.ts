import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        isRegister: { label: "Inscription", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Veuillez remplir tous les champs.");
        }

        const isRegister = credentials.isRegister === "true";
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        const role = credentials.email.includes("admin") ? "ADMIN" : "USER";

        if (isRegister) {
          if (user) {
            throw new Error("Cet email possède déjà un compte.");
          }
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: role
            }
          });
          return newUser;
        } else {
          if (!user) {
            throw new Error("Aucun compte trouvé. Veuillez en créer un.");
          }
          return user;
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role;
      } else {
        const dbUser = await prisma.user.findUnique({ where: { id: token.sub! } });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    }
  }
};
