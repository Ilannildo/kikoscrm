import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getSeller, listSellers } from "@/services/sellers.service";
import { ListSellersQuerySchema } from "@kikos/shared";
import { z } from "zod";

export const sellersRouter = createTRPCRouter({
  list: protectedProcedure
    .input(ListSellersQuerySchema)
    .query(({ input }) => listSellers(input)),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getSeller(input.id)),
});
