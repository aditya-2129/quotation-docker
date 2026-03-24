'use client';

import React, { useState, useEffect } from "react";
import { Quotation, QuotationStatus } from "@/types/quotation";
import { quotationService } from "@/services/QuotationService";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

import { useRouter } from "next/navigation";

/**
 * QuotationDashboard Component
 * Main overview of all quotations in the ledger.
 */
export const QuotationDashboard: React.FC = () => {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      const data = await quotationService.getAllQuotations();
      setQuotations(data);
    } catch (error) {
      console.error("Failed to load quotations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = 
      q.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quotation_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.part_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white">Quotation Ledger</h1>
          <p className="text-sm text-zinc-500 uppercase tracking-widest mt-1">Management of history and active quotes.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Quotes</span>
            <span className="text-xl font-black text-black dark:text-white">{quotations.length}</span>
          </div>
          <Link href="/quotations/new">
            <Button variant="primary" size="lg" className="rounded-2xl shadow-xl shadow-black/10">
              Generate New Quote
            </Button>
          </Link>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <Card className="p-4 border-zinc-100 dark:border-zinc-900 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <Input 
            placeholder="Search by Client, QT Number, or Part Number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none bg-transparent h-10 font-mono text-sm focus:ring-0"
          />
        </div>
        <div className="hidden md:block h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {["all", "draft", "sent", "accepted", "rejected"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                statusFilter === status 
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-lg" 
                  : "bg-zinc-100 text-zinc-400 hover:text-black dark:bg-zinc-900 dark:hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </Card>

      {/* DASHBOARD TABLE */}
      <Card className="overflow-hidden border-zinc-100 dark:border-zinc-900 shadow-xl">
        <table className="w-full text-left font-mono text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">QT Number</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Supplier / Client</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Part Details</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Total Value</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Status</th>
              <th className="px-6 py-5 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <span className="text-zinc-400 uppercase text-xs italic animate-pulse">Synchronizing with ledger...</span>
                </td>
              </tr>
            ) : filteredQuotations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <span className="text-zinc-400 uppercase text-xs italic">No quotation records found.</span>
                </td>
              </tr>
            ) : (
              filteredQuotations.map((q) => (
                <tr 
                  key={q.$id} 
                  onClick={() => router.push(`/quotations/${q.$id}`)}
                  className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <span className="text-black dark:text-white font-black uppercase tracking-tight block">
                      {q.quotation_no}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase">{q.issue_date || "-"}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300 uppercase truncate max-w-[180px]">
                    {q.supplier_name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-black dark:text-white truncate max-w-[180px] text-xs">
                      {q.part_number}
                    </div>
                    <div className="text-[10px] text-zinc-400 uppercase truncate max-w-[180px]">
                      {q.part_description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-black dark:text-white">
                    {q.currency === "USD" ? "$" : q.currency === "EUR" ? "€" : "₹"}
                    {q.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                      q.status === QuotationStatus.ACCEPTED 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50" 
                        : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-300 hover:text-black dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
