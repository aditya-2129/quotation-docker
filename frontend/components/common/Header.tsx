'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * Header Component
 * The primary navigation and identity element for the Quotation App.
 */
export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-black dark:text-white">
              Quotation <span className="text-zinc-600 font-medium dark:text-zinc-400">System</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/quotations" 
              className="text-sm font-semibold text-zinc-900 hover:opacity-70 dark:text-zinc-100 transition-opacity"
            >
              Dashboard
            </Link>
            <Link 
              href="/materials" 
              className="text-sm font-semibold text-zinc-900 hover:opacity-70 dark:text-zinc-100 transition-opacity"
            >
              Materials Library
            </Link>
            <Link 
              href="/customers" 
              className="text-sm font-semibold text-zinc-900 hover:opacity-70 dark:text-zinc-100 transition-opacity"
            >
              Customer Base
            </Link>
            <Link 
              href="/labor-rates" 
              className="text-sm font-semibold text-zinc-900 hover:opacity-70 dark:text-zinc-100 transition-opacity"
            >
              Labor Rates
            </Link>
            <Link 
              href="/tooling-rates" 
              className="text-sm font-semibold text-zinc-900 hover:opacity-70 dark:text-zinc-100 transition-opacity"
            >
              Tooling Rates
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/quotations/new">
            <Button variant="primary" size="sm">
              + New Quotation
            </Button>
          </Link>
          <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">AD</span>
          </div>
        </div>
      </div>
    </header>
  );
};
