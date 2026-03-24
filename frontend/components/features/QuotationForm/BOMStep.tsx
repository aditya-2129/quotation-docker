'use client';

import React, { useState, useEffect } from "react";
import { Material, MaterialShape } from "@/types/material";
import { QuotationItem } from "@/types/quotation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { materialsService } from "@/services/MaterialsService";

interface BOMStepProps {
  selectedMaterialIds: string[];
  items: QuotationItem[];
  onChange: (items: QuotationItem[]) => void;
}

/**
 * BOMStep Component
 * Third part of the Quotation Form: handles the calculation and addition of individual parts.
 */
export const BOMStep: React.FC<BOMStepProps> = ({ selectedMaterialIds, items, onChange }) => {
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // New Item State
  const [newItem, setNewItem] = useState<Partial<QuotationItem>>({
    part_name: "",
    material_id: selectedMaterialIds[0] || "",
    shape: MaterialShape.ROUND_BAR,
    dimensions: { length: 0, width: 0, thickness: 0, diameter: 0 },
    calculated_weight: 0,
    rate: 0,
    quantity: 1,
    allowance: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchSelected = async () => {
      // Pull detail for the selected materials to get density/rate
      const data = await materialsService.getMaterialsPage(1, 100);
      const filtered = data.documents.filter(m => selectedMaterialIds.includes(m.$id));
      setAvailableMaterials(filtered);
      
      // Default to the first selected material rate if not set
      if (filtered.length > 0 && !newItem.rate) {
        setNewItem(prev => ({ 
          ...prev, 
          material_id: filtered[0].$id,
          rate: filtered[0].base_rate 
        }));
      }
    };
    fetchSelected();
  }, [selectedMaterialIds]);

  // CALCULATION LOGIC
  useEffect(() => {
    const material = availableMaterials.find(m => m.$id === newItem.material_id);
    if (!material) return;

    let volumeMm3 = 0;
    const buff = newItem.allowance || 0;
    const { length = 0, width = 0, thickness = 0, diameter = 0 } = newItem.dimensions || {};
    
    // Apply buffer to all non-zero dimensions
    const L = length > 0 ? length + buff : 0;
    const W = width > 0 ? width + buff : 0;
    const T = thickness > 0 ? thickness + buff : 0;
    const D = diameter > 0 ? diameter + buff : 0;

    switch (newItem.shape) {
      case MaterialShape.ROUND_BAR:
        // PI * r^2 * L
        volumeMm3 = Math.PI * Math.pow(D / 2, 2) * L;
        break;
      case MaterialShape.SQUARE_BAR:
        // W^2 * L
        volumeMm3 = Math.pow(W, 2) * L;
        break;
      case "plate":
      case MaterialShape.HEX_BAR:
        if (newItem.shape === "plate") {
          volumeMm3 = L * W * T;
        } else {
          // Hex: (sqrt(3) / 2) * AF^2 * L
          volumeMm3 = (Math.sqrt(3) / 2) * Math.pow(D, 2) * L;
        }
        break;
    }

    const weightKg = (volumeMm3 * material.density) / 1000000;
    const total = weightKg * (newItem.rate || 0) * (newItem.quantity || 1);

    setNewItem(prev => ({ 
      ...prev, 
      calculated_weight: Number(weightKg.toFixed(3)),
      total: Number(total.toFixed(2))
    }));
  }, [newItem.dimensions, newItem.shape, newItem.material_id, newItem.rate, newItem.quantity, newItem.allowance, availableMaterials]);

  const handleAddItem = () => {
    const newErrors: Record<string, string> = {};
    if (!newItem.part_name) newErrors.part_name = "Part name is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onChange([...items, { ...newItem, id: Math.random().toString(36).substr(2, 9) } as QuotationItem]);
    setIsAddingItem(false);
    setErrors({});
    // Reset
    setNewItem({
      part_name: "",
      material_id: selectedMaterialIds[0] || "",
      shape: MaterialShape.ROUND_BAR,
      dimensions: { length: 0, width: 0, thickness: 0, diameter: 0 },
      calculated_weight: 0,
      rate: availableMaterials[0]?.base_rate || 0,
      quantity: 1,
      allowance: 0,
      total: 0,
    });
  };

  const removeItem = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight text-black dark:text-white">Bill of Materials (BOM)</h3>
          <p className="text-sm text-zinc-500 uppercase tracking-tighter">List the parts and calculate weights.</p>
        </div>
        {!isAddingItem && (
          <Button variant="primary" onClick={() => setIsAddingItem(true)}>+ Add Part</Button>
        )}
      </div>

      {isAddingItem && (
        <Card className="p-3 border-2 border-black dark:border-white shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b pb-3 mb-1">
            <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-zinc-500">New Part Entry</h4>
            <button onClick={() => setIsAddingItem(false)} className="text-zinc-400 hover:text-black transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input 
                label="Part name" 
                placeholder="e.g., BRACKET-01" 
                value={newItem.part_name}
                error={errors.part_name}
                onChange={e => {
                  setNewItem({...newItem, part_name: e.target.value});
                  if (errors.part_name) setErrors({...errors, part_name: ""});
                }}
                className="h-9 rounded-xl border-2 font-bold uppercase text-xs"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Material</label>
                  <select 
                    className="w-full h-9 px-3 rounded-xl border-2 border-zinc-100 bg-white dark:bg-zinc-950 font-bold uppercase transition-all shadow-sm focus:border-black dark:focus:border-white focus:outline-none text-[11px]"
                    value={newItem.material_id}
                    onChange={e => {
                      const mat = availableMaterials.find(m => m.$id === e.target.value);
                      setNewItem({...newItem, material_id: e.target.value, rate: mat?.base_rate || 0});
                    }}
                  >
                    {availableMaterials.map(m => (
                      <option key={m.$id} value={m.$id}>{m.name} ({m.grade})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 group">
                   <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Rate (₹/KG)</label>
                   <Input 
                     type="number"
                     placeholder="Rate"
                     value={newItem.rate}
                     onChange={e => setNewItem({...newItem, rate: Number(e.target.value)})}
                     className="h-9 rounded-xl border-2 font-bold text-xs"
                   />
                </div>

                <div className="space-y-1 group">
                   <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Quantity</label>
                   <Input 
                     type="number"
                     placeholder="No."
                     value={newItem.quantity}
                     onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                     className="h-9 rounded-xl border-2 font-bold text-xs"
                   />
                </div>

                <div className="space-y-1 group">
                   <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Buffer (mm)</label>
                   <Input 
                     type="number"
                     placeholder="+mm"
                     value={newItem.allowance}
                     onChange={e => setNewItem({...newItem, allowance: Number(e.target.value)})}
                     className="h-9 rounded-xl border-2 font-bold text-xs text-blue-600 bg-blue-50/10"
                   />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Section Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: MaterialShape.ROUND_BAR, label: "Round Bar", icon: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" },
                    { id: MaterialShape.SQUARE_BAR, label: "Square Bar", icon: "M3 3h18v18H3z" },
                    { id: MaterialShape.HEX_BAR, label: "Hex Bar", icon: "M12 2l8.66 5v10L12 22l-8.66-5V7z" },
                    { id: "plate", label: "Plate/Flat", icon: "M2 2h20v20H2z" }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setNewItem({...newItem, shape: s.id as any})}
                      className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all group ${
                        newItem.shape === s.id 
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-md dark:bg-white dark:text-black font-black" 
                          : "bg-white border-zinc-50 text-zinc-400 hover:border-zinc-200 dark:bg-zinc-950 dark:border-zinc-900"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon}/></svg>
                      <span className="text-[8px] font-bold uppercase tracking-tight">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden flex flex-col justify-between h-full min-h-[260px]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-1">
                   <div className="h-1 w-1 rounded-full bg-blue-500" />
                   <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Inputs (mm)</h5>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {(newItem.shape === MaterialShape.ROUND_BAR || newItem.shape === MaterialShape.HEX_BAR) ? (
                    <>
                      <Input 
                        label={newItem.shape === MaterialShape.ROUND_BAR ? "Ø" : "AF"} 
                        type="number"
                        value={newItem.dimensions?.diameter}
                        onChange={e => setNewItem({...newItem, dimensions: {...newItem.dimensions!, diameter: Number(e.target.value)}})}
                        className="h-8 rounded-lg border text-[11px]"
                      />
                      <Input 
                        label="L" 
                        type="number"
                        value={newItem.dimensions?.length}
                        onChange={e => setNewItem({...newItem, dimensions: {...newItem.dimensions!, length: Number(e.target.value)}})}
                        className="h-8 rounded-lg border text-[11px]"
                      />
                    </>
                  ) : (
                    <>
                      <Input 
                        label="L" 
                        type="number"
                        value={newItem.dimensions?.length}
                        onChange={e => setNewItem({...newItem, dimensions: {...newItem.dimensions!, length: Number(e.target.value)}})}
                        className="h-8 rounded-lg border text-[11px]"
                      />
                      <Input 
                        label="W" 
                        type="number"
                        value={newItem.dimensions?.width}
                        onChange={e => setNewItem({...newItem, dimensions: {...newItem.dimensions!, width: Number(e.target.value)}})}
                        className="h-8 rounded-lg border text-[11px]"
                      />
                      {newItem.shape === "plate" && (
                        <Input 
                          label="T" 
                          type="number"
                          className="col-span-2 h-8 rounded-lg border text-[11px]"
                          value={newItem.dimensions?.thickness}
                          onChange={e => setNewItem({...newItem, dimensions: {...newItem.dimensions!, thickness: Number(e.target.value)}})}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-tight">
                  <span className="text-zinc-400">Calc Weight</span>
                  <span className="text-zinc-900 dark:text-white">{newItem.calculated_weight} KG</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 tracking-widest uppercase font-black">Subtotal</span>
                  <span className="text-lg font-black tracking-tighter text-black dark:text-white">₹{newItem.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-1">
            <Button variant="ghost" className="h-9 px-4 text-[11px] font-bold" onClick={() => setIsAddingItem(false)}>Cancel</Button>
            <Button variant="primary" className="h-9 px-6 text-[11px] font-black uppercase tracking-widest shadow-lg" onClick={handleAddItem}>Confirm & Add</Button>
          </div>
        </Card>
      )}

      {/* ITEMS LIST TABLE */}
      <Card className="overflow-hidden border-2 border-zinc-100 dark:border-zinc-900 rounded-3xl">
        <table className="w-full text-left font-sans border-collapse">
          <thead className="bg-zinc-50 dark:bg-zinc-950 border-b-2 border-zinc-100 dark:border-zinc-900">
            <tr>
              <th className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">BOM Part Details</th>
              <th className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Material Composition</th>
              <th className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Unit Weight</th>
              <th className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Qty</th>
              <th className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Line Total</th>
              <th className="px-4 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-24 text-center">
                   <div className="flex flex-col items-center gap-4 opacity-40">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20L12 2z"/></svg>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">BOM Ledger Empty</span>
                      <p className="text-[11px] text-zinc-500 max-w-[200px] leading-relaxed">Add parts using the selector above to start calculating raw material costs.</p>
                   </div>
                </td>
              </tr>
            ) : (
              items.map(item => {
                const mat = availableMaterials.find(m => m.$id === item.material_id);
                return (
                  <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-2">
                      <div className="font-black text-[12px] text-zinc-900 dark:text-white uppercase tracking-tight line-height-1">{item.part_name}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1 py-0 bg-zinc-100 dark:bg-zinc-800 rounded font-bold text-[7px] text-zinc-500 uppercase tracking-tighter">{item.shape}</span>
                        {item.allowance > 0 && <span className="text-[7px] font-black text-blue-500 uppercase tracking-tighter">+{item.allowance}mm</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-zinc-900 dark:text-zinc-100 font-black text-[10px] uppercase tracking-tight">{mat?.name || "Unknown"}</div>
                      <div className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">{mat?.grade || "N/A"}</div>
                    </td>
                    <td className="px-4 py-2 text-center">
                       <div className="flex flex-col items-center">
                         <span className="font-mono font-black text-[10px] text-zinc-700 dark:text-zinc-300">{item.calculated_weight}</span>
                         <span className="text-[6px] text-zinc-400 font-black uppercase tracking-widest -mt-0.5">KG / UNIT</span>
                       </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                       <div className="flex flex-col items-center">
                         <span className="font-black text-[10px] text-zinc-900 dark:text-zinc-100">{item.quantity}</span>
                         <span className="text-[6px] text-zinc-400 font-black uppercase tracking-widest -mt-0.5">PCS</span>
                       </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                       <div className="font-black text-[13px] text-black dark:text-white tracking-tighter">
                          ₹{item.total.toLocaleString()}
                       </div>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot className="bg-zinc-900 text-white">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right">
                   <span className="uppercase tracking-[0.4em] font-black text-[8px] text-zinc-400">BOM Subtotal</span>
                </td>
                <td className="px-4 py-3 text-right">
                   <div className="text-lg font-black tracking-tighter">
                      ₹{items.reduce((sum, i) => sum + i.total, 0).toLocaleString()}
                   </div>
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </Card>
    </div>
  );
};
