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
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    isCompleted &&
                      'bg-slate-900 text-white',
                    isCurrent &&
                      'bg-slate-900 text-white ring-2 ring-slate-900/20 ring-offset-2',
                    isFuture &&
                      'border border-slate-300 bg-white text-slate-400'
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
                    isCurrent && 'text-slate-900',
                    isCompleted && 'text-slate-600',
                    isFuture && 'text-slate-400'
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
                    index < currentStep ? 'bg-slate-900' : 'bg-slate-200'
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
                'h-2 w-2 rounded-full transition-colors',
                index < currentStep && 'bg-slate-900',
                index === currentStep && 'bg-slate-900 h-2.5 w-2.5',
                index > currentStep && 'bg-slate-300'
              )}
            />
          ))}
        </div>

        {/* Current step label */}
        <span className="text-sm font-semibold text-slate-900">
          {steps[currentStep]}
        </span>

        {/* Step counter */}
        <span className="text-xs text-slate-500">
          {currentStep + 1}/{steps.length}
        </span>
      </div>
    </div>
  )
}
