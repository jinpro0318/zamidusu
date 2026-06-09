"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-purple-soft group-[.toaster]:text-foreground group-[.toaster]:border-gold/30 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted",
          actionButton: "group-[.toast]:bg-gold group-[.toast]:text-purple-deep",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-muted",
        },
      }}
      {...props}
    />
  );
}
