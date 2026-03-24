'use client';

import React, { useState, useEffect } from "react";
import { QuotationForm } from "@/components/features/QuotationForm";
import { quotationService } from "@/services/QuotationService";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";

export default function EditQuotationPage() {
  const params = useParams();
  const id = params.id as string;
  const [quotation, setQuotation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        setIsLoading(true);
        const data = await quotationService.getQuotationById(id);
        setQuotation(data);
      } catch (error) {
        console.error("Failed to load quotation for editing:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchQuotation();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-40 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-64 bg-zinc-100 dark:bg-zinc-800 rounded-full mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300">Unlocking Ledger Record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <header className="mb-12 flex justify-between items-end border-b-2 border-zinc-100 dark:border-zinc-900 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white uppercase leading-none italic">Re-evaluate Quotation</h1>
          <p className="text-xs text-zinc-500 mt-2 uppercase font-medium tracking-widest">A-2024 Audit Re-entry • Current ID: {quotation?.quotation_no}</p>
        </div>
        <div className="px-3 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-lg text-[10px] font-black text-amber-600 uppercase tracking-widest">
           Live Revision Mode
        </div>
      </header>
      
      <QuotationForm initialData={quotation} />
    </div>
  );
}
