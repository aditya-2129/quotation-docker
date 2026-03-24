'use client';

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { laborRateService } from "@/services/LaborRateService";
import { toolingRateService } from "@/services/ToolingRateService";
import { LaborRate, ToolingRate } from "@/types/labor";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface LaborStepProps {
  laborProcesses: any[];
  toolingMaterial: any;
  techSpecs: any;
  additionalCharges: any;
  totalAmount: number;
  onChange: (field: string, value: any) => void;
  mode?: "operations" | "tooling" | "overhead";
}

export const LaborStep: React.FC<LaborStepProps> = ({ 
  laborProcesses, 
  toolingMaterial, 
  techSpecs, 
  additionalCharges,
  totalAmount,
  onChange,
  mode = "operations"
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

  // AUTO-CALCULATION LOGIC FOR TOOLING
  useEffect(() => {
    if (mode === "tooling" && toolingRates.length > 0) {
      const updated = { ...toolingMaterial };
      let changed = false;

      toolingRates.forEach(rate => {
        const fieldMap: Record<string, string> = {
          "Heat Treatment": "heat_treat",
          "Casting": "pattern_casting",
          "Material": "material_cost"
        };
        const field = fieldMap[rate.item_name] || rate.item_name.toLowerCase().replace(" ", "_");
        
        if (Object.keys(updated).includes(field)) {
          let newValue = updated[field];
          if (rate.unit === "per_kg") {
            newValue = (Number(updated.finish_weight) || 0) * rate.rate;
          } else {
            newValue = rate.rate;
          }

          if (updated[field] !== newValue) {
            updated[field] = newValue;
            changed = true;
          }
        }
      });

      if (changed) {
        onChange("tooling_material", updated);
      }
    }
  }, [toolingMaterial.finish_weight, toolingRates.length, mode]);

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

  const handleNestedChange = (category: string, field: string, value: any) => {
    const data = category === "tooling_material" ? toolingMaterial : 
                 category === "tech_specs" ? techSpecs : additionalCharges;
    onChange(category, { ...data, [field]: value });
  };

  // Correct subtotal: EXCLUDE finish_weight calculation (it's KG, not money)
  const toolingSubtotal = (Number(toolingMaterial.material_cost) || 0) + 
                          (Number(toolingMaterial.tool_components) || 0) +
                          (Number(toolingMaterial.pattern_casting) || 0) +
                          (Number(toolingMaterial.heat_treat) || 0) +
                          (Number(toolingMaterial.other) || 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* SECTION 1: BREAKDOWN OF MANUFACTURING PROCESS */}
      {mode === "operations" && (
        <Card className="p-0 border-none shadow-2xl relative overflow-hidden bg-white dark:bg-zinc-950">
          <div className="p-5 flex items-center justify-between border-b pb-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Manufacturing Process Breakdown</h3>
            <div className="flex gap-2 items-center">
              <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-300">Quick Add:</span>
              <div className="w-64">
                <SearchableSelect 
                  value=""
                  options={centralRates.map(r => ({ label: r.process_name, value: r.process_name }))}
                  onChange={(val) => addProcess(val)}
                  placeholder="Type to search process..."
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm min-w-[600px] border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
                  <th className="px-5 py-2 text-[9px] font-black uppercase text-zinc-400 tracking-wider">Process Name</th>
                  <th className="px-5 py-2 text-[9px] font-black uppercase text-zinc-400 tracking-wider w-32">Cost / Hr</th>
                  <th className="px-5 py-2 text-[9px] font-black uppercase text-zinc-400 tracking-wider w-32">Est. Hours</th>
                  <th className="px-5 py-2 text-[9px] font-black uppercase text-zinc-400 tracking-wider text-right w-40">Line Amount</th>
                  <th className="px-5 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                {laborProcesses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z"/></svg>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">No operations added yet</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  laborProcesses.map((process, idx) => {
                    return (
                      <tr key={process.id || idx} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-2.5 font-bold text-zinc-900 dark:text-zinc-100 text-[11px] uppercase tracking-tight">{process.name}</td>
                        <td className="px-5 py-2.5">
                           <div className="relative">
                             <input 
                               type="number"
                               className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white outline-none py-1 text-[11px] font-mono transition-all"
                               value={process.cost_per_hr}
                               onChange={(e) => handleProcessChange(idx, "cost_per_hr", Number(e.target.value))}
                             />
                             {centralRates.some(r => r.process_name.toUpperCase() === process.name.toUpperCase() && r.hourly_rate === process.cost_per_hr) && (
                               <span className="absolute -top-3 right-0 text-[7px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded uppercase tracking-tighter border border-emerald-100 dark:border-emerald-900">Synced</span>
                             )}
                           </div>
                        </td>
                        <td className="px-5 py-2.5">
                          <input 
                             type="number"
                             className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white outline-none py-1 text-[11px] font-mono"
                             value={process.hours}
                             onChange={(e) => handleProcessChange(idx, "hours", Number(e.target.value))}
                           />
                        </td>
                        <td className="px-5 py-2.5 text-right font-black text-zinc-900 dark:text-white text-[12px] tracking-tight">
                          ₹{process.total?.toLocaleString() || "0"}
                        </td>
                        <td className="px-5 py-1.5 text-right">
                          <button 
                            onClick={() => removeProcess(idx)}
                            className="h-6 w-6 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-zinc-900 dark:bg-zinc-950 text-white border-t-2 border-zinc-800">
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-right">
                     <span className="uppercase tracking-[0.3em] font-black text-[8px] text-zinc-500">Total Operations Valuation</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                     <div className="text-sm font-black tracking-tight text-white border-b border-zinc-700 pb-0.5">
                        ₹{laborProcesses.reduce((sum: number, p: any) => sum + (p.total || 0), 0).toLocaleString()}
                     </div>
                  </td>
                  <td className="px-5 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {mode === "tooling" && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* MAIN TOOLING CONTENT */}
          <div className="flex-grow space-y-8">
            {/* SECTION 1: FINANCIALS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                 <div className="h-4 w-1 bg-blue-500 rounded-full" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Tool Material & Processing</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5 border-none shadow-xl bg-zinc-50/50 dark:bg-zinc-950/50">
                  <Input 
                    label="Finish Weight (kg)" 
                    type="number"
                    className="h-12 text-sm font-black border-2 border-white dark:border-zinc-900 ring-4 ring-blue-500/10 focus:ring-blue-500/20"
                    value={toolingMaterial.finish_weight}
                    onChange={(e) => handleNestedChange("tooling_material", "finish_weight", Number(e.target.value))}
                  />
                  <p className="text-[9px] text-zinc-400 mt-2 uppercase font-bold tracking-widest italic px-1">Critical for auto-calculation</p>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-4">
                     <Input label="Material Cost" type="number" className="h-10 text-xs font-bold" value={toolingMaterial.material_cost} onChange={(e) => handleNestedChange("tooling_material", "material_cost", Number(e.target.value))} />
                     <Input label="Heat Treat" type="number" className="h-10 text-xs font-bold" value={toolingMaterial.heat_treat} onChange={(e) => handleNestedChange("tooling_material", "heat_treat", Number(e.target.value))} />
                   </div>
                   <div className="space-y-4">
                     <Input label="Pattern / Casting" type="number" className="h-10 text-xs font-bold" value={toolingMaterial.pattern_casting} onChange={(e) => handleNestedChange("tooling_material", "pattern_casting", Number(e.target.value))} />
                     <Input label="Tool Components" type="number" className="h-10 text-xs font-bold" value={toolingMaterial.tool_components} onChange={(e) => handleNestedChange("tooling_material", "tool_components", Number(e.target.value))} />
                   </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: PHYSICAL SPECS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                 <div className="h-4 w-1 bg-orange-500 rounded-full" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Engineering Parameters</h3>
              </div>
              <Card className="p-6 border-none shadow-xl bg-white dark:bg-zinc-950">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <Input label="Blank Weight (kg)" type="number" className="h-10 text-xs font-bold bg-zinc-50/50" value={techSpecs.blank_weight} onChange={(e) => handleNestedChange("tech_specs", "blank_weight", Number(e.target.value))} />
                  <Input label="Die Size (mm)" placeholder="800 x 1200" className="h-10 text-xs font-bold bg-zinc-50/50" value={techSpecs.die_size} onChange={(e) => handleNestedChange("tech_specs", "die_size", e.target.value)} />
                  <Input label="# of Stations" type="number" className="h-10 text-xs font-bold bg-zinc-50/50" value={techSpecs.stations} onChange={(e) => handleNestedChange("tech_specs", "stations", Number(e.target.value))} />
                  <Input label="Shut Height (mm)" type="number" className="h-10 text-xs font-bold bg-zinc-50/50" value={techSpecs.shut_height} onChange={(e) => handleNestedChange("tech_specs", "shut_height", Number(e.target.value))} />
                </div>
              </Card>
            </div>
          </div>

          {/* SIDEBAR SUMMARY */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="bg-black dark:bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-3xl relative overflow-hidden group border-4 border-zinc-100 dark:border-zinc-800">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-1000" />
               <div className="relative z-10">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Tooling Valuation</h4>
                 <div className="space-y-1">
                    <span className="text-4xl font-black tabular-nums">₹{toolingSubtotal.toLocaleString()}</span>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                      Calculated from materials, components & processing items.
                    </p>
                 </div>
                 <div className="mt-8 pt-8 border-t border-zinc-800 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                       <span className="text-zinc-500">Weight Factor</span>
                       <span>{toolingMaterial.finish_weight}kg</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-emerald-500">
                       <span className="uppercase tracking-tighter">Database Sync</span>
                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                 </div>
               </div>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/40 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <h5 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 px-1">System Intelligence</h5>
                <div className="space-y-4">
                   <div className="flex gap-3">
                      <div className="h-5 w-5 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-black">?</div>
                      <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 leading-tight">Add "Heat Treatment" to your master table for automatic multiplier effects.</p>
                   </div>
                   <div className="flex gap-3">
                      <div className="h-5 w-5 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-black">!</div>
                      <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 leading-tight">Always set "Finish Weight" first to trigger global rate calculations.</p>
                   </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: OVERHEAD & LOGISTICS */}
      {mode === "overhead" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 border-none shadow-xl bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <div className="h-4 w-1 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Logistics & Services</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <Input 
                 label="Texture / Coatings" 
                 type="number"
                 className="h-11 text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border-none ring-1 ring-zinc-200 dark:ring-zinc-800"
                 value={additionalCharges.texture_coatings}
                 onChange={(e) => handleNestedChange("additional_charges", "texture_coatings", Number(e.target.value))}
               />
               <Input 
                 label="Transportation" 
                 type="number"
                 className="h-11 text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border-none ring-1 ring-zinc-200 dark:ring-zinc-800"
                 value={additionalCharges.transportation}
                 onChange={(e) => handleNestedChange("additional_charges", "transportation", Number(e.target.value))}
               />
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl bg-zinc-900 dark:bg-zinc-950 text-white">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 mb-6">
              <div className="h-4 w-1 bg-emerald-500 rounded-full" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Margin & Tax Configuration</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
               <Input 
                 label="Overhead (%)" 
                 type="number"
                 className="h-10 text-xs font-bold bg-zinc-800 border-none text-white focus:ring-emerald-500/20"
                 value={additionalCharges.overhead_rate}
                 onChange={(e) => handleNestedChange("additional_charges", "overhead_rate", Number(e.target.value))}
               />
               <Input 
                 label="Profit (%)" 
                 type="number"
                 className="h-10 text-xs font-bold bg-zinc-800 border-none text-white focus:ring-emerald-500/20"
                 value={additionalCharges.profit_rate}
                 onChange={(e) => handleNestedChange("additional_charges", "profit_rate", Number(e.target.value))}
               />
               <Input 
                 label="GST / VAT (%)" 
                 type="number"
                 className="h-10 text-xs font-bold bg-zinc-800 border-none text-white focus:ring-emerald-500/20"
                 value={additionalCharges.tax_rate}
                 onChange={(e) => handleNestedChange("additional_charges", "tax_rate", Number(e.target.value))}
               />
               <Input 
                 label="Discount (%)" 
                 type="number"
                 className="h-10 text-xs font-bold bg-zinc-800 border-none text-rose-400 focus:ring-rose-500/20"
                 value={additionalCharges.discount_rate}
                 onChange={(e) => handleNestedChange("additional_charges", "discount_rate", Number(e.target.value))}
               />
            </div>
            <div className="mt-8 pt-8 border-t border-zinc-800">
               <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Estimated Grand Total</span>
                  <span className="text-xl font-black tabular-nums tracking-tighter">₹{Math.round(totalAmount).toLocaleString()}</span>
               </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};
