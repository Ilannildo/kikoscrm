import { UpdateDealRequestSchema } from "@/common/schemas/update-deal-request.schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createDeal, listDeals, updateDeal } from "@/services/deals.service";
import { CreateDealSchema, ListDealsQuerySchema } from "@kikos/shared";

export const dealsRouter = createTRPCRouter({
  list: protectedProcedure.input(ListDealsQuerySchema).query(({ input }) => listDeals(input)),
  create: protectedProcedure
    .input(CreateDealSchema)
    .mutation(({ input }) => createDeal(input)),
  update: protectedProcedure
    .input(UpdateDealRequestSchema)
    .mutation(({ input }) => updateDeal(input)),
});
