'use client';

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { laborRateService } from "@/services/LaborRateService";
import { toolingRateService } from "@/services/ToolingRateService";
import { LaborRate, ToolingRate } from "@/types/labor";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { QuotationItem } from "@/types/quotation";

interface LaborStepProps {
  items: QuotationItem[];
  laborProcesses: any[];
  additionalCharges: any;
  totalAmount: number;
  onChange: (field: string, value: any) => void;
  mode?: "operations" | "tooling" | "engineering" | "overhead";
}

export const LaborStep: React.FC<LaborStepProps> = ({ 
  items,
  laborProcesses, 
  additionalCharges,
  totalAmount,
  onChange,
  mode = "engineering"
}) => {
  const [centralRates, setCentralRates] = useState<LaborRate[]>([]);
  const [toolingRates, setToolingRates] = useState<ToolingRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        const [lRates, tRates] = await Promise.all([
          laborRateService.getAllLaborRates(),
          toolingRateService.getAllToolingRates()
        ]);
        setCentralRates(lRates);
        setToolingRates(tRates);
      } catch (err) {
        console.error("Failed to fetch rates", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRates();
  }, []);

  // PER-PART AUTO-CALCULATION LOGIC FOR TOOLING
  useEffect(() => {
    if ((mode === "tooling" || mode === "engineering") && toolingRates.length > 0 && items.length > 0) {
      let anyItemChanged = false;
      const updatedItems = items.map(item => {
        if (!item.tooling_material) return item;

        let itemChanged = false;
        const updatedTm = { ...item.tooling_material } as any;

        toolingRates.forEach(rate => {
          const field = rate.item_name.toLowerCase().replace(/\s+/g, '_');
          // If the item's tm has this field, update it based on the rate and its finish_weight
          if (Object.keys(updatedTm).includes(field)) {
            let newValue = updatedTm[field];
            if (rate.unit === "per_kg") {
              newValue = (Number(updatedTm.finish_weight) || 0) * rate.rate;
            } else {
              newValue = rate.rate;
            }

            if (updatedTm[field] !== newValue) {
              updatedTm[field] = newValue;
              itemChanged = true;
            }
          }
        });

        if (itemChanged) {
          anyItemChanged = true;
          return { ...item, tooling_material: updatedTm };
        }
        return item;
      });

      if (anyItemChanged) {
        onChange("items", updatedItems);
      }
    }
  }, [items.map(i => i.tooling_material?.finish_weight).join(','), toolingRates.length, mode]);

  const addProcess = (processName: string) => {
    if (!processName) return;
    const dbRate = centralRates.find(r => r.process_name === processName);
    const newProcess = {
      name: processName,
      cost_per_hr: dbRate?.hourly_rate || 0,
      hours: 0,
      total: 0,
      id: Math.random().toString(36).substr(2, 9)
    };
    onChange("labor_processes", [...laborProcesses, newProcess]);
  };

  const removeProcess = (index: number) => {
    const updated = laborProcesses.filter((_, i) => i !== index);
    onChange("labor_processes", updated);
  };
  
  const handleProcessChange = (index: number, field: string, value: number) => {
    const updated = [...laborProcesses];
    updated[index] = { 
      ...updated[index], 
      [field]: value 
    };
    updated[index].total = updated[index].cost_per_hr * updated[index].hours;
    onChange("labor_processes", updated);
  };

  // PER-ITEM PROCESS HANDLERS
  const addProcessToItem = (itemIndex: number, processName: string) => {
    if (!processName) return;
    const dbRate = centralRates.find(r => r.process_name === processName);
    const updatedItems = [...items];
    const item = updatedItems[itemIndex];
    
    const newProcess = {
      name: processName,
      cost_per_hr: dbRate?.hourly_rate || 0,
      hours: 0,
      total: 0,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    item.labor_processes = [...(item.labor_processes || []), newProcess];
    onChange("items", updatedItems);
  };

  const removeProcessFromItem = (itemIndex: number, processIndex: number) => {
    const updatedItems = [...items];
    const item = updatedItems[itemIndex];
    item.labor_processes = item.labor_processes.filter((_, i) => i !== processIndex);
    onChange("items", updatedItems);
  };

  const handleItemProcessChange = (itemIndex: number, processIndex: number, field: string, value: number) => {
    const updatedItems = [...items];
    const item = updatedItems[itemIndex];
    const updatedProcesses = [...item.labor_processes];
    
    updatedProcesses[processIndex] = { 
      ...updatedProcesses[processIndex], 
      [field]: value 
    };
    updatedProcesses[processIndex].total = updatedProcesses[processIndex].cost_per_hr * updatedProcesses[processIndex].hours;
    item.labor_processes = updatedProcesses;
    onChange("items", updatedItems);
  };

  const addToolingToItem = (itemIndex: number, itemName: string) => {
    if (!itemName) return;
    const dbRate = toolingRates.find(r => r.item_name === itemName);
    const updatedItems = [...items];
    const item = updatedItems[itemIndex];
    
    const rate = dbRate?.rate || 0;
    const isPerKg = dbRate?.unit === "per_kg";
    const finishWt = Number(item.tooling_material?.finish_weight) || 1;
    
    const newTooling = {
      name: itemName,
      cost: rate,
      total: isPerKg ? (rate * finishWt) : rate,
      unit: dbRate?.unit || "fixed",
      id: Math.random().toString(36).substr(2, 9)
    };
    
    // Using 'tooling_processes' as the dynamic list
    item.tooling_processes = [...(item.tooling_processes || []), newTooling];
    onChange("items", updatedItems);
  };

  const removeToolingFromItem = (itemIndex: number, toolIndex: number) => {
    const updatedItems = [...items];
    const item = updatedItems[itemIndex];
    item.tooling_processes = (item.tooling_processes || []).filter((_, i: number) => i !== toolIndex);
    onChange("items", updatedItems);
  };

  const handleItemToolingChange = (itemIdx: number, toolIdx: number, field: string, value: any) => {
    const updatedItems = [...items];
    const item = updatedItems[itemIdx];
    const updated = [...(item.tooling_processes || [])];
    
    updated[toolIdx] = { ...updated[toolIdx], [field]: value };
    
    // Recalculate total if rate changes
    if (field === "cost") {
      const isPerKg = updated[toolIdx].unit === "per_kg";
      const finishWt = Number(item.tooling_material?.finish_weight) || 1;
      updated[toolIdx].total = isPerKg ? (value * finishWt) : value;
    }
    
    item.tooling_processes = updated;
    onChange("items", updatedItems);
  };

  const handleNestedChange = (category: "additional_charges", field: string, value: any) => {
    const data = additionalCharges;
    onChange(category, { ...data, [field]: value });
  };

  const handleItemNestedChange = (itemIdx: number, category: "tooling_material" | "tech_specs", field: string, value: any) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[itemIdx] };
    const sectionData = item[category] || {};
    item[category] = { ...sectionData, [field]: value } as any;
    updatedItems[itemIdx] = item;
    onChange("items", updatedItems);
  };

  // Aggregated totals
  const toolingSubtotal = items.reduce((sum, item) => {
    const tpTotal = (item.tooling_processes || []).reduce((s: number, p: any) => s + (p.total || 0), 0);
    return sum + tpTotal + (Number(item.tooling_material?.material_cost) || 0);
  }, 0);

  const laborSubtotal = items.reduce((sum, item) => {
    return sum + (item.labor_processes || []).reduce((pSum: number, p: any) => pSum + (p.total || 0), 0);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ENGINEERING MODE: COMBINED VIEW */}
      {mode === "engineering" && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-10">
            {items.map((item, itemIdx) => (
              <Card key={item.id} className="p-0 border border-zinc-200 dark:border-zinc-800 shadow-premium overflow-hidden bg-white dark:bg-zinc-950">
                {/* PART HEADER - CLEAN & SIMPLE */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 h-6 w-6 rounded-md flex items-center justify-center">
                       {itemIdx + 1}
                    </span>
                    <h3 className="text-base font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">{item.part_name}</h3>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                       <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Finish Weight</p>
                       <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{item.tooling_material?.finish_weight || 0} KG</span>
                    </div>
                    <div className="h-8 w-[1px] bg-zinc-100 dark:bg-zinc-900" />
                    <div className="text-right">
                       <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Part Total</p>
                       <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        ₹{(
                          (item.labor_processes || []).reduce((s: number, p: any) => s + (p.total || 0), 0) + 
                          (item.tooling_processes || []).reduce((s: number, p: any) => s + (p.total || 0), 0) +
                          (Number(item.tooling_material?.material_cost) || 0)
                        ).toLocaleString()}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 divide-x-0 xl:divide-x divide-zinc-100 dark:divide-zinc-900">
                  {/* LEFT: TOOLING */}
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tooling & Die Costs</h4>
                       <div className="w-48">
                          <SearchableSelect 
                            value=""
                            options={toolingRates.map(r => ({ label: r.item_name, value: r.item_name }))}
                            onChange={(val) => addToolingToItem(itemIdx, val)}
                            placeholder="+ Add tooling item"
                          />
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <div className="flex-grow">
                          <Input 
                            label="Update Weight (KG)" 
                            type="number" 
                            className="h-8 text-xs font-black border-none bg-transparent" 
                            value={item.tooling_material?.finish_weight || 0} 
                            onChange={(e) => handleItemNestedChange(itemIdx, "tooling_material", "finish_weight", Number(e.target.value))} 
                          />
                        </div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase italic opacity-60">Master Factor</p>
                    </div>

                    <table className="w-full text-left font-sans text-xs">
                      <thead className="text-zinc-400 font-bold border-b border-zinc-50 dark:border-zinc-900 uppercase tracking-tighter">
                         <tr><th className="py-2">Cost Center</th><th className="py-2 text-right">Rate</th><th className="py-2 text-right">Amount</th><th className="py-2"></th></tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                        {(item.tooling_processes || []).map((tp, tpIdx) => (
                          <tr key={tp.id} className="group">
                            <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">{tp.name}</td>
                            <td className="py-3 text-right">
                              <input type="number" className="w-16 h-6 bg-transparent border-none text-right font-bold focus:outline-none" value={tp.cost} onChange={e => handleItemToolingChange(itemIdx, tpIdx, "cost", Number(e.target.value))} />
                            </td>
                            <td className="py-3 text-right font-black tabular-nums">₹{Math.round(tp.total).toLocaleString()}</td>
                            <td className="py-3 text-right">
                              <button onClick={() => removeToolingFromItem(itemIdx, tpIdx)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* RIGHT: LABOR */}
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Manufacturing Steps</h4>
                       <div className="w-48">
                          <SearchableSelect 
                            value=""
                            options={centralRates.map(r => ({ label: r.process_name, value: r.process_name }))}
                            onChange={(val) => addProcessToItem(itemIdx, val)}
                            placeholder="+ Add process step"
                          />
                       </div>
                    </div>

                    <div className="h-[54px]" /> {/* Spacer to align with tooling's weight input */}

                    <table className="w-full text-left font-sans text-xs">
                      <thead className="text-zinc-400 font-bold border-b border-zinc-50 dark:border-zinc-900 uppercase tracking-tighter">
                         <tr><th className="py-2">Operation</th><th className="py-2 text-right">Hours</th><th className="py-2 text-right">Amount</th><th className="py-2"></th></tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                        {(item.labor_processes || []).map((p, pIdx) => (
                          <tr key={p.id} className="group">
                            <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">{p.name}</td>
                            <td className="py-3 text-right">
                              <input type="number" className="w-16 h-6 bg-transparent border-none text-right font-bold focus:outline-none" value={p.hours} onChange={e => handleItemProcessChange(itemIdx, pIdx, "hours", Number(e.target.value))} />
                            </td>
                            <td className="py-3 text-right font-black tabular-nums">₹{p.total.toLocaleString()}</td>
                            <td className="py-3 text-right">
                               <button onClick={() => removeProcessFromItem(itemIdx, pIdx)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* SIDEBAR - REFINED */}
          <div className="w-full lg:w-80 space-y-6">
             <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-premium border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 px-2 border-l-2 border-blue-500">Project Summary</h4>
                <div className="space-y-8">
                   <div className="px-2">
                      <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Aggregate Tooling</span>
                      <p className="text-2xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">₹{toolingSubtotal.toLocaleString()}</p>
                   </div>
                   <div className="px-2">
                      <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Labor Operations</span>
                      <p className="text-2xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">₹{laborSubtotal.toLocaleString()}</p>
                   </div>
                   <div className="pt-8 border-t border-zinc-50 dark:border-zinc-800 px-2">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Total Net Weight</span>
                         <span className="text-[9px] font-black text-blue-500 uppercase">Verification Pending</span>
                      </div>
                      <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{items.reduce((s, i) => s + (i.tooling_material?.finish_weight || 0), 0)} KG</p>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-900">
                <p className="text-[10px] font-bold text-zinc-500 leading-relaxed italic">
                  Note: Tooling costs marked as "/ kg" are dynamically calculated using the part's Finish Weight.
                </p>
             </div>
          </div>
        </div>
      )}

      {/* OVERHEAD & LOGISTICS MODE */}
      {mode === "overhead" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 border-none shadow-premium bg-white dark:bg-zinc-950 rounded-[2rem]">
            <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <div className="h-4 w-1 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Logistics & Services</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <Input label="Texture / Coatings" type="number" className="h-11 text-xs font-bold" value={additionalCharges.texture_coatings} onChange={(e) => handleNestedChange("additional_charges", "texture_coatings", Number(e.target.value))} />
               <Input label="Transportation" type="number" className="h-11 text-xs font-bold" value={additionalCharges.transportation} onChange={(e) => handleNestedChange("additional_charges", "transportation", Number(e.target.value))} />
            </div>
          </Card>

          <Card className="p-8 border-none shadow-premium bg-zinc-900 text-white rounded-[2rem]">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Financial Configuration</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <Input label="Overhead (%)" type="number" className="h-10 text-xs font-bold bg-zinc-800 border-none text-white" value={additionalCharges.overhead_rate} onChange={(e) => handleNestedChange("additional_charges", "overhead_rate", Number(e.target.value))} />
               <Input label="Profit (%)" type="number" className="h-10 text-xs font-bold bg-zinc-800 border-none text-white" value={additionalCharges.profit_rate} onChange={(e) => handleNestedChange("additional_charges", "profit_rate", Number(e.target.value))} />
               <Input label="GST / VAT (%)" type="number" className="h-10 text-xs font-bold bg-zinc-800 border-none text-white" value={additionalCharges.tax_rate} onChange={(e) => handleNestedChange("additional_charges", "tax_rate", Number(e.target.value))} />
               <Input label="Discount (%)" type="number" className="h-10 text-xs font-bold bg-zinc-800 border-none text-rose-400" value={additionalCharges.discount_rate} onChange={(e) => handleNestedChange("additional_charges", "discount_rate", Number(e.target.value))} />
            </div>
            <div className="mt-10 pt-8 border-t border-zinc-800 flex justify-between items-center group">
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Project Valuation</span>
               <span className="text-3xl font-black tabular-nums tracking-tighter group-hover:text-emerald-400 transition-colors">₹{Math.round(totalAmount).toLocaleString()}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
