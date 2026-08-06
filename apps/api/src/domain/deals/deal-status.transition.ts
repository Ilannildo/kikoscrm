import { DealStatus } from '@kikos/shared';

/**
 * Regras de transição de status de negócios:
 *
 * - new → in_progress
 * - in_progress → won | lost
 * - won e lost são estados terminais (sem transições permitidas)
 * - Mesmo status: permitido (idempotente)
 */
const VALID_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  [DealStatus.new]: [DealStatus.in_progress],
  [DealStatus.in_progress]: [DealStatus.won, DealStatus.lost],
  [DealStatus.won]: [],
  [DealStatus.lost]: [],
};

export function canTransitionDealStatus(
  currentStatus: DealStatus,
  nextStatus: DealStatus,
): boolean {
  if (currentStatus === nextStatus) {
    return true;
  }

  return VALID_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;
}

export function getTransitionErrorMessage(
  currentStatus: DealStatus,
  nextStatus: DealStatus,
): string {
  return `Transição de status inválida: ${currentStatus} → ${nextStatus}. Estados terminais (won/lost) não permitem alterações.`;
}
