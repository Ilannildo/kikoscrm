import { LeadDto, LeadStatus } from '@kikos/shared';
import { Lead } from 'prisma/generated/client';

export function mapLeadToDto(lead: Lead): LeadDto {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    source: lead.source,
    notes: lead.notes,
    status: lead.status as LeadStatus,
    sellerId: lead.sellerId,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export function mapLeadsToDto(leads: Lead[]): LeadDto[] {
  return leads.map(mapLeadToDto);
}
