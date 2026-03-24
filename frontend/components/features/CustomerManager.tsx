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

  const handleAddCustomer = async () => {
    try {
      if (!newCustomer.name) return;
      await customerService.createCustomer(newCustomer);
      setIsAdding(false);
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
      console.error("Failed to add customer:", error);
    }
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white">Customer Base</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-2 italic">Client relationship management for the ledger.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-2xl shadow-xl shadow-black/10 transition-transform active:scale-95"
        >
          {isAdding ? "Cancel Entry" : "+ Add New Client"}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-8 border-none shadow-2xl animate-in slide-in-from-top-4 duration-500 bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8 border-b pb-4">New Client Registration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Input 
              label="Company Legal Name" 
              placeholder="e.g. Acme Corp India"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            />
            <Input 
              label="Primary Contact Person" 
              placeholder="e.g. John Doe"
              value={newCustomer.contact_person}
              onChange={(e) => setNewCustomer({ ...newCustomer, contact_person: e.target.value })}
            />
            <Input 
              label="Official E-mail" 
              placeholder="john@acme.com"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            />
            <Input 
              label="Phone Number" 
              placeholder="+91-0000-000-000"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            />
            <Input 
              label="Office Location" 
              placeholder="e.g. Pune, Maharashtra"
              value={newCustomer.location}
              onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
            />
            <Input 
              label="Preferred Mfg Location" 
              placeholder="e.g. Chakan Plant"
              value={newCustomer.mfg_location}
              onChange={(e) => setNewCustomer({ ...newCustomer, mfg_location: e.target.value })}
            />
          </div>
          <div className="mt-8 flex justify-end">
            <Button variant="primary" onClick={handleAddCustomer} size="lg" className="rounded-2xl min-w-[200px]">Save Client Record</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden border-zinc-100 dark:border-zinc-900 shadow-xl">
        <table className="w-full text-left font-mono text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Company Name</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Contact</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Email & Phone</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Location</th>
              <th className="px-6 py-5 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center animate-pulse text-zinc-400 uppercase text-xs italic tracking-widest">Hydrating Customer List...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-zinc-400 uppercase text-xs italic">No client records found.</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.$id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-black text-black dark:text-white uppercase tracking-tight block truncate max-w-[200px]">{c.name}</span>
                    <span className="text-[9px] text-zinc-400 uppercase">Registered ID: {c.$id.substring(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300 uppercase">{c.contact_person || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="block font-bold truncate max-w-[200px]">{c.email || "-"}</span>
                    <span className="text-[10px] text-zinc-400">{c.phone || "-"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold block truncate max-w-[150px]">{c.location || "-"}</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-tighter">{c.mfg_location && `MFG: ${c.mfg_location}`}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDeleteCustomer(c.$id)}
                      className="text-zinc-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
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
