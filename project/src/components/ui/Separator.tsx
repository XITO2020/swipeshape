import { cn } from "@/lib/utils";

interface SeparatorProps {
  className?: string;
}

export function Separator({ className }: SeparatorProps) {
  return (
    <div
      className={cn("h-px w-full bg-gray-200 my-4", className)}
    />
  );
}
