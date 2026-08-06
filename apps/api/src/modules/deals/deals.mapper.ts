import { DealDto, DealStatus } from '@kikos/shared';
import { Deal } from 'prisma/generated/client';
import { serializeDecimal } from '@common/utils/decimal.util';

export function mapDealToDto(deal: Deal): DealDto {
  return {
    id: deal.id,
    name: deal.name,
    value: serializeDecimal(deal.value),
    status: deal.status as DealStatus,
    description: deal.description,
    leadId: deal.leadId,
    sellerId: deal.sellerId,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
  };
}

export function mapDealsToDto(deals: Deal[]): DealDto[] {
  return deals.map(mapDealToDto);
}
