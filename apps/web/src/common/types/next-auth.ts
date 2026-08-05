import type { ISignInResponse } from "@kikos/shared";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: ISignInResponse & DefaultSession["user"];
  }
}
