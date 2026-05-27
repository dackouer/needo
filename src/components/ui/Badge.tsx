import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type BadgeTone = "green" | "yellow" | "red" | "blue" | "neutral" | "dark";

const tones: Record<BadgeTone, string> = {
  green: "bg-mint/20 text-[#2f6846]",
  yellow: "bg-lemon/25 text-[#795b00]",
  red: "bg-coral/15 text-[#a63f32]",
  blue: "bg-sky/20 text-[#245a80]",
  neutral: "bg-black/5 text-ink",
  dark: "bg-ink text-white"
};

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
