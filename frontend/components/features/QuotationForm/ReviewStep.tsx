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
  const laborTotal = formData.labor_processes.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
  const toolingTotal = (Number(formData.tooling_material.material_cost) || 0) + 
                        (Number(formData.tooling_material.tool_components) || 0) +
                        (Number(formData.tooling_material.pattern_casting) || 0) +
                        (Number(formData.tooling_material.heat_treat) || 0) +
                        (Number(formData.tooling_material.other) || 0);
  
  const bomTotal = formData.items.reduce((sum: number, i: any) => sum + (i.total || 0), 0);
  const baseSubtotal = bomTotal + laborTotal + toolingTotal + 
                       (Number(formData.additional_charges.texture_coatings) || 0) + 
                       (Number(formData.additional_charges.transportation) || 0);

  const overheadAmt = baseSubtotal * (formData.additional_charges.overhead_rate / 100);
  const profitAmt = (baseSubtotal + overheadAmt) * (formData.additional_charges.profit_rate / 100);
  const taxAmt = (formData.total_amount / (1 + (formData.additional_charges.tax_rate / 100))) * (formData.additional_charges.tax_rate / 100);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-950 p-12 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm font-sans animate-in fade-in duration-700">
      
      {/* 1. DOCUMENT HEADER (Classical) */}
      <div className="flex justify-between items-start mb-12 border-b-2 border-zinc-900 dark:border-zinc-100 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white uppercase">Quotation Notice</h1>
          <p className="text-xs text-zinc-500 uppercase font-medium">{formData.supplier_name || "VALUED COUNTERPARTY"}</p>
        </div>
        <div className="text-right space-y-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Document Registry</p>
          <div className="space-y-0.5">
             <p className="text-sm font-black text-black dark:text-white">{formData.quotation_no || "DRAFT-2024"}</p>
             <p className="text-[10px] text-zinc-500">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* 2. RECIPIENT & SPEC INFO (Traditional Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12 px-2">
         <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Part No.</span>
            <p className="text-xs font-bold text-black dark:text-white">{formData.part_number}</p>
         </div>
         <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Die Type</span>
            <p className="text-xs font-bold text-black dark:text-white uppercase">{formData.tech_specs.die_size || "Standard"}</p>
         </div>
         <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Shut Height</span>
            <p className="text-xs font-bold text-black dark:text-white">{formData.tech_specs.shut_height} mm</p>
         </div>
         <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Blank WT.</span>
            <p className="text-xs font-bold text-black dark:text-white">{formData.tech_specs.blank_weight} kg</p>
         </div>
      </div>

      {/* 3. COST LEDGER TABLE (Traditional) */}
      <div className="mb-12">
        <table className="w-full text-left font-sans text-xs border border-zinc-200 dark:border-zinc-800 border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-5 py-3 font-black text-zinc-500 uppercase tracking-widest border-r border-zinc-200 dark:border-zinc-800">Item Description</th>
              <th className="px-5 py-3 font-black text-zinc-500 uppercase tracking-widest text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-tighter">
            
            {/* BOM SECTION */}
            <tr className="bg-zinc-100 dark:bg-zinc-900/80"><td colSpan={2} className="px-5 py-2.5 font-black text-[9px] text-zinc-500 tracking-[0.2em] italic">Section 1: Bill of Material Componentry</td></tr>
            {formData.items.map((item: any, idx: number) => (
              <tr key={`bom-${idx}`}>
                <td className="px-5 py-3.5 border-r border-zinc-200 dark:border-zinc-800">{item.part_name} <span className="text-zinc-400 text-[9px] lowercase font-normal italic ml-2">({item.quantity} units @ {item.calculated_weight}kg)</span></td>
                <td className="px-5 py-3.5 text-right tabular-nums">₹{item.total.toLocaleString()}</td>
              </tr>
            ))}
            
            {/* LABOR SECTION */}
            <tr className="bg-zinc-100 dark:bg-zinc-900/80"><td colSpan={2} className="px-5 py-2.5 font-black text-[9px] text-zinc-500 tracking-[0.2em] italic">Section 2: Manufacturing Execution (Labor)</td></tr>
            {formData.labor_processes.map((p: any, idx: number) => (
              <tr key={`lab-${idx}`}>
                <td className="px-5 py-3.5 border-r border-zinc-200 dark:border-zinc-800">{p.name} <span className="text-zinc-400 text-[9px] font-normal italic ml-2">({p.hours} hrs x ₹{p.cost_per_hr}/hr)</span></td>
                <td className="px-5 py-3.5 text-right tabular-nums">₹{p.total.toLocaleString()}</td>
              </tr>
            ))}

            {/* TOOLING & ADD-ONS */}
            <tr className="bg-zinc-100 dark:bg-zinc-900/80"><td colSpan={2} className="px-5 py-2.5 font-black text-[9px] text-zinc-500 tracking-[0.2em] italic">Section 3: Tooling Assets & Coordination</td></tr>
            <tr>
              <td className="px-5 py-3.5 border-r border-zinc-200 dark:border-zinc-800">Tooling Material & Processing Base Charges</td>
              <td className="px-5 py-3.5 text-right tabular-nums">₹{toolingTotal.toLocaleString()}</td>
            </tr>
            {formData.additional_charges.texture_coatings > 0 && (
              <tr>
                <td className="px-5 py-3.5 border-r border-zinc-200 dark:border-zinc-800 italic underline decoration-zinc-100 underline-offset-4">Secondary Surface Texture / Coatings</td>
                <td className="px-5 py-3.5 text-right tabular-nums">₹{formData.additional_charges.texture_coatings.toLocaleString()}</td>
              </tr>
            )}
            {formData.additional_charges.transportation > 0 && (
              <tr>
                <td className="px-5 py-3.5 border-r border-zinc-200 dark:border-zinc-800 font-bold tracking-tight">Logistics, Freight & Tool Preparation</td>
                <td className="px-5 py-3.5 text-right tabular-nums">₹{formData.additional_charges.transportation.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
          <tfoot className="border-t-2 border-zinc-900 dark:border-zinc-100">
             <tr className="bg-zinc-50 dark:bg-zinc-900/50">
               <td className="px-5 py-4 text-right font-black uppercase text-[10px] tracking-widest text-zinc-500 border-r border-zinc-200 dark:border-zinc-800">Net Base Subtotal</td>
               <td className="px-5 py-4 text-right font-bold text-sm tabular-nums">₹{baseSubtotal.toLocaleString()}</td>
             </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. FINANCIAL SUMMARY (Classic Right-aligned Ledger) */}
      <div className="flex justify-end pr-2">
         <div className="w-full lg:w-80 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-500">
               <span>Overhead Cost Add-on ({formData.additional_charges.overhead_rate}%)</span>
               <span className="text-zinc-900 dark:text-zinc-100">+ ₹{Math.round(overheadAmt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-500 border-b border-zinc-100 dark:border-zinc-900 pb-2">
               <span>Management Profit Margin ({formData.additional_charges.profit_rate}%)</span>
               <span className="text-zinc-900 dark:text-zinc-100">+ ₹{Math.round(profitAmt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
               <span>Tax / Statutory GST ({formData.additional_charges.tax_rate}%)</span>
               <span className="tabular-nums">+ ₹{Math.round(taxAmt).toLocaleString()}</span>
            </div>
            {formData.additional_charges.discount_rate > 0 && (
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-rose-600">
                 <span>Contractual Discount Apply</span>
                 <span className="tabular-nums">- ₹{Math.round(baseSubtotal * (formData.additional_charges.discount_rate / 100)).toLocaleString()}</span>
              </div>
            )}
            
            <div className="pt-8 mt-4 border-t-2 border-zinc-900 dark:border-white">
               <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-[0.4em] italic leading-none">Grand Total</span>
                  <div className="text-4xl font-black tabular-nums tracking-tighter text-black dark:text-white leading-none">
                     <span className="text-base font-normal align-top mr-1">₹</span>
                     {Math.round(formData.total_amount).toLocaleString()}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* FOOTER: SYSTEM VERIFICATION */}
      <div className="mt-20 pt-8 border-t border-zinc-100 dark:border-zinc-900 text-center flex flex-col items-center gap-4">
          <div className="px-4 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded font-black text-[9px] uppercase tracking-[0.5em] text-zinc-400">
             Audit Code: AUTH-SVR-2024
          </div>
          <p className="text-[9px] font-bold text-zinc-300 italic uppercase">This document is a formal project estimate and is subject to valid commitment terms.</p>
      </div>
    </div>
  );
};
