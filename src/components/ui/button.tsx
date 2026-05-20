import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium leading-normal transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none select-none focus-visible:shadow-[var(--shadow-focus)]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-[var(--accent-hover)] active:opacity-90",
        outline:
          "bg-transparent text-foreground border border-border hover:bg-accent active:opacity-90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--shadow-sm)] hover:bg-accent active:opacity-90",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:opacity-90",
        destructive:
          "bg-destructive text-white shadow-[var(--shadow-sm)] hover:bg-destructive/90 active:opacity-90",
        link:
          "text-primary underline-offset-4 hover:underline",
        pill:
          "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-[var(--accent-hover)] active:opacity-90",
      },
      size: {
        default: "h-9 gap-2 px-4 py-2",
        sm: "h-8 gap-1.5 px-3 py-1.5 text-xs",
        lg: "h-11 gap-2 px-6 py-2",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
