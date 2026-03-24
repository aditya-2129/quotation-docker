import { appwriteService, AppwriteService } from "./AppwriteService";
import { DATABASE_ID, COLLECTIONS } from "@/constants/appwrite";
import { ToolingRate } from "@/types/labor";

/**
 * ToolingRateService
 * Handles all database operations related to tooling material and process rates.
 */
export class ToolingRateService {
  private service: AppwriteService;

  constructor() {
    this.service = appwriteService;
  }

  /**
   * Create a new tooling rate entry.
   */
  async createToolingRate(data: Partial<ToolingRate>): Promise<ToolingRate> {
    return await this.service.createDocument<ToolingRate>(
      DATABASE_ID,
      COLLECTIONS.TOOLING_RATES,
      data
    );
  }

  /**
   * Get all tooling rates.
   */
  async getAllToolingRates(): Promise<ToolingRate[]> {
    const response = await this.service.listDocuments<ToolingRate>(
      DATABASE_ID,
      COLLECTIONS.TOOLING_RATES
    );
    return response.documents;
  }

  /**
   * Update a tooling rate.
   */
  async updateToolingRate(id: string, data: Partial<ToolingRate>): Promise<ToolingRate> {
    return await this.service.updateDocument<ToolingRate>(
      DATABASE_ID,
      COLLECTIONS.TOOLING_RATES,
      id,
      data
    );
  }

  /**
   * Delete a tooling rate.
   */
  async deleteToolingRate(id: string): Promise<{}> {
    return await this.service.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.TOOLING_RATES,
      id
    );
  }
}

export const toolingRateService = new ToolingRateService();
