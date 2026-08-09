import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createDealComment, listDealComments } from "@/services/comments.service";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  listByDeal: protectedProcedure
    .input(z.object({ dealId: z.string() }))
    .query(({ input }) => listDealComments(input.dealId)),
  createForDeal: protectedProcedure
    .input(z.object({ dealId: z.string(), content: z.string().min(1).max(2000) }))
    .mutation(({ input }) =>
      createDealComment(input.dealId, { content: input.content })
    ),
});
