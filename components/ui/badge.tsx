import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-gold/15 text-gold border-gold/30",
  outline: "border-white/20 text-foreground",
  destructive: "bg-rose/20 text-rose border-rose/30",
  success: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
