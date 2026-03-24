'use client';

import React, { useState, useEffect } from "react";
import { ToolingRate } from "@/types/labor";
import { toolingRateService } from "@/services/ToolingRateService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

/**
 * ToolingRateManager Component
 * Allows users to manage centralized rates for tooling materials and secondary processes.
 */
export const ToolingRateManager: React.FC = () => {
  const [rates, setRates] = useState<ToolingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRate, setEditingRate] = useState<ToolingRate | null>(null);
  const [newRate, setNewRate] = useState({
    item_name: "",
    rate: 0,
    unit: "per_kg" as "per_kg" | "fixed",
    currency: "INR",
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setIsLoading(true);
      const data = await toolingRateService.getAllToolingRates();
      setRates(data);
    } catch (error) {
      console.error("Failed to load tooling rates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRate = async () => {
    try {
      if (!newRate.item_name) return;
      
      if (editingRate) {
        await toolingRateService.updateToolingRate(editingRate.$id, newRate);
      } else {
        await toolingRateService.createToolingRate(newRate);
      }

      setIsAdding(false);
      setEditingRate(null);
      setNewRate({ item_name: "", rate: 0, unit: "per_kg", currency: "INR" });
      fetchRates();
    } catch (error) {
      console.error("Failed to save rate:", error);
    }
  };

  const handleEditRate = (rate: ToolingRate) => {
    setEditingRate(rate);
    setNewRate({
      item_name: rate.item_name,
      rate: rate.rate,
      unit: rate.unit as any,
      currency: rate.currency,
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRate = async (id: string) => {
    if (!confirm("Remove this rate entry?")) return;
    try {
      await toolingRateService.deleteToolingRate(id);
      fetchRates();
    } catch (error) {
      console.error("Failed to delete rate:", error);
    }
  };

  const toggleAddMode = () => {
    if (isAdding) {
      setIsAdding(false);
      setEditingRate(null);
      setNewRate({ item_name: "", rate: 0, unit: "per_kg", currency: "INR" });
    } else {
      setIsAdding(true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white">Tooling Standards</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-2 italic">Standard rates for castings, heat treatment, and secondary tooling components.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={toggleAddMode}
          className="rounded-2xl shadow-xl shadow-black/10 transition-transform active:scale-95 uppercase font-black text-[10px] tracking-widest px-8 h-12"
        >
          {isAdding ? "Cancel Entry" : "+ Define Standard"}
        </Button>
      </div>

      {isAdding && (
        <Card variant="glass" className="p-0 border-none shadow-premium overflow-hidden animate-in slide-in-from-top-4 duration-500">
           <div className="px-8 py-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                {editingRate ? "Update Standard" : "Define New Standard"}
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Configure tooling material and secondary process costs</p>
            </div>
          </div>
          <div className="px-8 py-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Input 
                label="Item Name" 
                placeholder="e.g. Heat Treatment"
                className="h-11 rounded-xl"
                value={newRate.item_name}
                onChange={(e) => setNewRate({ ...newRate, item_name: e.target.value })}
              />
              <Input 
                label="Rate (₹)" 
                type="number"
                placeholder="0.00"
                className="h-11 rounded-xl"
                value={newRate.rate}
                onChange={(e) => setNewRate({ ...newRate, rate: Number(e.target.value) })}
              />
              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Valuation Mode</label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300 transition-all font-mono font-bold uppercase tracking-tighter"
                  value={newRate.unit}
                  onChange={(e) => setNewRate({ ...newRate, unit: e.target.value as any })}
                >
                  <option value="per_kg">Per Kilogram (kg)</option>
                  <option value="fixed">Fixed Global Cost</option>
                </select>
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Currency</label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300 transition-all font-mono font-bold"
                  value={newRate.currency}
                  onChange={(e) => setNewRate({ ...newRate, currency: e.target.value })}
                >
                  <option value="INR">INR / ₹</option>
                  <option value="USD">USD / $</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="primary" onClick={handleSaveRate} className="rounded-xl h-12 min-w-[200px] shadow-premium uppercase font-black text-[10px] tracking-widest">
                {editingRate ? "Update Standard" : "Archive Standard"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card variant="glass" className="overflow-hidden shadow-premium">
        <table className="w-full text-left font-sans text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Tooling Identification</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Base Rate</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Valuation Mode</th>
              <th className="px-8 py-6 w-32 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center animate-pulse text-zinc-400 uppercase text-[10px] font-black tracking-widest">Sourcing constants from central DB...</td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-zinc-400 uppercase text-xs italic opacity-40">No tooling standards defined yet.</td>
              </tr>
            ) : (
              rates.map((r) => (
                <tr key={r.$id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all duration-300">
                  <td className="px-8 py-5">
                    <span className="font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight block text-[11px] font-black uppercase italic tracking-tighter">{r.item_name}</span>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">LEDGER_ID: {r.$id.substring(0, 8)}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tighter">₹{r.rate.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block mt-1">per reference unit</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-widest border transition-all ${
                      r.unit === 'per_kg' 
                      ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {r.unit.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditRate(r)}
                        className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-all shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button 
                         onClick={() => handleDeleteRate(r.$id)}
                         className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/20 text-zinc-400 hover:text-rose-600 transition-all shadow-sm border border-transparent hover:border-rose-100 dark:hover:border-rose-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase text-blue-900 dark:text-blue-200 tracking-wider">Automated Valuation Notice</h4>
          <p className="text-[11px] text-blue-800/70 dark:text-blue-200/50 mt-1 leading-relaxed">
            The values defined here automatically power the **"Step 5: Tooling"** calculation engine. If a rate is set to **"Per Kilogram"**, the quotation form will multiply it by the tool's Finish Weight to generate the final cost in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};
