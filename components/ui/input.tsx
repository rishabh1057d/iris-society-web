import * as React from "react"

import { cn } from "../../lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 min-h-[48px] w-full rounded-xl border border-white/15 bg-slate-950/50 px-4 py-2 text-base text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-400/80 transition-[border-color,box-shadow,background] duration-200 ease-out focus-visible:outline-none focus-visible:border-blue-400/70 focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:bg-slate-950/70 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
