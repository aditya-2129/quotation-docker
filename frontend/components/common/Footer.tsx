'use client';

import React from "react";
import Link from "next/link";

/**
 * Footer Component
 * A consistent footer element for all pages of the Quotation App.
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="container mx-auto px-6 py-6 font-mono">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
             <span className="text-sm font-bold tracking-tight text-black dark:text-white uppercase">
              QS v1.0
            </span>
            <span className="text-xs text-zinc-400 uppercase tracking-widest px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 rounded">
              Production
            </span>
          </div>
          
          <div className="flex gap-6">
            <Link href="/help" className="text-xs text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
              Internal Documentation
            </Link>
            <Link href="/support" className="text-xs text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
              IT Support
            </Link>
          </div>

          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase">
            &copy; {currentYear} Internal Systems Unit. Confidential.
          </p>
        </div>
      </div>
    </footer>
  );
};
