import * as React from "react";
import {
  ActivityType,
  type ActivityDto,
} from "@kikos/shared";
import { Avatar } from "@kikos/ui/components/avatar";
import { Card } from "@kikos/ui/components/card";
import { EmptyState } from "@kikos/ui/components/empty-state";
import { timeAgo } from "@kikos/shared/src/utils/format";
import { cn } from "@/lib/utils";

interface RecentActivitiesProps {
  activities: ActivityDto[];
  className?: string;
}

interface ActivityMessage {
  action: string;
  subject?: string;
}

function describeActivity(activity: ActivityDto): ActivityMessage {
  const context = activity.metadata as Record<string, unknown> | null;
  const subject = typeof context?.subject === "string" ? context.subject : undefined;

  switch (activity.type) {
    case ActivityType.LEAD_CREATED:
      return { action: "criou um novo lead", subject };
    case ActivityType.LEAD_UPDATED:
      return { action: "atualizou um lead", subject };
    case ActivityType.DEAL_CREATED:
      return { action: "criou um novo negócio", subject };
    case ActivityType.DEAL_UPDATED:
      return { action: "atualizou um negócio", subject };
    case ActivityType.DEAL_STATUS_CHANGED:
      return { action: "alterou o status de um negócio", subject };
    case ActivityType.COMMENT_CREATED:
      return { action: "adicionou um comentário", subject };
    case ActivityType.DEAL_WON:
      return { action: "marcou um negócio como ganho", subject };
    case ActivityType.DEAL_LOST:
      return { action: "marcou um negócio como perdido", subject };
    default:
      return { action: "realizou uma ação", subject };
  }
}

/**
 * Compact timeline of recent commercial activities.
 * Preserves the structural space of the widget even when empty.
 */
export function RecentActivities({
  activities,
  className,
}: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <Card className={cn("p-4", className)}>
        <h3 className="text-sm font-semibold text-foreground">
          Atividades recentes
        </h3>
        <EmptyState
          icon={<span className="text-lg">•</span>}
          title="Nenhuma atividade recente"
          description="As atividades comerciais aparecerão aqui."
          className="mt-4 min-h-[180px]"
        />
      </Card>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <h3 className="text-sm font-semibold text-foreground">
        Atividades recentes
      </h3>

      <ol className="mt-4 space-y-1 max-h-72 overflow-y-auto">
        {activities.map((activity) => {
          const { action, subject } = describeActivity(activity);
          return (
            <li
              key={activity.id}
              className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
            >
              <Avatar
                name={activity.userName ?? "?"}
                size="sm"
                className="mt-0.5 size-7 text-[9px]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] leading-snug text-foreground">
                  <span className="font-semibold">
                    {activity.userName ?? "Usuário"}
                  </span>{" "}
                  <span className="text-muted-foreground">{action}</span>
                  {subject && (
                    <span className="font-medium text-foreground/90">
                      {" "}
                      {subject}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {timeAgo(activity.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
