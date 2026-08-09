import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@kikos/ui/components/card";
import { Avatar } from "@kikos/ui/components/avatar";
import { EmptyState } from "@kikos/ui/components/empty-state";
import { ActivityType } from "@kikos/shared";
import type { ActivityDto } from "@kikos/shared";
import { timeAgo } from "@kikos/shared/src/utils/format";
import { activityMessage } from "@/lib/activity";

interface RecentActivitiesProps {
  activities: ActivityDto[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Nenhuma atividade recente"
            description="As atividades comerciais aparecerão aqui."
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 max-h-60 overflow-y-auto">
          {activities.map((activity) => {
            const { verb, detail } = activityMessage(
              activity.type as ActivityType,
              activity.metadata
            );
            return (
              <li
                key={activity.id}
                className="flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/40"
              >
                <Avatar
                  name={activity.userName ?? undefined}
                  size="sm"
                  className="mt-0.5 size-7 shrink-0 text-[10px]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-foreground">
                    <span className="font-semibold">
                      {activity.userName ?? "Usuário"}
                    </span>{" "}
                    <span className="text-muted-foreground">{verb}</span>
                  </p>
                  {detail && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {detail}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                    {timeAgo(activity.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
