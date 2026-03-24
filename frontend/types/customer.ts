import { Models } from "appwrite";

/**
 * Customer Interface
 * Represents a client/customer record in the system.
 */
export interface Customer extends Models.Document {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  location: string;
  mfg_location?: string; // Preferred manufacturing site for this client
}
