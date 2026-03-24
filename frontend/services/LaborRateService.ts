import { appwriteService, AppwriteService } from "./AppwriteService";
import { DATABASE_ID, COLLECTIONS } from "@/constants/appwrite";
import { LaborRate } from "@/types/labor";

/**
 * LaborRateService
 * Handles all database operations related to manufacturing process hourly rates.
 */
export class LaborRateService {
  private service: AppwriteService;

  constructor() {
    this.service = appwriteService;
  }

  /**
   * Create a new labor rate entry.
   */
  async createLaborRate(data: Partial<LaborRate>): Promise<LaborRate> {
    return await this.service.createDocument<LaborRate>(
      DATABASE_ID,
      COLLECTIONS.LABOR_RATES,
      data
    );
  }

  /**
   * Get all labor rates.
   */
  async getAllLaborRates(): Promise<LaborRate[]> {
    const response = await this.service.listDocuments<LaborRate>(
      DATABASE_ID,
      COLLECTIONS.LABOR_RATES
    );
    return response.documents;
  }

  /**
   * Update a labor rate.
   */
  async updateLaborRate(id: string, data: Partial<LaborRate>): Promise<LaborRate> {
    return await this.service.updateDocument<LaborRate>(
      DATABASE_ID,
      COLLECTIONS.LABOR_RATES,
      id,
      data
    );
  }

  /**
   * Delete a labor rate.
   */
  async deleteLaborRate(id: string): Promise<{}> {
    return await this.service.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.LABOR_RATES,
      id
    );
  }
}

export const laborRateService = new LaborRateService();
