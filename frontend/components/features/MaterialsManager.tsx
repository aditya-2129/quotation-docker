'use client';

import React, { useEffect, useState } from "react";
import { materialsService } from "@/services/MaterialsService";
import { Material, MaterialShape } from "@/types/material";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

/**
 * MaterialsManager Feature
 * Handles the listing and management of materials library docs.
 */
export const MaterialsManager: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 25;
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    density: 0,
    base_rate: 0,
    shape: MaterialShape.ROUND_BAR,
  });

  useEffect(() => {
    fetchMaterials(currentPage);
  }, [currentPage]);

  const fetchMaterials = async (page: number) => {
    try {
      setIsLoading(true);
      const data = await materialsService.getMaterialsPage(page, limit);
      setMaterials(data.documents);
      setTotalMaterials(data.total);
    } catch (error) {
      console.error("Failed to load materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await materialsService.updateMaterial(editingMaterial.$id, formData);
      } else {
        await materialsService.createMaterial(formData);
      }
      setIsModalOpen(false);
      fetchMaterials(currentPage);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save material:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      await materialsService.deleteMaterial(id);
      fetchMaterials(currentPage);
    } catch (error) {
      console.error("Failed to delete material:", error);
    }
  };

  const handleOpenModal = (material: Material | null = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        grade: material.grade || "",
        density: material.density,
        base_rate: material.base_rate,
        shape: material.shape,
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        name: "",
        grade: "",
        density: 0,
        base_rate: 0,
        shape: MaterialShape.ROUND_BAR,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setFormData({
      name: "",
      grade: "",
      density: 0,
      base_rate: 0,
      shape: MaterialShape.ROUND_BAR,
    });
  };

  const totalPages = Math.ceil(totalMaterials / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white uppercase">Materials Library</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage raw material data and pricing for quotations.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
          + Add Material
        </Button>
      </div>

      <div className="space-y-4">
        <Card variant="glass" className="overflow-hidden border-none shadow-premium">
          <table className="w-full text-left font-sans text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Material Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Grade Spec</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Geometry</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Density (g/cm³)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Base Rate (₹/kg)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 w-28 text-center">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400 uppercase italic">Loading materials...</td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400 uppercase italic">No materials found in the library.</td>
                </tr>
              ) : (
                materials.map((m) => (
                  <tr key={m.$id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all duration-300">
                    <td className="px-6 py-4 text-zinc-900 dark:text-zinc-50 font-black uppercase tracking-tight text-[11px]">{m.name}</td>
                    <td className="px-6 py-4 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">{m.grade || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
                        {m.shape.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono text-xs">{m.density.toFixed(4)}</td>
                    <td className="px-6 py-4 text-zinc-900 dark:text-zinc-50 font-black text-xs">₹{m.base_rate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(m)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-all shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(m.$id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/20 text-zinc-400 hover:text-rose-600 transition-all shadow-sm border border-transparent hover:border-rose-100 dark:hover:border-rose-900"
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-2 font-mono">
          <p className="text-xs text-zinc-400 uppercase tracking-tighter">
            Showing {materials.length} of {totalMaterials} results
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-zinc-400 uppercase font-black uppercase tracking-widest">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingMaterial ? "Edit Material" : "Add Material"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Material Name" 
              placeholder="e.g., Mild Steel" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input 
              label="Grade" 
              placeholder="e.g., EN8" 
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Density (g/cm³)" 
              type="number" 
              step="0.0001" 
              value={formData.density}
              onChange={(e) => setFormData({ ...formData, density: parseFloat(e.target.value) })}
              required
            />
            <Input 
              label="Base Rate (₹/kg)" 
              type="number" 
              step="0.01" 
              value={formData.base_rate}
              onChange={(e) => setFormData({ ...formData, base_rate: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Material Shape</label>
            <select 
              className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
              value={formData.shape}
              onChange={(e) => setFormData({ ...formData, shape: e.target.value as MaterialShape })}
              required
            >
              {Object.values(MaterialShape).map((s) => (
                <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {editingMaterial ? "Update" : "Save Material"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
