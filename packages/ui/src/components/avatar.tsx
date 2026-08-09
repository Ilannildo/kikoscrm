import * as React from "react";
import { cn } from "../lib/utils";
import { initials } from "@kikos/shared/src/utils/format";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
};

export function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      data-slot="avatar"
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/70 to-primary/40 font-semibold text-primary-foreground ring-1 ring-border",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ""} className="size-full object-cover" />
      ) : (
        <span>{name ? initials(name) : "?"}</span>
      )}
    </div>
  );
}
