// API service for communicating with the FastAPI backend

export type W9ExtractedData = {
  entity_type: string;
  name: string;
  business_name: string;
  ein: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  user_signed: string;
  signed_date: string;
};

export type ExtractionResult = {
  filename: string;
  data: W9ExtractedData;
  success: boolean;
};

export type ApiResponse = {
  results: ExtractionResult[];
  success: boolean;
  message: string;
};

class ApiService {
  private baseUrl: string;

  constructor() {
    // This will work whether running on localhost or deployed
    this.baseUrl = window.location.origin;
  }

  // Check if the API is running
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('API Health Check:', data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Extract data from W9 PDF files
  async extractW9Data(files: File[]): Promise<ApiResponse> {
    if (!files || files.length === 0) {
      throw new Error('No files provided for extraction');
    }

    // Create FormData to send files
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/extract`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it for multipart/form-data
      });

      if (!response.ok) {
        // Try to get error details from the response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // If we can't parse JSON, use the basic error message
        }
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();
      console.log('Extraction completed:', data);
      return data;

    } catch (error) {
      console.error('Extraction failed:', error);
      
      // Re-throw with a user-friendly message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred during extraction');
      }
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();

// Helper function to check if extraction data is valid
export function isValidExtractionData(data: any): data is W9ExtractedData {
  return (
    data &&
    typeof data === 'object' &&
    'entity_type' in data &&
    'name' in data &&
    'ein' in data
  );
}

// Helper function to format extracted data for display
export function formatExtractionResult(result: ExtractionResult): string {
  if (!result.success || !isValidExtractionData(result.data)) {
    return JSON.stringify({ error: 'Extraction failed or invalid data' }, null, 2);
  }

  return JSON.stringify(result.data, null, 2);
}