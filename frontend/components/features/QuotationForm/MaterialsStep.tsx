'use client';

import React, { useState, useEffect } from "react";
import { Material } from "@/types/material";
import { materialsService } from "@/services/MaterialsService";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface MaterialsStepProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * MaterialsStep Component
 * Second part of the Quotation Form: handles selection of materials from the library.
 * Now uses a Categorized List Layout for better technical comparison.
 */
export const MaterialsStep: React.FC<MaterialsStepProps> = ({ selectedIds, onChange }) => {
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const data = await materialsService.getMaterialsPage(1, 100);
        setAllMaterials(data.documents);
      } catch (error) {
        console.error("Failed to load materials for selection:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredMaterials = allMaterials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.grade && m.grade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedMaterials = filteredMaterials.reduce((acc, m) => {
    const category = m.name.toUpperCase();
    if (!acc[category]) acc[category] = [];
    acc[category].push(m);
    return acc;
  }, {} as Record<string, Material[]>);

  const categories = Object.keys(groupedMaterials).sort();

  const toggleMaterial = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(idx => idx !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedMaterials = allMaterials.filter(m => selectedIds.includes(m.$id));

  return (
    <div className="space-y-8">
      <Card className="p-8 space-y-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
           <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">Section 2: Material Selection</h3>
            <span className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest hidden md:block">Choose all materials required for your BOM</p>
          </div>
          <span className="text-[10px] px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 font-mono font-bold border border-zinc-200 dark:border-zinc-700">STEP 02/05</span>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <Input 
              placeholder="Search by Grade, Material Name, or Specification..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 pl-12 rounded-3xl border-2 border-zinc-50 bg-zinc-50/30 text-base focus:bg-white focus:border-zinc-900 dark:focus:border-zinc-100 transition-all font-bold tracking-tight"
            />
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide -mx-2">
            {isLoading ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-4 border-zinc-100 border-t-black dark:border-zinc-900 dark:border-t-white rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">Accessing Material Ledger...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-zinc-400 uppercase text-[10px] font-black tracking-widest italic flex flex-col items-center gap-4">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                   No materials matching your current query.
                </p>
              </div>
            ) : (
              categories.map(cat => (
                <div key={cat} className="space-y-2 relative">
                  <div className="sticky top-0 z-10 py-2 bg-white dark:bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-50 dark:border-zinc-900 mb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                      {cat}
                      <span className="text-zinc-400 font-bold">({groupedMaterials[cat].length})</span>
                    </h4>
                  </div>
                  
                  <div className="space-y-1">
                    {groupedMaterials[cat].map(m => {
                      const isSelected = selectedIds.includes(m.$id);
                      return (
                        <button
                          key={m.$id}
                          onClick={() => toggleMaterial(m.$id)}
                          className={`w-full group flex items-center gap-6 p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                            isSelected
                              ? "bg-zinc-900 border-zinc-900 shadow-lg dark:bg-white dark:border-white"
                              : "bg-white border-transparent hover:border-zinc-200 dark:bg-zinc-950 dark:hover:border-zinc-800"
                          }`}
                        >
                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                            isSelected 
                              ? "bg-white border-white dark:bg-black dark:border-black animate-in zoom-in-50" 
                              : "bg-zinc-50 border-zinc-100 group-hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800"
                          }`}>
                            {isSelected && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <span className={`font-black text-xs uppercase tracking-tight ${
                              isSelected ? "text-white dark:text-black" : "text-zinc-600 dark:text-zinc-300"
                            }`}>
                              {m.grade || "STANDARD GRADE"}
                            </span>
                            
                            <div className="flex items-center gap-6">
                               <div className="flex flex-col items-end">
                                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter mb-0.5">Rate</span>
                                  <span className={`font-mono font-black text-[11px] ${
                                    isSelected ? "text-emerald-400 " : "text-emerald-600"
                                  }`}>
                                    ₹{m.base_rate}/kg
                                  </span>
                               </div>
                               <div className="flex flex-col items-end">
                                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter mb-0.5">Density</span>
                                  <span className={`font-mono font-black text-[11px] ${
                                    isSelected ? "text-blue-400" : "text-blue-600"
                                  }`}>
                                    {m.density} g/cm³
                                  </span>
                               </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {selectedMaterials.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-zinc-950 p-6 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-900 shadow-sm">
          <div className="flex items-center justify-between mb-4 px-2">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">Ready for costing ({selectedMaterials.length})</h4>
             <span className="text-[10px] text-zinc-400 italic">Added to BOM scope</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedMaterials.map(m => (
              <div 
                key={m.$id} 
                className="flex items-center gap-3 pl-4 pr-2 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl group transition-all hover:border-black dark:hover:border-white"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase truncate max-w-[150px]">
                    {m.name}
                  </span>
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">{m.grade || "Standard"}</span>
                </div>
                <button 
                  onClick={() => toggleMaterial(m.$id)}
                  className="h-6 w-6 rounded-lg flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
