import { ActivityType, DealStatus } from "@kikos/shared";
import { DEAL_STATUS_META } from "@/lib/status";

export function activityMessage(
  type: ActivityType,
  metadata: Record<string, unknown> | null
): { verb: string; detail: string } {
  const dealName = metadata?.dealName as string | undefined;
  const leadName = metadata?.leadName as string | undefined;
  const value = metadata?.value as string | undefined;
  const from = metadata?.from as DealStatus | undefined;
  const to = metadata?.to as DealStatus | undefined;

  switch (type) {
    case ActivityType.LEAD_CREATED:
      return {
        verb: "criou um novo lead",
        detail: leadName ? leadName : "",
      };
    case ActivityType.LEAD_UPDATED:
      return {
        verb: "atualizou o lead",
        detail: leadName ? leadName : "",
      };
    case ActivityType.DEAL_CREATED:
      return {
        verb: "criou um novo negócio",
        detail: dealName ? dealName : "",
      };
    case ActivityType.DEAL_UPDATED:
      return {
        verb: "atualizou o negócio",
        detail: dealName ? dealName : "",
      };
    case ActivityType.DEAL_STATUS_CHANGED:
      return {
        verb: "alterou o status do negócio",
        detail:
          from && to
            ? `${dealName ?? ""} — ${DEAL_STATUS_META[from].label} › ${DEAL_STATUS_META[to].label}`
            : dealName ?? "",
      };
    case ActivityType.DEAL_WON:
      return {
        verb: "ganhou o negócio",
        detail: dealName
          ? value
            ? `${dealName} — ${value}`
            : dealName
          : "",
      };
    case ActivityType.DEAL_LOST:
      return {
        verb: "perdeu o negócio",
        detail: dealName ?? "",
      };
    case ActivityType.COMMENT_CREATED:
      return {
        verb: "adicionou um comentário",
        detail: dealName ?? leadName ?? "",
      };
    default:
      return { verb: "realizou uma ação", detail: dealName ?? leadName ?? "" };
  }
}
