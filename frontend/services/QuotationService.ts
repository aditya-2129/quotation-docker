import { appwriteService, AppwriteService } from "./AppwriteService";
import { DATABASE_ID, COLLECTIONS } from "@/constants/appwrite";
import { Quotation } from "@/types/quotation";
import { Models } from "appwrite";

/**
 * QuotationService
 * Specialized service for managing quotations.
 */
export class QuotationService {
  private static instance: QuotationService;
  private service: AppwriteService;

  private constructor() {
    this.service = appwriteService;
  }

  public static getInstance(): QuotationService {
    if (!QuotationService.instance) {
      QuotationService.instance = new QuotationService();
    }
    return QuotationService.instance;
  }

  /**
   * Create a new quotation record.
   */
  async createQuotation(data: Partial<Quotation>): Promise<Quotation> {
    const documentData = this.prepareDocumentData(data);
    return await this.service.createDocument<Quotation>(
      DATABASE_ID,
      COLLECTIONS.QUOTATIONS,
      documentData
    );
  }

  /**
   * Update an existing quotation.
   */
  async updateQuotation(id: string, data: Partial<Quotation>): Promise<Quotation> {
    const documentData = this.prepareDocumentData(data);
    return await this.service.updateDocument<Quotation>(
      DATABASE_ID,
      COLLECTIONS.QUOTATIONS,
      id,
      documentData
    );
  }

  /**
   * Internal helper to prepare data for storage (JSON serialization etc)
   */
  private prepareDocumentData(data: any): any {
    const detailedData = {
      labor_processes: data.labor_processes || [],
      tooling_material: data.tooling_material || {},
      tech_specs: data.tech_specs || {},
      additional_charges: data.additional_charges || {},
    };

    const documentData = { ...data };
    documentData.items = JSON.stringify(data.items || []);
    documentData.detailed_breakdown = JSON.stringify(detailedData);

    // Clean up virtual fields from the root
    delete documentData.labor_processes;
    delete documentData.tooling_material;
    delete documentData.tech_specs;
    delete documentData.additional_charges;

    // Clean up models metadata for updates
    delete documentData.$id;
    delete documentData.$createdAt;
    delete documentData.$updatedAt;
    delete documentData.$permissions;
    delete documentData.$databaseId;
    delete documentData.$collectionId;

    return documentData;
  }

  /**
   * Get all quotations.
   */
  async getAllQuotations(): Promise<Quotation[]> {
    const response = await this.service.listDocuments<Quotation>(
      DATABASE_ID,
      COLLECTIONS.QUOTATIONS
    );
    
    return response.documents.map(this.mapDocumentToQuotation);
  }

  /**
   * Get a single quotation by ID.
   */
  async getQuotationById(id: string): Promise<Quotation> {
    const doc = await this.service.getDocument<Quotation>(
      DATABASE_ID,
      COLLECTIONS.QUOTATIONS,
      id
    );
    
    return this.mapDocumentToQuotation(doc);
  }

  /**
   * Helper to parse JSON fields back into the Quotation object.
   */
  private mapDocumentToQuotation(doc: any): Quotation {
    const breakdown = typeof doc.detailed_breakdown === 'string' 
      ? JSON.parse(doc.detailed_breakdown) 
      : (doc.detailed_breakdown || {});

    return {
      ...doc,
      items: typeof doc.items === 'string' ? JSON.parse(doc.items) : (doc.items || []),
      labor_processes: breakdown.labor_processes || [],
      tooling_material: breakdown.tooling_material || {},
      tech_specs: breakdown.tech_specs || {},
      additional_charges: breakdown.additional_charges || {},
    };
  }
}

export const quotationService = QuotationService.getInstance();
