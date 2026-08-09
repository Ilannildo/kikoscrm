import { DealStatus, LeadStatus } from "@kikos/shared";
import type { BadgeVariant } from "@/components/ui/badge";

export const DEAL_STATUS_ORDER: DealStatus[] = [
  DealStatus.new,
  DealStatus.in_progress,
  DealStatus.won,
  DealStatus.lost,
];

export const DEAL_STATUS_META: Record<
  DealStatus,
  { label: string; badge: BadgeVariant; dot: string }
> = {
  [DealStatus.new]: {
    label: "Novo",
    badge: "info",
    dot: "bg-sky-400",
  },
  [DealStatus.in_progress]: {
    label: "Em andamento",
    badge: "warning",
    dot: "bg-amber-400",
  },
  [DealStatus.won]: {
    label: "Ganho",
    badge: "success",
    dot: "bg-emerald-400",
  },
  [DealStatus.lost]: {
    label: "Perdido",
    badge: "danger",
    dot: "bg-red-400",
  },
};

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  LeadStatus.new,
  LeadStatus.contacted,
  LeadStatus.qualified,
  LeadStatus.converted,
  LeadStatus.lost,
];

export const LEAD_STATUS_META: Record<
  LeadStatus,
  { label: string; badge: BadgeVariant; dot: string }
> = {
  [LeadStatus.new]: {
    label: "Novo",
    badge: "info",
    dot: "bg-sky-400",
  },
  [LeadStatus.contacted]: {
    label: "Contatado",
    badge: "warning",
    dot: "bg-amber-400",
  },
  [LeadStatus.qualified]: {
    label: "Qualificado",
    badge: "primary",
    dot: "bg-violet-400",
  },
  [LeadStatus.converted]: {
    label: "Convertido",
    badge: "success",
    dot: "bg-emerald-400",
  },
  [LeadStatus.lost]: {
    label: "Perdido",
    badge: "danger",
    dot: "bg-red-400",
  },
};
