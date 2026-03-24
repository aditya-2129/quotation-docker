'use client';

import React from "react";

interface Option {
  label: string;
  value: string;
  sublabel?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className, ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 block px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          value={props.value || ""}
          className={`w-full bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-900 rounded-xl px-4 h-12 text-sm font-bold text-zinc-900 dark:text-zinc-100 appearance-none focus:border-black dark:focus:border-white transition-all outline-none ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        >
          <option value="" disabled>Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
      {error && (
        <p className="text-[10px] font-bold text-red-500 px-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};
