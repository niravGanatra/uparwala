import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm hover:shadow-md",
                destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
                outline: "border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400",
                secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
                ghost: "hover:bg-slate-100 hover:text-slate-900",
                link: "text-orange-600 underline-offset-4 hover:underline",
            },
            size: {
                // Mobile-first: 48px height (ideal touch target)
                default: "h-12 px-6 py-3 min-w-[44px]",
                // Small: 44px height (minimum touch target)
                sm: "h-11 px-4 py-2 text-sm min-w-[44px]",
                // Large: 56px height (prominent CTAs)
                lg: "h-14 px-8 py-4 text-lg min-w-[44px]",
                // Icon: 44x44px minimum
                icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
