import { NextAuthOptions } from "next-auth";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { UserTable } from "@/db/schema";
import GitHubProvider from "next-auth/providers/github";

export const AuthOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, profile, account }) {
      try {
        const githubLogin = (profile as any)?.login;
        if (!githubLogin) return false;
        const exisitingUser = await db.query.UserTable.findFirst({
          where: eq(UserTable.githubId, githubLogin),
        });

        if (!exisitingUser) {
          await db.insert(UserTable).values({
            name: user.name || "",
            email: user.email!,
            githubId: githubLogin,
            accessToken: account?.access_token,
            imageUrl: user.image,
          });
        }
      } catch (error) {
        console.log("SignIn error:", error);
        return false;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.githubId = account.providerAccountId;
        token.githubUsername = (profile as any).login;
      }

      if (user) {
        const githubLogin = (profile as any)?.login ?? token.githubUsername;
        const dbUser = githubLogin
          ? await db.query.UserTable.findFirst({
              where: eq(UserTable.githubId, githubLogin),
            })
          : null;

        token.id = dbUser ? dbUser.id : user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          name: token.name as string,
          email: token.email as string,
          image: token.picture as string,
          accessToken: token.accessToken as string,
          githubId: token.githubId as string,
          githubUsername: token.githubUsername as string,
        };
      }

      return session;
    },
  },

  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: "read:user repo" },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
        };
      },
    }),
  ],
};
