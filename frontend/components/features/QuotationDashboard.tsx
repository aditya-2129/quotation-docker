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
      <Card variant="glass" className="p-2 shadow-premium flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full pl-4 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <Input 
            placeholder="Filter Ledger: Client, QT Number, or Part Number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none bg-transparent h-12 font-sans font-bold text-sm focus:ring-0 w-full uppercase tracking-tight"
          />
        </div>
        <div className="hidden md:block h-8 w-px bg-zinc-200/50 dark:bg-zinc-800/50" />
        <div className="flex items-center gap-2 px-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {["all", "draft", "sent", "accepted", "rejected"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                statusFilter === status 
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg" 
                  : "bg-white text-zinc-400 hover:text-black border-zinc-100 dark:bg-zinc-950 dark:border-zinc-900 group-hover:border-zinc-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </Card>

      {/* DASHBOARD TABLE */}
      {/* DASHBOARD TABLE */}
      <Card variant="glass" className="overflow-hidden shadow-premium">
        <table className="w-full text-left font-sans text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Reference No.</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Logistics Data</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Inventory Specs</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Net Valuation</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Current Status</th>
              <th className="px-8 py-6 w-12 text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest">Ops</th>
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
                  className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all duration-300 cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <span className="text-zinc-900 dark:text-zinc-50 font-black uppercase tracking-tight block text-[11px]">
                      {q.quotation_no}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest italic">{q.issue_date || "-"}</span>
                  </td>
                  <td className="px-8 py-5 font-black text-zinc-500 uppercase truncate max-w-[180px] text-[10px] tracking-widest">
                    {q.supplier_name}
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-black text-zinc-900 dark:text-white truncate max-w-[220px] text-[11px] uppercase tracking-tight">
                      {q.part_number}
                    </div>
                    <div className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest truncate max-w-[220px] mt-0.5">
                      {q.part_description || "No description provided"}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-zinc-900 dark:text-zinc-50 text-[12px] tabular-nums">
                    {q.currency === "USD" ? "$" : q.currency === "EUR" ? "€" : "₹"}
                    {q.total_amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border transition-all duration-500 ring-4 ring-transparent group-hover:ring-zinc-100 dark:group-hover:ring-zinc-900 ${
                      q.status === QuotationStatus.ACCEPTED 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50" 
                        : "bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
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
