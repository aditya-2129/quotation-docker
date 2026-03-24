import { Models } from "appwrite";

/**
 * LaborRate Interface
 * Represents a standard manufacturing process and its hourly cost.
 */
export interface LaborRate extends Models.Document {
  process_name: string;
  hourly_rate: number;
  currency: string;
}

/**
 * ToolingRate Interface
 * Represents standard rates for tooling materials and processes.
 */
export interface ToolingRate extends Models.Document {
  item_name: string;
  rate: number;
  unit: "per_kg" | "fixed";
  currency: string;
}
