import { client, account, databases, storage } from "@/lib/appwrite";
import { BaseService } from "./BaseService";
import { Models, ID } from "appwrite";

/**
 * AppwriteService
 * Service class for interacting with Appwrite backend.
 */
export class AppwriteService extends BaseService {
  private static instance: AppwriteService;

  private constructor() {
    super();
  }

  /**
   * Singleton pattern to ensure one instance of the service.
   */
  public static getInstance(): AppwriteService {
    if (!AppwriteService.instance) {
      AppwriteService.instance = new AppwriteService();
    }
    return AppwriteService.instance;
  }

  // --- Auth Methods ---

  /**
   * Get current logged-in user account.
   */
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await account.get();
    } catch (error: any) {
      // If 401, user is not logged in, return null instead of throwing
      if (error.code === 401) return null;
      return this.handleError(error);
    }
  }

  // --- Database Methods ---

  /**
   * List documents from a collection.
   */
  async listDocuments<T extends Models.Document>(databaseId: string, collectionId: string, queries: string[] = []): Promise<Models.DocumentList<T>> {
    try {
      return await databases.listDocuments<T>(databaseId, collectionId, queries);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Create a document in a collection.
   */
  async createDocument<T extends Models.Document>(databaseId: string, collectionId: string, data: any, documentId: string = "unique()"): Promise<T> {
    try {
      return await databases.createDocument<T>(databaseId, collectionId, documentId, data);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Update a document in a collection.
   */
  async updateDocument<T extends Models.Document>(databaseId: string, collectionId: string, documentId: string, data: any): Promise<T> {
    try {
      return await databases.updateDocument<T>(databaseId, collectionId, documentId, data);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get a single document from a collection.
   */
  async getDocument<T extends Models.Document>(databaseId: string, collectionId: string, documentId: string): Promise<T> {
    try {
      return await databases.getDocument<T>(databaseId, collectionId, documentId);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a document from a collection.
   */
  async deleteDocument(databaseId: string, collectionId: string, documentId: string): Promise<{}> {
    try {
      return await databases.deleteDocument(databaseId, collectionId, documentId);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // --- Storage (Bucket) Methods ---

  /**
   * Upload a file to a bucket.
   */
  async uploadFile(bucketId: string, file: File, fileId: string = ID.unique()): Promise<Models.File> {
    try {
      return await storage.createFile(bucketId, fileId, file);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a file from a bucket.
   */
  async deleteFile(bucketId: string, fileId: string): Promise<{}> {
    try {
      return await storage.deleteFile(bucketId, fileId);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get file preview URL.
   */
  getFilePreview(bucketId: string, fileId: string): string {
    return storage.getFilePreview(bucketId, fileId).toString();
  }

  /**
   * Get file view URL (for PDFs etc).
   */
  getFileView(bucketId: string, fileId: string): string {
    return storage.getFileView(bucketId, fileId).toString();
  }

  /**
   * Get actual file download URL.
   */
  getFileDownload(bucketId: string, fileId: string): string {
    return storage.getFileDownload(bucketId, fileId).toString();
  }

  /**
   * Get file metadata.
   */
  async getFileMetadata(bucketId: string, fileId: string): Promise<Models.File> {
    try {
      return await storage.getFile(bucketId, fileId);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}

export const appwriteService = AppwriteService.getInstance();
