import { appwriteService, AppwriteService } from "./AppwriteService";
import { DATABASE_ID, COLLECTIONS } from "@/constants/appwrite";
import { Customer } from "@/types/customer";

/**
 * CustomerService
 * Handles all database operations related to Customers.
 */
export class CustomerService {
  private service: AppwriteService;

  constructor() {
    this.service = appwriteService;
  }

  /**
   * Create a new customer.
   */
  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return await this.service.createDocument<Customer>(
      DATABASE_ID,
      COLLECTIONS.CUSTOMERS,
      data
    );
  }

  /**
   * Get all customers.
   */
  async getAllCustomers(): Promise<Customer[]> {
    const response = await this.service.listDocuments<Customer>(
      DATABASE_ID,
      COLLECTIONS.CUSTOMERS
    );
    return response.documents;
  }

  /**
   * Get a single customer by ID.
   */
  async getCustomerById(id: string): Promise<Customer> {
    return await this.service.getDocument<Customer>(
      DATABASE_ID,
      COLLECTIONS.CUSTOMERS,
      id
    );
  }

  /**
   * Update a customer.
   */
  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return await this.service.updateDocument<Customer>(
      DATABASE_ID,
      COLLECTIONS.CUSTOMERS,
      id,
      data
    );
  }

  /**
   * Delete a customer.
   */
  async deleteCustomer(id: string): Promise<{}> {
    return await this.service.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.CUSTOMERS,
      id
    );
  }
}

export const customerService = new CustomerService();
