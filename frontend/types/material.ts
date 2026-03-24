import { Models } from "appwrite";

/**
 * Material Document Type
 * Represents a record in the Materials Library collection.
 */
export interface Material extends Models.Document {
  name: string;
  grade?: string;
  density: number;
  base_rate: number;
  shape: MaterialShape;
}

/**
 * Material Shape Enum
 * Supported shapes for raw materials.
 */
export enum MaterialShape {
  ROUND_BAR = "round_bar",
  SQUARE_BAR = "square_bar",
  RECTANGULAR_BAR = "rectangular_bar",
  PLATE_SHEET = "plate_sheet",
  HOLLOW_TUBE = "hollow_tube",
  HEX_BAR = "hex_bar",
  FORGED_BLOCK = "forged_block",
  CASTING = "casting",
  EXTRUDED_SECTION = "extruded_section",
}
