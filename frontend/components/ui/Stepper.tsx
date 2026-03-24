'use client';

import React from "react";

interface StepperProps {
  currentStep: number;
  steps: { label: string }[];
}

/**
 * Stepper Component: "The Monochrome Registry"
 * A sleek, high-contrast progress indicator that matches the classical document style.
 */
export const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="relative flex justify-between items-center">
        
        {/* Background Connection Line (Thin and Subtle) */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-zinc-100 dark:bg-zinc-900 -translate-y-1/2 z-0 rounded-full" />
        
        {/* Active Progress Line (Solid Black) */}
        <div 
          className="absolute top-1/2 left-0 h-[3px] bg-black dark:bg-white -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out rounded-full" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center group">
              
              {/* Step Label (Above Circle - Sharp and High Contrast) */}
              <div className="absolute -top-10 whitespace-nowrap">
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${
                  isActive ? "text-black dark:text-white translate-y-[-2px]" : 
                  isCompleted ? "text-zinc-500 opacity-60" : "text-zinc-200"
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Step Circle (Concentric and Modern) */}
              <div 
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-700 border-2 ${
                  isCompleted 
                    ? "bg-black border-black dark:bg-white dark:border-white shadow-lg" 
                    : isActive 
                    ? "bg-white border-black dark:bg-zinc-950 dark:border-white scale-110 shadow-xl" 
                    : "bg-white border-zinc-100 dark:bg-zinc-950 dark:border-zinc-900 shadow-sm"
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black animate-in zoom-in duration-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <div className={`h-2 w-2 rounded-full transition-all duration-700 ${
                    isActive ? "bg-black dark:bg-white animate-pulse" : "bg-zinc-100 dark:bg-zinc-800"
                  }`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
