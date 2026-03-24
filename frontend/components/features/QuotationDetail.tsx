'use client';

import React from "react";
import { Quotation, QuotationStatus } from "@/types/quotation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FileLink } from "./FileLink";

interface QuotationDetailProps {
  quotation: Quotation;
}

/**
 * QuotationDetail Component: "The Recorded Document"
 * A clean, traditional engineering document view.
 */
export const QuotationDetail: React.FC<QuotationDetailProps> = ({ quotation }) => {
  const laborTotal = quotation.labor_processes?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
  
  // Tooling subtotal (calculated from material fields)
  const toolingTotal = quotation.tooling_material ? (
    (Number(quotation.tooling_material.material_cost) || 0) + 
    (Number(quotation.tooling_material.tool_components) || 0) +
    (Number(quotation.tooling_material.pattern_casting) || 0) +
    (Number(quotation.tooling_material.heat_treat) || 0) +
    (Number(quotation.tooling_material.other) || 0)
  ) : 0;

  const bomTotal = quotation.items?.reduce((sum, i) => sum + (i.total || 0), 0) || 0;
  
  // Base subtotal (items + labor + tooling + coatings + transport)
  const baseSubtotal = bomTotal + laborTotal + toolingTotal + 
                       (Number(quotation.additional_charges?.texture_coatings) || 0) + 
                       (Number(quotation.additional_charges?.transportation) || 0);

  const overheadAmt = baseSubtotal * ((quotation.additional_charges?.overhead_rate || 0) / 100);
  const profitAmt = (baseSubtotal + overheadAmt) * ((quotation.additional_charges?.profit_rate || 0) / 100);
  const taxedAmt = (quotation.total_amount / (1 + ((quotation.additional_charges?.tax_rate || 0) / 100))) * ((quotation.additional_charges?.tax_rate || 0) / 100);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in-fade-in duration-1000">
      
      {/* 1. TOP DOCUMENT TOOLBAR (Classical) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-black dark:border-white pb-8 px-2 mx-1">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
             <span className="text-xl font-black text-black dark:text-zinc-100 uppercase tracking-tight">
               Quotation: {quotation.quotation_no}
             </span>
             <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
               quotation.status === QuotationStatus.ACCEPTED 
                 ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50" 
                 : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
             }`}>
               COMMIT: {quotation.status}
             </span>
           </div>
           <h1 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white leading-none italic">
             {quotation.supplier_name}
           </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/quotations/edit/${quotation.$id}`}>
             <Button variant="outline" className="rounded-xl border-zinc-200 hover:bg-zinc-50 font-bold uppercase text-[10px] tracking-widest px-6 h-11 border-2">Re-evaluate</Button>
          </Link>
          <Button variant="primary" className="rounded-xl shadow-xl shadow-black/10 px-8 font-bold uppercase text-[10px] tracking-widest h-11">Download PDF Proof</Button>
        </div>
      </div>

      {/* 2. MAIN DOCUMENT CONTENT (White Paper Style) */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-12 rounded shadow-sm text-black dark:text-zinc-100 font-sans">
        
        {/* TOP SPEC GRID (Classical 4-col) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-10 mb-16 border-b border-zinc-50 dark:border-zinc-900 pb-10 px-2">
           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Issued Identification</label>
              <p className="text-sm font-black uppercase tracking-tight">{quotation.issued_by || "Admin Ledger"}</p>
           </div>
           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Part Identification</label>
              <p className="text-sm font-black uppercase tracking-tight underline decoration-zinc-100 underline-offset-4 decoration-2">{quotation.part_number}</p>
           </div>
           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Die Analysis</label>
              <p className="text-sm font-black uppercase tracking-tight">{quotation.tech_specs?.die_size || "Standard"}</p>
           </div>
           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Settlement Registry</label>
              <p className="text-sm font-black uppercase tracking-tight">{quotation.currency} / {quotation.currency === "INR" ? "₹" : "$"}</p>
           </div>
        </div>

        {/* UNIFIED LEDGER TABLE (Traditional Table Design) */}
        <div className="mb-16">
          <table className="w-full text-left font-sans text-xs border border-zinc-200 dark:border-zinc-800 border-collapse overflow-hidden">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 font-black uppercase tracking-widest text-zinc-500 border-r border-zinc-200 dark:border-zinc-800">Description / Project Services</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-zinc-500 text-right">Registered Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 uppercase font-black tracking-tight text-[11px]">
              
              {/* BOM SECTION */}
              <tr className="bg-zinc-100 dark:bg-zinc-900/50">
                <td colSpan={2} className="px-6 py-2.5 font-bold italic tracking-widest text-[9px] text-zinc-400">SECTION 1: MATERIAL COMPONENTRY ANALYSIS</td>
              </tr>
              {quotation.items?.map((item, idx) => (
                <tr key={`bom-${idx}`} className="group hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 border-r border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                     {item.part_name} <span className="text-zinc-400 text-[9px] ml-2 opacity-60">({item.quantity} UNIT • {item.calculated_weight}KG)</span>
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">₹{item.total.toLocaleString()}</td>
                </tr>
              ))}

              {/* LABOR SECTION */}
              <tr className="bg-zinc-100 dark:bg-zinc-900/50">
                <td colSpan={2} className="px-6 py-2.5 font-bold italic tracking-widest text-[9px] text-zinc-400">SECTION 2: MANUFACTURING EXECUTION (LABOR)</td>
              </tr>
              {quotation.labor_processes?.filter(p => (p.total || 0) > 0).map((p, idx) => (
                <tr key={`lab-${idx}`} className="group hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 border-r border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 italic">
                     {p.name} <span className="text-zinc-400 font-normal italic ml-2">({p.hours} hrs @ ₹{p.cost_per_hr}/hr)</span>
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-zinc-600 dark:text-zinc-400">₹{p.total.toLocaleString()}</td>
                </tr>
              ))}

              {/* TOOLING & MISC */}
              <tr className="bg-zinc-100 dark:bg-zinc-900/50">
                <td colSpan={2} className="px-6 py-2.5 font-bold italic tracking-widest text-[9px] text-zinc-400">SECTION 3: TOOLING ASSETS & COORDINATION</td>
              </tr>
              {toolingTotal > 0 && (
                <tr className="group">
                  <td className="px-6 py-4 border-r border-zinc-200 dark:border-zinc-800">Tooling Material & Processing Base Charges</td>
                  <td className="px-6 py-4 text-right tabular-nums text-zinc-600 dark:text-zinc-400">₹{toolingTotal.toLocaleString()}</td>
                </tr>
              )}
              {Number(quotation.additional_charges?.texture_coatings) > 0 && (
                <tr>
                   <td className="px-6 py-4 border-r border-zinc-200 dark:border-zinc-800">Process Coating / Technical Surface Texturing</td>
                   <td className="px-6 py-4 text-right tabular-nums text-zinc-600 dark:text-zinc-400">₹{Number(quotation.additional_charges?.texture_coatings).toLocaleString()}</td>
                </tr>
              )}
              {Number(quotation.additional_charges?.transportation) > 0 && (
                <tr>
                   <td className="px-6 py-4 border-r border-zinc-200 dark:border-zinc-800 italic">Logistics / Out-of-Base Transportation & Prep</td>
                   <td className="px-6 py-4 text-right tabular-nums text-zinc-600 dark:text-zinc-400">₹{Number(quotation.additional_charges?.transportation).toLocaleString()}</td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t-2 border-black dark:border-zinc-100">
               <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                 <th className="px-6 py-4 font-black uppercase tracking-widest text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 text-right">Net Subtotal Valuation</th>
                 <th className="px-6 py-4 text-right font-black text-sm tabular-nums text-black dark:text-white">₹{baseSubtotal.toLocaleString()}</th>
               </tr>
            </tfoot>
          </table>
        </div>

        {/* FINANCIAL SUMMARY TABLE (Classical Right-aligned) */}
        <div className="flex flex-col md:flex-row gap-12 justify-between px-2">
           <div className="max-w-sm space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-black dark:text-white border-b-2 border-black dark:border-zinc-800 pb-2">Technical Footprint</h5>
              <div className="grid grid-cols-2 gap-y-4 gap-x-12 text-[10px] font-bold uppercase tracking-tight italic text-zinc-500">
                 <div>
                    <span>Shut Height:</span>
                    <span className="text-black dark:text-zinc-100 ml-2">{quotation.tech_specs?.shut_height || "0"} MM</span>
                 </div>
                 <div>
                    <span>Blank WT:</span>
                    <span className="text-black dark:text-zinc-100 ml-2">{quotation.tech_specs?.blank_weight || "0"} KG</span>
                 </div>
                 <div>
                    <span>Clamping pts:</span>
                    <span className="text-black dark:text-zinc-100 ml-2">{quotation.tech_specs?.num_clamps || "0"} UNIT</span>
                 </div>
                 <div>
                    <span>Stations:</span>
                    <span className="text-black dark:text-zinc-100 ml-2">{quotation.tech_specs?.stations || "1"}</span>
                 </div>
              </div>
           </div>

           <div className="w-full lg:w-96 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-500">
                 <span>Overhead Allocation ({quotation.additional_charges?.overhead_rate}%)</span>
                 <span className="tabular-nums">+ ₹{Math.round(overheadAmt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-500">
                 <span>Project Profit Margin ({quotation.additional_charges?.profit_rate}%)</span>
                 <span className="tabular-nums">+ ₹{Math.round(profitAmt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                 <span>Statutory GST / Tax Revenue ({quotation.additional_charges?.tax_rate}%)</span>
                 <span className="tabular-nums">+ ₹{Math.round(taxedAmt).toLocaleString()}</span>
              </div>
              {quotation.additional_charges?.discount_rate > 0 && (
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-rose-600 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                   <span>Contractual Discount Apply</span>
                   <span className="tabular-nums">- ₹{Math.round(baseSubtotal * (quotation.additional_charges.discount_rate / 100)).toLocaleString()}</span>
                </div>
              )}
              
              <div className="pt-8 mt-4 border-t-2 border-black dark:border-white">
                 <div className="flex justify-between items-end">
                    <span className="text-sm font-black uppercase tracking-[0.5em] italic leading-none text-zinc-400">Grand Total</span>
                    <div className="text-5xl font-black tabular-nums tracking-tighter text-black dark:text-white leading-none">
                       <span className="text-xl font-normal align-top mr-1">₹</span>
                       {Math.round(quotation.total_amount).toLocaleString()}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ATTACHED INQUIRY FILES (Monochrome Ribbon) */}
        {quotation.file_ids && quotation.file_ids.length > 0 && (
          <div className="mt-16 border-t-2 border-zinc-100 dark:border-zinc-900 pt-8">
             <div className="flex items-center gap-2 mb-6 text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Attached Inquiry Documents</span>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quotation.file_ids.map(fileId => (
                  <FileLink key={fileId} fileId={fileId} />
                ))}
             </div>
          </div>
        )}

        {/* FOOTER AUDIT */}
        <div className="mt-20 pt-16 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="text-[9px] font-black uppercase flex flex-col gap-1">
               <span>Audit Record Reference</span>
               <span className="text-black dark:text-white">AUTH-{quotation.$id.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="text-[9px] font-black uppercase flex flex-col gap-1 text-right">
               <span>Creation Timestamp</span>
               <span className="text-black dark:text-white">{new Date(quotation.$createdAt).toLocaleString()}</span>
            </div>
        </div>
      </div>
    </div>
  );
};
