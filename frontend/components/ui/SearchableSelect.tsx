'use client';

import React, { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Search or select...",
  className = "",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative space-y-1.5 w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 block px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type="text"
          value={isOpen ? searchTerm : value || ""}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isOpen ? "Type to search..." : placeholder}
          className={`w-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-9 text-[11px] font-bold text-zinc-900 dark:text-zinc-100 focus:border-black dark:focus:border-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-all outline-none shadow-sm ${error ? 'border-red-500' : ''}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-2xl z-[100] max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-thin scrollbar-thumb-zinc-200">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className="w-full text-left px-5 py-3 text-xs font-black uppercase tracking-tight hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between group/opt"
                >
                  <span className={value === opt.value ? "text-black dark:text-white" : "text-zinc-500"}>
                    {opt.label}
                  </span>
                  {value === opt.value && (
                    <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-zinc-400">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">No matches found</p>
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[10px] font-bold text-red-500 px-1">
          {error}
        </p>
      )}
    </div>
  );
};
