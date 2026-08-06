import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { me } from "@/services/users.service";

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(() => me()),
});
