"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingProps {
  value: number
  max?: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  color?: string
}

export function Rating({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = "md",
  className,
  color = "text-rum-500", // Using ReelRum orange as default
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)

  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index + 1)
    }
  }

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverValue(index + 1)
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null)
    }
  }

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const starSize = sizeClasses[size]

  return (
    <div
      className={cn("flex items-center", className)}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: max }).map((_, index) => {
        const isActive = (hoverValue || value) > index
        
        return (
          <Star
            key={index}
            className={cn(
              starSize,
              "cursor-pointer transition-colors",
              isActive ? color : "text-gray-300",
              !readOnly && "cursor-pointer"
            )}
            fill={isActive ? "currentColor" : "none"}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
          />
        )
      })}
    </div>
  )
}
