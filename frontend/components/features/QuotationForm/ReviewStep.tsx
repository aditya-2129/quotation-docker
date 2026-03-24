'use client';

import React from "react";

interface ReviewStepProps {
  formData: any;
}

/**
 * ReviewStep Component: "Engineering Document" Mode
 * A clean, traditional quotation document focused on line-item detail.
 */
export const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const itemLaborTotal = formData.items.reduce((sum: number, item: any) => {
    const itemProcessesTotal = (item.labor_processes || []).reduce((pSum: number, p: any) => pSum + (p.total || 0), 0);
    return sum + itemProcessesTotal;
  }, 0);
  const globalLaborTotal = (formData.labor_processes || []).reduce((sum: number, p: any) => sum + (p.total || 0), 0);
  const laborTotal = itemLaborTotal + globalLaborTotal;

  const toolingTotal = formData.items.reduce((sum: number, item: any) => {
    const tm = item.tooling_material;
    if (!tm) return sum;
    return sum + 
           (Number(tm.material_cost) || 0) + 
           (Number(tm.tool_components) || 0) +
           (Number(tm.pattern_casting) || 0) +
           (Number(tm.heat_treat) || 0) +
           (Number(tm.other) || 0);
  }, 0);
  
  const bomTotal = formData.items.reduce((sum: number, i: any) => sum + (i.total || 0), 0);
  const baseSubtotal = bomTotal + laborTotal + toolingTotal + 
                       (Number(formData.additional_charges.texture_coatings) || 0) + 
                       (Number(formData.additional_charges.transportation) || 0);

  const overheadAmt = baseSubtotal * (formData.additional_charges.overhead_rate / 100);
  const profitAmt = (baseSubtotal + overheadAmt) * (formData.additional_charges.profit_rate / 100);
  const taxAmt = (formData.total_amount / (1 + (formData.additional_charges.tax_rate / 100))) * (formData.additional_charges.tax_rate / 100);

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-950 p-16 border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2.5rem] shadow-premium font-sans animate-in fade-in duration-1000">
      
      {/* 1. DOCUMENT HEADER (Modern Premium) */}
      <div className="flex justify-between items-start mb-16 border-b-4 border-zinc-900 dark:border-zinc-50 pb-10">
        <div className="space-y-2">
          <div className="h-2 w-12 bg-black dark:bg-white mb-4" />
          <h1 className="text-4xl font-black tracking-tighter text-black dark:text-white uppercase italic leading-none">Quotation <span className="text-zinc-400 font-light">Notice</span></h1>
          <p className="text-[11px] text-zinc-500 uppercase font-black tracking-[0.3em]">{formData.supplier_name || "VALUED COUNTERPARTY"}</p>
        </div>
        <div className="text-right space-y-4">
          <div className="inline-block px-4 py-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black text-[9px] font-black uppercase tracking-[0.4em] mb-2">
            Document Registry
          </div>
          <div className="space-y-1">
             <p className="text-lg font-black text-black dark:text-white tracking-tighter">{formData.quotation_no || "DRAFT-2024"}</p>
             <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* 2. RECIPIENT & SPEC INFO (Modern Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16 px-4 py-8 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
         <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 block">BOM Intensity</span>
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 pl-3 uppercase tracking-tighter italic">{formData.items.length} Unique Parts</p>
         </div>
         <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 block">Primary Die Size</span>
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase pl-3">{formData.items[0]?.tech_specs?.die_size || "N/A"}</p>
         </div>
         <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 block">Total Stations</span>
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 pl-3">
              {formData.items.reduce((sum: number, i: any) => sum + (i.tech_specs?.stations || 0), 0)} UNIT
            </p>
         </div>
         <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 block">Gross Blank WT.</span>
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 pl-3">
              {formData.items.reduce((sum: number, i: any) => sum + (i.tech_specs?.blank_weight || 0), 0)} KG
            </p>
         </div>
      </div>

      {/* 3. COST LEDGER TABLE (Modern) */}
      <div className="mb-16">
        <table className="w-full text-left font-sans text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-zinc-900 dark:border-zinc-50">
              <th className="px-8 py-5 font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.2em] text-[10px]">Item Description</th>
              <th className="px-8 py-5 font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.2em] text-[10px] text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-tight">
            
            {/* BOM SECTION */}
            <tr className="bg-zinc-100/50 dark:bg-zinc-900/50"><td colSpan={2} className="px-8 py-4 font-black text-[10px] text-zinc-500 tracking-[0.4em] uppercase">01 // Bill of Material Componentry</td></tr>
            {formData.items.map((item: any, idx: number) => (
              <tr key={`bom-${idx}`} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="px-8 py-5">
                   <div className="text-[11px] font-black text-black dark:text-white">{item.part_name}</div>
                   <div className="text-[9px] text-zinc-400 font-bold lowercase italic mt-1">{item.quantity} units @ {item.calculated_weight}kg each</div>
                </td>
                <td className="px-8 py-5 text-right tabular-nums text-sm font-black text-black dark:text-white">₹{item.total.toLocaleString()}</td>
              </tr>
            ))}
            
            {/* LABOR SECTION */}
            <tr className="bg-zinc-100/50 dark:bg-zinc-900/50"><td colSpan={2} className="px-8 py-4 font-black text-[10px] text-zinc-500 tracking-[0.4em] uppercase">02 // Manufacturing Execution (Labor)</td></tr>
            
            {/* Per-Item Processes */}
            {formData.items.map((item: any, iIdx: number) => {
              const processes = item.labor_processes || [];
              if (processes.length === 0) return null;
              
              return (
                <React.Fragment key={`item-lab-${iIdx}`}>
                  <tr className="bg-zinc-50/20 dark:bg-zinc-900/10">
                    <td colSpan={2} className="px-8 py-3 font-black text-[9px] text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                      → Processing Account: [ {item.part_name} ]
                    </td>
                  </tr>
                  {processes.map((p: any, pIdx: number) => (
                    <tr key={`item-lab-${iIdx}-${pIdx}`} className="border-b border-zinc-100 dark:border-zinc-900/50">
                      <td className="px-8 py-5 flex items-center gap-6">
                        <div className="w-1 h-4 bg-zinc-200 dark:bg-zinc-800" />
                        <div>
                           <div className="text-[11px] font-black text-black dark:text-white">{p.name}</div>
                           <div className="text-[9px] text-zinc-400 font-bold lowercase italic mt-1">{p.hours} production hours @ ₹{p.cost_per_hr}/hr</div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right tabular-nums text-sm font-black text-black dark:text-white">₹{p.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Global Processes (if any) */}
            {formData.labor_processes.length > 0 && (
              <>
                <tr className="bg-zinc-50/20 dark:bg-zinc-900/10">
                  <td colSpan={2} className="px-8 py-3 font-black text-[9px] text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                    → General/Batch Operations
                  </td>
                </tr>
                {formData.labor_processes.map((p: any, idx: number) => (
                  <tr key={`global-lab-${idx}`} className="border-b border-zinc-100 dark:border-zinc-900/50">
                    <td className="px-8 py-5 flex items-center gap-6">
                      <div className="w-1 h-4 bg-zinc-200 dark:bg-zinc-800" />
                      <div>
                         <div className="text-[11px] font-black text-black dark:text-white">{p.name}</div>
                         <div className="text-[9px] text-zinc-400 font-bold lowercase italic mt-1">{p.hours} production hours @ ₹{p.cost_per_hr}/hr</div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right tabular-nums text-sm font-black text-black dark:text-white">₹{p.total.toLocaleString()}</td>
                  </tr>
                ))}
              </>
            )}

            {/* TOOLING & ADD-ONS */}
            <tr className="bg-zinc-100/50 dark:bg-zinc-900/50"><td colSpan={2} className="px-8 py-4 font-black text-[10px] text-zinc-500 tracking-[0.4em] uppercase">03 // Tooling Assets & Coordination</td></tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="px-8 py-5">
                 <div className="text-[11px] font-black text-black dark:text-white uppercase">Tooling Material & Processing</div>
                 <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1 italic">Base manufacturing & material charges</div>
              </td>
              <td className="px-8 py-5 text-right tabular-nums text-sm font-black text-black dark:text-white">₹{toolingTotal.toLocaleString()}</td>
            </tr>
            {formData.additional_charges.texture_coatings > 0 && (
              <tr className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="px-8 py-5">
                   <div className="text-[11px] font-black text-black dark:text-white uppercase">Surface Texture / Coatings</div>
                </td>
                <td className="px-8 py-5 text-right tabular-nums text-sm font-black text-black dark:text-white">₹{formData.additional_charges.texture_coatings.toLocaleString()}</td>
              </tr>
            )}
            {formData.additional_charges.transportation > 0 && (
              <tr className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="px-8 py-5">
                   <div className="text-[11px] font-black text-black dark:text-white uppercase">Logistics, Freight & Preparation</div>
                </td>
                <td className="px-8 py-5 text-right tabular-nums text-sm font-black text-black dark:text-white">₹{formData.additional_charges.transportation.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
          <tfoot className="border-t-4 border-zinc-900 dark:border-zinc-50">
             <tr className="bg-zinc-50/50 dark:bg-zinc-900/30">
               <td className="px-8 py-6 text-right font-black uppercase text-[12px] tracking-[0.4em] text-zinc-400">Base Project Evaluation</td>
               <td className="px-8 py-6 text-right font-black text-xl tabular-nums text-black dark:text-white tracking-tighter">₹{baseSubtotal.toLocaleString()}</td>
             </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. FINANCIAL SUMMARY (Modern Ledger) */}
      <div className="flex justify-end pr-4">
         <div className="w-full lg:w-96 space-y-6">
            <div className="space-y-4 px-2">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-zinc-400">
                 <span>Overhead ({formData.additional_charges.overhead_rate}%)</span>
                 <span className="text-zinc-900 dark:text-zinc-50 text-xs">+ ₹{Math.round(overheadAmt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-zinc-400">
                 <span>Margin ({formData.additional_charges.profit_rate}%)</span>
                 <span className="text-zinc-900 dark:text-zinc-50 text-xs">+ ₹{Math.round(profitAmt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                 <span>Statutory GST ({formData.additional_charges.tax_rate}%)</span>
                 <span className="tabular-nums text-xs">+ ₹{Math.round(taxAmt).toLocaleString()}</span>
              </div>
              {formData.additional_charges.discount_rate > 0 && (
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-rose-600">
                   <span>Contractual Discount</span>
                   <span className="tabular-nums text-xs">- ₹{Math.round(baseSubtotal * (formData.additional_charges.discount_rate / 100)).toLocaleString()}</span>
                </div>
              )}
            </div>
            
            <div className="pt-10 mt-6 border-t-[6px] border-zinc-900 dark:border-white">
               <div className="flex justify-between items-end px-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400 block">Grand Total</span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest italic font-sans">(inclusive of all applicable taxes)</span>
                  </div>
                  <div className="text-6xl font-black tabular-nums tracking-tighter text-black dark:text-white leading-none">
                     <span className="text-xl font-normal align-top mr-1">₹</span>
                     {Math.round(formData.total_amount).toLocaleString()}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* FOOTER: SYSTEM VERIFICATION */}
      <div className="mt-32 pt-12 border-t border-zinc-100 dark:border-zinc-900 text-center flex flex-col items-center gap-6">
          <div className="px-8 py-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-full font-black text-[10px] uppercase tracking-[0.8em] text-zinc-400 border border-zinc-100 dark:border-zinc-800">
             Audit Code: {formData.quotation_no ? `QS-${formData.quotation_no}` : "AUTH-SVR-2024"}
          </div>
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest px-12 leading-relaxed italic opacity-50">This document is a formal project estimate generated by the Quotation Analytics System. All prices are calculated based on current market rates and production parameters provided at the time of generation.</p>
      </div>
    </div>
  );
};
