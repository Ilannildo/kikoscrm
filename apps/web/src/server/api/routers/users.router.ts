import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { UserRole } from "@kikos/shared";
import { z } from "zod";
import { createUser, me } from "@/services/users.service";

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(() => me()),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "O nome é um campo obrigatório"),
        email: z.string().email("Formato de e-mail inválido"),
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
        role: z.enum([UserRole.admin, UserRole.seller]),
      })
    )
    .mutation(({ input }) => createUser(input)),
});
