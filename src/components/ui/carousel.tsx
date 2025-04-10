"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselProps = {
  children: React.ReactNode[]
  className?: string
  showArrows?: boolean
  showDots?: boolean
  autoPlay?: boolean
  interval?: number
  loop?: boolean
}

export function Carousel({
  children,
  className,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  interval = 5000,
  loop = true,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isHovering, setIsHovering] = React.useState(false)
  const totalSlides = React.Children.count(children)

  const nextSlide = React.useCallback(() => {
    if (currentIndex === totalSlides - 1) {
      if (loop) setCurrentIndex(0)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, totalSlides, loop])

  const prevSlide = React.useCallback(() => {
    if (currentIndex === 0) {
      if (loop) setCurrentIndex(totalSlides - 1)
    } else {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex, totalSlides, loop])

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (autoPlay && !isHovering) {
      intervalId = setInterval(() => {
        nextSlide()
      }, interval)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [autoPlay, interval, nextSlide, isHovering])

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${totalSlides * 100}%`,
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="relative w-full"
            style={{ width: `${100 / totalSlides}%` }}
          >
            {child}
          </div>
        ))}
      </div>

      {showArrows && totalSlides > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 opacity-70 hover:opacity-100"
            onClick={prevSlide}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 opacity-70 hover:opacity-100"
            onClick={nextSlide}
          >
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Next slide</span>
          </Button>
        </>
      )}

      {showDots && totalSlides > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full bg-background/50 transition-all",
                currentIndex === index ? "w-4 bg-primary" : "bg-background/50"
              )}
              onClick={() => setCurrentIndex(index)}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
