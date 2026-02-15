import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-[#90CAF9] text-gray-900 hover:bg-[#64B5F6] font-semibold shadow-md",
      destructive: "bg-[#EF9A9A] text-gray-900 hover:bg-[#E57373] font-semibold shadow-md",
      outline: "border-2 border-[#90CAF9] bg-white hover:bg-[#E3F2FD] text-gray-900 font-semibold",
      secondary: "bg-[#E3F2FD] text-gray-900 hover:bg-[#BBDEFB] font-semibold",
      ghost: "hover:bg-[#E3F2FD] hover:text-gray-900",
      link: "text-[#64B5F6] underline-offset-4 hover:underline",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    const Comp = asChild ? "span" : "button"

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref as any}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
