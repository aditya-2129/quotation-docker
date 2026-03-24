'use client';

import React, { useState, useEffect } from "react";
import { LaborRate } from "@/types/labor";
import { laborRateService } from "@/services/LaborRateService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

/**
 * LaborRateManager Component
 * Allows users to manage centralized manufacturing hourly rates.
 */
export const LaborRateManager: React.FC = () => {
  const [rates, setRates] = useState<LaborRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState({
    process_name: "",
    hourly_rate: 0,
    currency: "INR",
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setIsLoading(true);
      const data = await laborRateService.getAllLaborRates();
      setRates(data);
    } catch (error) {
      console.error("Failed to load labor rates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRate = async () => {
    try {
      if (!newRate.process_name) return;
      await laborRateService.createLaborRate(newRate);
      setIsAdding(false);
      setNewRate({ process_name: "", hourly_rate: 0, currency: "INR" });
      fetchRates();
    } catch (error) {
      console.error("Failed to add rate:", error);
    }
  };

  const handleDeleteRate = async (id: string) => {
    if (!confirm("Remove this rate entry?")) return;
    try {
      await laborRateService.deleteLaborRate(id);
      fetchRates();
    } catch (error) {
      console.error("Failed to delete rate:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white">Shop Floor Rates</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-2 italic">Global hourly cost configuration for manufacturing processes.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-2xl shadow-xl shadow-black/10 transition-transform active:scale-95"
        >
          {isAdding ? "Cancel" : "+ Define New Process"}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-8 border-none shadow-2xl bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-sm animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8 border-b pb-4">New Rate Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Input 
              label="Process / Machine Name" 
              placeholder="e.g. CNC Vertical Milling"
              value={newRate.process_name}
              onChange={(e) => setNewRate({ ...newRate, process_name: e.target.value })}
            />
            <Input 
              label="Cost per Hour (₹)" 
              type="number"
              placeholder="0.00"
              value={newRate.hourly_rate}
              onChange={(e) => setNewRate({ ...newRate, hourly_rate: Number(e.target.value) })}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Currency</label>
              <select 
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300 transition-all font-mono"
                value={newRate.currency}
                onChange={(e) => setNewRate({ ...newRate, currency: e.target.value })}
              >
                <option value="INR">INR / ₹</option>
                <option value="USD">USD / $</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Button variant="primary" onClick={handleAddRate} className="rounded-2xl px-12">Register Rate</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden border-zinc-100 dark:border-zinc-900 shadow-xl">
        <table className="w-full text-left font-mono text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Process Identification</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Hourly Rate</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Currency</th>
              <th className="px-6 py-5 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center animate-pulse text-zinc-400 uppercase text-xs italic">Pulling rates from ledger...</td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-zinc-400 uppercase text-xs italic">Rate database is empty.</td>
              </tr>
            ) : (
              rates.map((r) => (
                <tr key={r.$id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-black text-black dark:text-white uppercase tracking-tight block">{r.process_name}</span>
                    <span className="text-[9px] text-zinc-400 uppercase">SYS_REF: {r.$id.substring(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xl font-black text-zinc-900 dark:text-white">₹{r.hourly_rate.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-400 block">per effective hour</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded font-bold text-[10px] text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{r.currency}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDeleteRate(r.$id)}
                      className="text-zinc-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-xl text-amber-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase text-amber-900 dark:text-amber-200 tracking-wider">Dynamic Coupling Note</h4>
          <p className="text-[11px] text-amber-800/70 dark:text-amber-200/50 mt-1 leading-relaxed italic">The rates defined above are pulled into the "Step 4: Process & Labor" section during quotation creation. Updating a rate here will not affect historical quotations, preserving data integrity.</p>
        </div>
      </div>
    </div>
  );
};
