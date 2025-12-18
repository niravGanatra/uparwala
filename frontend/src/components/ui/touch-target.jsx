import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * TouchTarget - Ensures minimum 44x44px touch target for accessibility
 * Wraps small interactive elements to meet iOS and Android touch guidelines
 */
const TouchTarget = React.forwardRef(
    ({ className, children, size = "default", ...props }, ref) => {
        const sizeClasses = {
            // Minimum: 44x44px (iOS HIG)
            default: "min-h-[44px] min-w-[44px]",
            // Ideal: 48x48px (Material Design)
            ideal: "min-h-[48px] min-w-[48px]",
            // Large: 56x56px (prominent actions)
            large: "min-h-[56px] min-w-[56px]",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center",
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
TouchTarget.displayName = "TouchTarget"

/**
 * TouchableIcon - Icon button with guaranteed touch target
 */
const TouchableIcon = React.forwardRef(
    ({ className, children, onClick, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                onClick={onClick}
                className={cn(
                    "inline-flex items-center justify-center",
                    "min-h-[44px] min-w-[44px]",
                    "rounded-lg",
                    "text-slate-600 hover:text-slate-900",
                    "hover:bg-slate-100 active:bg-slate-200",
                    "transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)
TouchableIcon.displayName = "TouchableIcon"

export { TouchTarget, TouchableIcon }
