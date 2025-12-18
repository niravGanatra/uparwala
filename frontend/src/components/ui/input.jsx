import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // Mobile-first: 56px height, 16px font prevents iOS zoom
                    "flex h-14 w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3",
                    "text-base text-slate-900 placeholder:text-slate-400",
                    "transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
                    "file:border-0 file:bg-transparent file:text-base file:font-medium",
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
