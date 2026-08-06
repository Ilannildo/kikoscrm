import { DealStatus } from '@kikos/shared';
import {
  canTransitionDealStatus,
  getTransitionErrorMessage,
} from './deal-status.transition';

describe('canTransitionDealStatus', () => {
  it('allows new → in_progress', () => {
    expect(canTransitionDealStatus(DealStatus.new, DealStatus.in_progress)).toBe(true);
  });

  it('allows in_progress → won', () => {
    expect(canTransitionDealStatus(DealStatus.in_progress, DealStatus.won)).toBe(true);
  });

  it('allows in_progress → lost', () => {
    expect(canTransitionDealStatus(DealStatus.in_progress, DealStatus.lost)).toBe(true);
  });

  it('allows same status (idempotent)', () => {
    expect(canTransitionDealStatus(DealStatus.in_progress, DealStatus.in_progress)).toBe(true);
  });

  it('denies new → won', () => {
    expect(canTransitionDealStatus(DealStatus.new, DealStatus.won)).toBe(false);
  });

  it('denies new → lost', () => {
    expect(canTransitionDealStatus(DealStatus.new, DealStatus.lost)).toBe(false);
  });

  it('denies won → in_progress', () => {
    expect(canTransitionDealStatus(DealStatus.won, DealStatus.in_progress)).toBe(false);
  });

  it('denies lost → in_progress', () => {
    expect(canTransitionDealStatus(DealStatus.lost, DealStatus.in_progress)).toBe(false);
  });

  it('denies won → lost', () => {
    expect(canTransitionDealStatus(DealStatus.won, DealStatus.lost)).toBe(false);
  });

  it('denies lost → won', () => {
    expect(canTransitionDealStatus(DealStatus.lost, DealStatus.won)).toBe(false);
  });
});

describe('getTransitionErrorMessage', () => {
  it('returns descriptive message', () => {
    const message = getTransitionErrorMessage(DealStatus.won, DealStatus.in_progress);
    expect(message).toContain('won');
    expect(message).toContain('in_progress');
  });
});
