'use client'

import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PlanningStepIndicatorProps {
  currentStep: number
  steps: string[]
}

export function PlanningStepIndicator({
  currentStep,
  steps,
}: PlanningStepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop: show all steps */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isFuture = index > currentStep

          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                {/* Circle */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all',
                    isCompleted &&
                      'bg-meals-success text-white',
                    isCurrent &&
                      'bg-meals-highlight text-white ring-2 ring-meals-highlight/20 ring-offset-2 warm-shadow-sm scale-110',
                    isFuture &&
                      'border-2 border-border bg-card text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    isCurrent && 'text-foreground',
                    isCompleted && 'text-foreground/70',
                    isFuture && 'text-muted-foreground/60'
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line (not after the last step) */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 mt-[-1.25rem] h-px flex-1',
                    index < currentStep ? 'bg-meals-success' : 'bg-border'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: only show current step */}
      <div className="flex sm:hidden items-center justify-center gap-3">
        {/* Dots for all steps */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index < currentStep && 'bg-meals-success',
                index === currentStep && 'bg-meals-highlight h-2.5 w-2.5',
                index > currentStep && 'bg-border'
              )}
            />
          ))}
        </div>

        {/* Current step label */}
        <span className="text-sm font-semibold text-foreground">
          {steps[currentStep]}
        </span>

        {/* Step counter */}
        <span className="text-xs text-muted-foreground">
          {currentStep + 1}/{steps.length}
        </span>
      </div>
    </div>
  )
}
