"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/shared/lib/utils"

const Slider = React.memo(React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, onValueChange, ...props }, ref) => {
  // Optimize value change handling with useCallback
  const handleValueChange = React.useCallback((values: number[]) => {
    if (onValueChange) {
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        onValueChange(values);
      });
    }
  }, [onValueChange]);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center cursor-pointer",
        className,
      )}
      onValueChange={handleValueChange}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gray-200 hover:bg-gray-250 transition-colors duration-150">
        <SliderPrimitive.Range className="absolute h-full bg-alpine-blue-500 transition-none" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-3 border-alpine-blue-500 bg-white shadow-lg ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpine-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:shadow-xl active:scale-105 cursor-grab active:cursor-grabbing will-change-transform" />
    </SliderPrimitive.Root>
  );
}));

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider } 