'use client';

import React, { useState, useEffect } from "react";
import { Quotation, QuotationStatus } from "@/types/quotation";
import { Customer } from "@/types/customer";
import { GeneralInfoStep } from "./GeneralInfoStep";
import { MaterialsStep } from "./MaterialsStep";
import { BOMStep } from "./BOMStep";
import { LaborStep } from "./LaborStep";
import { ReviewStep } from "./ReviewStep";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { quotationService } from "@/services/QuotationService";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/ui/Stepper";

interface QuotationFormProps {
  initialData?: any;
}

/**
 * QuotationForm Component
 * The main container for creating and editing individual quotations.
 */
export const QuotationForm: React.FC<QuotationFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    supplier_name: "",
    issued_by: "",
    phone_number: "",
    email_address: "",
    part_number: "",
    part_description: "",
    design_change_level: "",
    mfg_location: "",
    issue_date: new Date().toISOString().split('T')[0],
    tool_shop_name: "",
    tool_shop_location: "",
    currency: "INR",
    quotation_no: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: QuotationStatus.DRAFT,
    total_amount: 0,
    items: [] as any[],
    selected_material_ids: [] as string[],
    customer_id: "",
    
    // New Detailed Fields
    labor_processes: [] as any[],
    tooling_material: {
      tool_components: 0,
      pattern_casting: 0,
      heat_treat: 0,
      material_cost: 0,
      finish_weight: 0,
      other: 0,
    },
    tech_specs: {
      blank_weight: 0,
      die_size: "",
      stations: 0,
      shut_height: 0,
      num_fixtures: 0,
      num_rotations: 0,
      num_clamps: 0,
    },
    additional_charges: {
      texture_coatings: 0,
      transportation: 0,
      overhead_rate: 15,
      profit_rate: 10,
      tax_rate: 18,
      discount_rate: 0,
    },
  });

  // INITIALIZE FOR EDITING
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleGeneralInfoChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData((prev: any) => ({
      ...prev,
      customer_id: customer.$id,
      supplier_name: customer.name,
      issued_by: customer.contact_person || "",
      email_address: customer.email || "",
      phone_number: customer.phone || "",
      mfg_location: customer.mfg_location || customer.location || "",
    }));
  };

  const handleMaterialsChange = (ids: string[]) => {
    setFormData({ ...formData, selected_material_ids: ids });
  };

  const handleItemsChange = (items: any[]) => {
    setFormData((prev: any) => ({ ...prev, items }));
  };

  // RECALCULATE GRAND TOTAL whenever any cost field changes
  useEffect(() => {
    const bomTotal = formData.items.reduce((sum: number, item: any) => sum + item.total, 0);
    const laborTotal = formData.labor_processes.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
    const toolingTotal = Object.values(formData.tooling_material).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
    
    // Base cost before Overhead and Profit
    const baseSubtotal = bomTotal + laborTotal + toolingTotal + (Number(formData.additional_charges.texture_coatings) || 0) + (Number(formData.additional_charges.transportation) || 0);
    
    // Apply Overhead
    const overheadAmount = baseSubtotal * (formData.additional_charges.overhead_rate / 100);
    const subtotalWithOverhead = baseSubtotal + overheadAmount;
    
    // Apply Profit
    const profitAmount = subtotalWithOverhead * (formData.additional_charges.profit_rate / 100);
    const subtotalWithProfit = subtotalWithOverhead + profitAmount;
    
    // Apply Discount
    const discountAmount = subtotalWithProfit * (formData.additional_charges.discount_rate / 100);
    const subtotalAfterDiscount = subtotalWithProfit - discountAmount;
    
    // Apply Tax (GST/VAT)
    const taxAmount = subtotalAfterDiscount * (formData.additional_charges.tax_rate / 100);
    
    const grandTotal = subtotalAfterDiscount + taxAmount;
    
    setFormData((prev: any) => ({ ...prev, total_amount: grandTotal }));
  }, [formData.items, formData.labor_processes, formData.tooling_material, formData.additional_charges]);

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (formData.$id) {
        // UPDATE EXISTING QUOTE
        await quotationService.updateQuotation(formData.$id, formData);
      } else {
        // CREATE NEW QUOTE
        await quotationService.createQuotation(formData);
      }
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/quotations");
      }, 3000);
    } catch (error) {
      console.error("Failed to save quotation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 7) {
      handleFinalSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };
  const prevStep = () => setCurrentStep(prev => prev - 1);

  if (isSuccess) {
    return (
      <Card className="p-20 text-center flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-700">
        <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-black dark:text-white">Quotation Generated!</h2>
        <p className="text-zinc-500 max-w-sm">The record has been saved to the database. Redirecting you to the dashboard...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
      {/* Professional Stepper (Progress Indicator) */}
      <Stepper 
        currentStep={currentStep} 
        steps={[
          { label: "General" },
          { label: "Materials" },
          { label: "Items (BOM)" },
          { label: "Operations" },
          { label: "Tooling" },
          { label: "Overhead" },
          { label: "Review" }
        ]}
      />

      <div className="transition-all duration-500 transform animate-in fade-in slide-in-from-bottom-4">
        {currentStep === 1 && (
          <GeneralInfoStep 
            formData={formData}
            onChange={handleGeneralInfoChange}
            onCustomerSelect={handleCustomerSelect}
          />
        )}

        {currentStep === 2 && (
          <MaterialsStep 
            selectedIds={formData.selected_material_ids}
            onChange={handleMaterialsChange}
          />
        )}

        {currentStep === 3 && (
          <BOMStep 
            selectedMaterialIds={formData.selected_material_ids}
            items={formData.items}
            onChange={handleItemsChange}
          />
        )}

        {currentStep === 4 && (
          <LaborStep 
            laborProcesses={formData.labor_processes}
            toolingMaterial={formData.tooling_material}
            techSpecs={formData.tech_specs}
            additionalCharges={formData.additional_charges}
            totalAmount={formData.total_amount}
            onChange={(field, value) => setFormData((prev: any) => ({ ...prev, [field]: value }))}
            mode="operations"
          />
        )}

        {currentStep === 5 && (
          <LaborStep 
            laborProcesses={formData.labor_processes}
            toolingMaterial={formData.tooling_material}
            techSpecs={formData.tech_specs}
            additionalCharges={formData.additional_charges}
            totalAmount={formData.total_amount}
            onChange={(field, value) => setFormData((prev: any) => ({ ...prev, [field]: value }))}
            mode="tooling"
          />
        )}

        {currentStep === 6 && (
          <LaborStep 
            laborProcesses={formData.labor_processes}
            toolingMaterial={formData.tooling_material}
            techSpecs={formData.tech_specs}
            additionalCharges={formData.additional_charges}
            totalAmount={formData.total_amount}
            onChange={(field, value) => setFormData((prev: any) => ({ ...prev, [field]: value }))}
            mode="overhead"
          />
        )}

        {currentStep === 7 && (
          <ReviewStep 
            formData={formData}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-8">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 1 || isSubmitting}
        >
          Previous
        </Button>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-zinc-400 hover:text-black">Save as Draft</Button>
          <Button 
            variant="primary" 
            onClick={nextStep} 
            isLoading={isSubmitting}
            disabled={
              (currentStep === 1 && (!formData.supplier_name || !formData.quotation_no)) ||
              (currentStep === 2 && formData.selected_material_ids.length === 0) ||
              (currentStep === 3 && formData.items.length === 0)
            }
          >
            {currentStep === 1 ? "Pick Materials" : 
             currentStep === 2 ? "Add Items (BOM)" : 
             currentStep === 3 ? "Process Breakdown" : 
             currentStep === 4 ? "Tooling & Tech" : 
             currentStep === 5 ? "Logistics & Margin" :
             currentStep === 6 ? "Review Summary" : "Generate Quote"} →
          </Button>
        </div>
      </div>
    </div>
  );
};
