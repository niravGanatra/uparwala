import * as React from "react"
import { cn } from "../../lib/utils"

const MobileCard = React.forwardRef(
    ({ className, children, onClick, ...props }, ref) => {
        return (
            <div
                ref={ref}
                onClick={onClick}
                className={cn(
                    // Base mobile card styling
                    "bg-white rounded-xl border border-slate-200 shadow-sm",
                    "p-4 space-y-3",
                    "transition-all duration-200",
                    // Touchable states
                    onClick && "active:scale-[0.98] cursor-pointer hover:shadow-md hover:border-slate-300",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
MobileCard.displayName = "MobileCard"

const MobileCardHeader = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("flex items-start justify-between gap-2", className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
MobileCardHeader.displayName = "MobileCardHeader"

const MobileCardTitle = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={cn("text-lg font-semibold text-slate-900 leading-tight", className)}
                {...props}
            >
                {children}
            </h3>
        )
    }
)
MobileCardTitle.displayName = "MobileCardTitle"

const MobileCardContent = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("text-base text-slate-600 space-y-2", className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
MobileCardContent.displayName = "MobileCardContent"

const MobileCardFooter = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center gap-2 pt-2 border-t border-slate-100",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
MobileCardFooter.displayName = "MobileCardFooter"

const MobileCardRow = React.forwardRef(
    ({ label, value, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("flex justify-between items-center py-1", className)}
                {...props}
            >
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-base font-medium text-slate-900">{value}</span>
            </div>
        )
    }
)
MobileCardRow.displayName = "MobileCardRow"

export {
    MobileCard,
    MobileCardHeader,
    MobileCardTitle,
    MobileCardContent,
    MobileCardFooter,
    MobileCardRow,
}
