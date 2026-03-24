'use client';

import React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FileUploader } from "@/components/ui/FileUploader";

import { Customer } from "@/types/customer";
import { customerService } from "@/services/CustomerService";

interface GeneralInfoProps {
  formData: any;
  onChange: (field: string, value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
}

/**
 * GeneralInfoStep Component
 * First part of the Quotation Form: handles detailed identification based on business standards.
 */
export const GeneralInfoStep: React.FC<GeneralInfoProps> = ({ formData, onChange, onCustomerSelect }) => {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await customerService.getAllCustomers();
        setCustomers(data);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleProfileChange = (id: string) => {
    if (id === "new") return;
    const selected = customers.find(c => c.$id === id);
    if (selected) {
      onCustomerSelect(selected);
    }
  };

  return (
    <Card className="p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Section 1: Detailed Info</h3>
        <span className="text-[10px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 font-mono">STEP 01/05</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Column 1: Client / Identity */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Client Identification</h4>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-blue-500 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Select Profile
              </label>
              <select 
                className="flex h-12 w-full rounded-2xl border-2 border-zinc-100 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 transition-all font-bold uppercase tracking-tight shadow-sm"
                value={formData.customer_id || "new"}
                onChange={(e) => handleProfileChange(e.target.value)}
              >
                <option value="new">-- NEW / MANUAL ENTRY --</option>
                {customers.map(c => (
                  <option key={c.$id} value={c.$id}>{c.name}</option>
                ))}
              </select>
            </div>

            <Input 
              label="Client Name" 
              placeholder="e.g., ABC Engineering" 
              value={formData.supplier_name}
              onChange={(e) => onChange("supplier_name", e.target.value)}
              className="h-12 rounded-2xl border-2 focus:border-blue-500"
            />
            <Input 
              label="Contact Person" 
              placeholder="e.g., John Doe" 
              value={formData.issued_by}
              onChange={(e) => onChange("issued_by", e.target.value)}
              className="h-12 rounded-2xl border-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Phone" 
                placeholder="+91..." 
                value={formData.phone_number}
                onChange={(e) => onChange("phone_number", e.target.value)}
                className="h-12 rounded-2xl border-2"
              />
              <Input 
                label="Email" 
                placeholder="name@company.com" 
                value={formData.email_address}
                onChange={(e) => onChange("email_address", e.target.value)}
                className="h-12 rounded-2xl border-2"
              />
            </div>
          </div>
        </div>

        {/* Column 2: Part / Quotation Details */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <div className="h-2 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Quotation Context</h4>
          </div>

          <div className="space-y-6">
            <Input 
              label="Part Number" 
              placeholder="PN-12345" 
              value={formData.part_number}
              onChange={(e) => onChange("part_number", e.target.value)}
              className="h-12 rounded-2xl border-2 focus:border-emerald-500"
            />
            <Input 
              label="Part Description" 
              placeholder="Brief description of the component" 
              value={formData.part_description}
              onChange={(e) => onChange("part_description", e.target.value)}
              className="h-12 rounded-2xl border-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Issue Date" 
                type="date" 
                value={formData.issue_date}
                onChange={(e) => onChange("issue_date", e.target.value)}
                className="h-12 rounded-2xl border-2 focus:border-emerald-500"
              />
              <div className="space-y-2 flex flex-col justify-center">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Currency</span>
                 <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono">INR (₹)</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* NEW SECTION: Technical Drawings & CAD */}
      <div className="pt-12 mt-12 border-t-2 border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-3 mb-8">
           <div className="h-2 w-4 rounded-full bg-zinc-400" />
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white">Technical Drawings & Inquiry Files</h4>
        </div>
        <FileUploader 
          initialFileIds={formData.file_ids}
          onUploadComplete={(ids) => onChange("file_ids", ids as any)}
        />
      </div>
    </Card>
  );
};
