'use client';

import React, { useState, useEffect } from "react";
import { QuotationDetail } from "@/components/features/QuotationDetail";
import { quotationService } from "@/services/QuotationService";
import { Quotation } from "@/types/quotation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * Single Quotation Detail Page
 * Route: /quotations/[id]
 */
export default function QuotationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        setIsLoading(true);
        const data = await quotationService.getQuotationById(id);
        setQuotation(data);
      } catch (error) {
        console.error("Failed to fetch quotation details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchQuotation();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen pt-40 text-center bg-white dark:bg-black">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-64 bg-zinc-50 dark:bg-zinc-900 rounded-3xl mx-auto" />
          <div className="h-4 w-48 bg-zinc-50 dark:bg-zinc-900 rounded-full mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300">Retrieving Secure Records</p>
        </div>
      </main>
    );
  }

  if (!quotation) {
    return (
      <main className="min-h-screen pt-40 text-center bg-white dark:bg-black">
        <h2 className="text-4xl font-black uppercase tracking-tight text-zinc-400">Record Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2 mb-8 uppercase tracking-widest">The requested quotation ID does not exist in the ledger.</p>
        <Link href="/quotations">
          <Button variant="outline" className="rounded-2xl border-zinc-200">Return to Dashboard</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <Link 
          href="/quotations" 
          className="inline-flex items-center gap-2 mb-8 group text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Back to Ledger</span>
        </Link>
        
        <QuotationDetail quotation={quotation} />
      </div>
    </main>
  );
}
