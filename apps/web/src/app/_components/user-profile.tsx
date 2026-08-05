"use client";

import { api } from "@/trpc/react";

export function UserProfile() {
  const { data: user } = api.user.me.useQuery();

  return <div className="flex items-center justify-center ">{user?.name ?? "Login"}</div>;
}
