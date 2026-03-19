import { cn } from "@/lib/utils"

export function BdtIcon({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center justify-center font-bold leading-none", className)}>
      ৳
    </span>
  )
}
