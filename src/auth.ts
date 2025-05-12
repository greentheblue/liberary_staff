import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { entityPrisma } from "@/lib/db"
import { compare } from "bcryptjs"
import type { JWT } from "next-auth/jwt"
import type { Session, DefaultSession } from "next-auth"

// Define a custom user type interface
interface CustomUser {
  name: string;
  phone: string;
  email: string;
  id: string;
  entityId: string;
}

declare module "next-auth" {
  interface User {
    phone?: string;
  }

  interface Session {
    user: {
      id?: string;
      phone?: string;
      entityId?: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
          secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        emailOrPhone: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const emailOrPhone = credentials.emailOrPhone as string | undefined;
        const password = credentials.password as string | undefined;

        if (!emailOrPhone || !password) {
          throw new Error("Please provide both email & password");
        }

        // Use Prisma to find the user
        const user = await entityPrisma.staff.findFirst({
          where: {
            OR: [
              { email: emailOrPhone },
              { phone: emailOrPhone }
            ]
          }
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.pasword) {
          throw new Error("Password is missing for the user");
        }
        const isMatched = await compare(password, user.pasword);

        if (!isMatched) {
          throw new Error("Password did not match");
        }

        // Ensure the returned object matches the CustomUser type
        const userResponse: CustomUser = {
          name: user.name,
          phone: user.phone,
          email: user.email,
          id: user.id,
          entityId: user.entityId,
        };

        return userResponse;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async session({ session, token }: { session: Session, token: JWT }) {
      if (token?.sub && token?.phone) {
        session.user = session.user || {};
        session.user.id = token.sub;
        session.user.phone = token.phone as string;
        session.user.entityId = token.entityId as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.phone = customUser.phone;
          token.entityId = customUser.entityId;
      }
      return token;
    },
  },

})