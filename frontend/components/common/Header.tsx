'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { usePathname } from "next/navigation";

/**
 * Header Component
 * The primary navigation and identity element for the Quotation App.
 */
export const Header: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/quotations" },
    { name: "Materials", href: "/materials" },
    { name: "Customers", href: "/customers" },
    { name: "Labor Rates", href: "/labor-rates" },
    { name: "Tooling", href: "/tooling-rates" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel dark:bg-black/60 border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-8">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
            <div className="h-10 w-10 rounded-2xl bg-black dark:bg-white flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500">
               <span className="text-white dark:text-black font-black text-xl italic">Q</span>
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">
              Quotation <span className="text-zinc-400 font-medium lowercase">System</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-black dark:hover:text-white ${
                    isActive 
                      ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-1" 
                      : "text-zinc-400"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/quotations/new">
            <Button variant="primary" className="h-11 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 uppercase font-black text-[10px] tracking-widest">
              + New Quotation
            </Button>
          </Link>
          <div className="h-11 w-11 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group cursor-pointer hover:border-black dark:hover:border-white transition-all">
            <span className="text-xs font-black text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors">AD</span>
          </div>
        </div>
      </div>
    </header>
  );
};
