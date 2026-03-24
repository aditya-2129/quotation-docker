import { appwriteService, AppwriteService } from "./AppwriteService";
import { DATABASE_ID, COLLECTIONS } from "@/constants/appwrite";
import { Material } from "@/types/material";
import { Models } from "appwrite";
import { Query } from "@/lib/appwrite";

/**
 * MaterialsService
 * Specialized service for managing the Materials Library.
 */
export class MaterialsService {
  private static instance: MaterialsService;
  private service: AppwriteService;

  private constructor() {
    this.service = appwriteService;
  }

  public static getInstance(): MaterialsService {
    if (!MaterialsService.instance) {
      MaterialsService.instance = new MaterialsService();
    }
    return MaterialsService.instance;
  }

  /**
   * Get a paginated list of materials.
   */
  async getMaterialsPage(page: number = 1, limit: number = 25): Promise<Models.DocumentList<Material>> {
    const offset = (page - 1) * limit;
    return await this.service.listDocuments<Material>(
      DATABASE_ID,
      COLLECTIONS.MATERIALS,
      [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderAsc("name"),
      ]
    );
  }

  /**
   * Add a new material to the library.
   */
  async createMaterial(data: Omit<Material, keyof Models.Document>): Promise<Material> {
    return await this.service.createDocument<Material>(
      DATABASE_ID,
      COLLECTIONS.MATERIALS,
      data
    );
  }

  /**
   * Update an existing material's details.
   */
  async updateMaterial(id: string, data: Partial<Omit<Material, keyof Models.Document>>): Promise<Material> {
    return await this.service.updateDocument<Material>(
      DATABASE_ID,
      COLLECTIONS.MATERIALS,
      id,
      data
    );
  }

  /**
   * Remove a material from the library.
   */
  async deleteMaterial(id: string): Promise<{}> {
    return await this.service.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.MATERIALS,
      id
    );
  }
}

export const materialsService = MaterialsService.getInstance();
