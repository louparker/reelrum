import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
        destructive:
          "bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-300/20 dark:focus-visible:ring-red-300/40",
        outline:
          "border border-zinc-300 bg-white text-zinc-900 shadow-xs hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
        secondary:
          "bg-zinc-200 text-zinc-900 shadow-xs hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600",
        ghost:
          "text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
        rum: 
          "bg-amber-600 text-white shadow-xs hover:bg-amber-700 focus-visible:ring-amber-300/50",
        teal:
          "bg-teal-600 text-white shadow-xs hover:bg-teal-700 focus-visible:ring-teal-300/50",
        "rum-outline":
          "border border-amber-600 bg-white text-amber-600 shadow-xs hover:bg-amber-50 dark:bg-zinc-900 dark:hover:bg-zinc-800",
        "teal-outline":
          "border border-teal-600 bg-white text-teal-600 shadow-xs hover:bg-teal-50 dark:bg-zinc-900 dark:hover:bg-zinc-800",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
