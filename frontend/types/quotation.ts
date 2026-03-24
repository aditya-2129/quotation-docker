import { Models } from "appwrite";

/**
 * Quotation Interface
 * Represents a full quotation record.
 */
export interface Quotation extends Models.Document {
  // General Info - Client/Supplier
  supplier_name: string;
  issued_by: string;
  phone_number: string;
  email_address: string;
  
  // General Info - Part details
  part_number: string;
  part_description: string;
  design_change_level: string;
  mfg_location: string;
  
  // General Info - Shop details
  issue_date: string;
  tool_shop_name: string;
  tool_shop_location: string;
  currency: string;

  quotation_no: string;
  status: QuotationStatus;
  total_amount: number;
  items: QuotationItem[];
  selected_material_ids: string[];
  file_ids?: string[];
  customer_id?: string;
  
  // New Tooling & Labor Detail
  labor_processes: {
    name: string;
    cost_per_hr: number;
    hours: number;
    total: number;
  }[];
  
  tooling_material: {
    tool_components: number;
    pattern_casting: number;
    heat_treat: number;
    material_cost: number;
    finish_weight: number;
    other: number;
  };

  tech_specs: {
    blank_weight: number;
    die_size: string;
    stations: number;
    shut_height: number;
    num_fixtures: number;
    num_rotations: number;
    num_clamps: number;
  };

  additional_charges: {
    texture_coatings: number;
    transportation: number;
    overhead_rate: number;
    profit_rate: number;
    tax_rate: number;
    discount_rate: number;
  };
}

/**
 * Quotation Item (BOM Entry)
 * Represents a single part/line item in the quote.
 */
export interface QuotationItem {
  id: string;
  part_name: string;
  material_id: string;
  shape: string;
  dimensions: {
    length: number;
    width?: number;
    thickness?: number;
    diameter?: number;
  };
  calculated_weight: number;
  rate: number;
  quantity: number;
  allowance: number;
  total: number;
  labor_processes: {
    id: string;
    name: string;
    cost_per_hr: number;
    hours: number;
    total: number;
  }[];
  tooling_processes?: {
    id: string;
    name: string;
    cost: number;
    total: number;
    unit: string;
  }[];
  tooling_material?: {
    tool_components: number;
    pattern_casting: number;
    heat_treat: number;
    material_cost: number;
    finish_weight: number;
    other: number;
  };
  tech_specs?: {
    blank_weight: number;
    die_size: string;
    stations: number;
    shut_height: number;
    num_fixtures: number;
    num_rotations: number;
    num_clamps: number;
  };
}

export enum QuotationStatus {
  DRAFT = "draft",
  SENT = "sent",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}
