/**
 * BaseService
 * Abstract base class for all application services.
 * Provides a foundation for data fetching and error handling.
 */
export abstract class BaseService {
  protected handleError(error: any): never {
    // Centralized error handling logic
    console.error(`[Service Error]:`, error);
    throw error;
  }

  // Common utility methods for services can be added here
}
