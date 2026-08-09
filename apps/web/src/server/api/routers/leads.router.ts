import { UpdateLeadRequestSchema } from "@/common/schemas/update-lead-request.schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createLead,
  deleteLead,
  getLead,
  listLeads,
  updateLead,
} from "@/services/leads.service";
import {
  CreateLeadSchema,
  ListLeadsQuerySchema
} from "@kikos/shared";
import { z } from "zod";

export const leadsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(ListLeadsQuerySchema)
    .query(({ input }) => listLeads(input)),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getLead(input.id)),
  create: protectedProcedure
    .input(CreateLeadSchema)
    .mutation(({ input }) => createLead(input)),
  update: protectedProcedure
    .input(UpdateLeadRequestSchema)
    .mutation(({ input }) => updateLead(input)),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deleteLead(input.id)),
});
