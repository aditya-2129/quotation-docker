'use client';

import React from "react";
import { QuotationForm } from "@/components/features/QuotationForm";

export default function NewQuotationPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white uppercase mb-2">Create New Quotation</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Step-by-step assistant for generating a professional quotation for your clients.</p>
      </header>
      
      <QuotationForm />
    </div>
  );
}
