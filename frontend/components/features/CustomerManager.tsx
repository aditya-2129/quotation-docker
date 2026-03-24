'use client';

import React, { useState, useEffect } from "react";
import { Customer } from "@/types/customer";
import { customerService } from "@/services/CustomerService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

/**
 * CustomerManager Component
 * Allows users to add, edit, and view customers in the system.
 */
export const CustomerManager: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    location: "",
    mfg_location: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomer = async () => {
    try {
      if (!newCustomer.name) return;
      
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.$id, newCustomer);
      } else {
        await customerService.createCustomer(newCustomer);
      }

      setIsAdding(false);
      setEditingCustomer(null);
      setNewCustomer({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        location: "",
        mfg_location: "",
      });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to save customer:", error);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      contact_person: customer.contact_person || "",
      email: customer.email || "",
      phone: customer.phone || "",
      location: customer.location || "",
      mfg_location: customer.mfg_location || "",
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await customerService.deleteCustomer(id);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  const toggleAddMode = () => {
    if (isAdding) {
      setIsAdding(false);
      setEditingCustomer(null);
      setNewCustomer({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        location: "",
        mfg_location: "",
      });
    } else {
      setIsAdding(true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white">Customer Base</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-2 italic">Client relationship management for the ledger.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={toggleAddMode}
          className="rounded-2xl shadow-xl shadow-black/10 transition-transform active:scale-95"
        >
          {isAdding ? "Cancel Entry" : "+ Add New Client"}
        </Button>
      </div>

      {isAdding && (
        <Card variant="glass" className="p-0 border-none shadow-premium overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <div className="px-8 py-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                {editingCustomer ? "Update Client Record" : "New Client Registration"}
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Hydrate the database with new partner info</p>
            </div>
            <button onClick={toggleAddMode} className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="px-8 py-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input 
                label="Company Legal Name" 
                placeholder="e.g. Acme Corp India"
                className="h-11 rounded-xl"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
              <Input 
                label="Primary Contact Person" 
                placeholder="e.g. John Doe"
                className="h-11 rounded-xl"
                value={newCustomer.contact_person}
                onChange={(e) => setNewCustomer({ ...newCustomer, contact_person: e.target.value })}
              />
              <Input 
                label="Official E-mail" 
                placeholder="john@acme.com"
                className="h-11 rounded-xl"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              />
              <Input 
                label="Phone Number" 
                placeholder="+91-0000-000-000"
                className="h-11 rounded-xl"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
              <Input 
                label="Office Location" 
                placeholder="e.g. Pune, Maharashtra"
                className="h-11 rounded-xl"
                value={newCustomer.location}
                onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
              />
              <Input 
                label="Preferred Mfg Location" 
                placeholder="e.g. Chakan Plant"
                className="h-11 rounded-xl"
                value={newCustomer.mfg_location}
                onChange={(e) => setNewCustomer({ ...newCustomer, mfg_location: e.target.value })}
              />
            </div>
            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="primary" onClick={handleSaveCustomer} className="rounded-xl h-12 min-w-[240px] shadow-premium uppercase font-black text-[10px] tracking-[0.2em]">
                {editingCustomer ? "Update Client Records" : "Archive Client Record"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card variant="glass" className="overflow-hidden border-none shadow-premium">
        <table className="w-full text-left font-sans text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Client Identity</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Point of Contact</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Communication</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Logistics</th>
              <th className="px-8 py-6 w-32 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center animate-pulse text-zinc-400 uppercase text-[10px] font-black tracking-[0.3em]">Hydrating Cloud Ledger...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-zinc-400 uppercase text-xs italic">No client records found.</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.$id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all duration-300">
                  <td className="px-8 py-5">
                    <span className="font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight block truncate max-w-[200px] text-[11px]">{c.name}</span>
                    <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">ID: {c.$id.substring(0, 8)}</span>
                  </td>
                  <td className="px-8 py-5 font-bold text-zinc-600 dark:text-zinc-400 uppercase text-[10px] tracking-tight">{c.contact_person || "Not Assigned"}</td>
                  <td className="px-8 py-5">
                    <span className="block font-black text-xs truncate max-w-[200px] text-zinc-900 dark:text-zinc-100 tracking-tight">{c.email || "-"}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{c.phone || "-"}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold block truncate max-w-[150px] uppercase text-[10px] text-zinc-600 dark:text-zinc-400">{c.location || "-"}</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest mt-0.5 block">{c.mfg_location && `LOC: ${c.mfg_location}`}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         onClick={() => handleEditCustomer(c)}
                         className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-all shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button 
                         onClick={() => handleDeleteCustomer(c.$id)}
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
    </div>
  );
};
