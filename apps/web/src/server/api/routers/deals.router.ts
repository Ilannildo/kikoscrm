import { UpdateDealRequestSchema } from "@/common/schemas/update-deal-request.schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createDeal,
  deleteDeal,
  getDeal,
  listDeals,
  updateDeal,
  updateDealStatus,
} from "@/services/deals.service";
import { CreateDealSchema, DealStatus, ListDealsQuerySchema } from "@kikos/shared";
import { z } from "zod";

export const dealsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(ListDealsQuerySchema)
    .query(({ input }) => listDeals(input)),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getDeal(input.id)),
  create: protectedProcedure
    .input(CreateDealSchema)
    .mutation(({ input }) => createDeal(input)),
  update: protectedProcedure
    .input(UpdateDealRequestSchema)
    .mutation(({ input }) => updateDeal(input)),
  changeStatus: protectedProcedure
    .input(
      z.object({
        dealId: z.string(),
        status: z.nativeEnum(DealStatus),
      })
    )
    .mutation(({ input }) => updateDealStatus(input.dealId, input.status)),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deleteDeal(input.id)),
});
