import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { SignInRequestSchema } from "@kikos/shared";
import { signIn } from "@/services/auth.service";

class InvalidLoginError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.code = message;
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: process.env.NODE_ENV === "production" ? true : undefined,
  providers: [
    Credentials({
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const signInRequestData = await SignInRequestSchema.parseAsync({
            email: credentials.email,
            password: credentials.password,
          });

          const response = await signIn(signInRequestData);

          if (!response) return null;

          return {
            id: response.accessToken,
            ...response,
          };
        } catch (error: any) {
          console.log("sign in error: ", error);
          throw new InvalidLoginError(
            error?.response?.data?.message ??
              "No momento, não foi possível efetuar o login. Por favor, tente novamente!"
          );
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  callbacks: {
    jwt: async ({ token, user, session }) => {
      return { ...token, ...user, ...session };
    },
    session: async ({ session, token }) => {
      session.user = token as any;
      return session;
    },
    authorized: ({ auth }) => {
      return !!auth;
    },
  },
} satisfies NextAuthConfig;
