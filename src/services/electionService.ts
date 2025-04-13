import { toast } from "sonner";

// Types
export interface Candidate {
  id: string;
  name: string;
  university: string;
  position: string;
  bio: string;
}

export interface ElectionSettings {
  name: string;
  organization: string;
  startDate: string;
  endDate: string;
}

export interface VoteStatistics {
  totalVoters: number;
  votesCast: number;
  turnoutPercentage: number;
  lastUpdated: Date;
}

// Replace with your actual Render deployment URL
const API_URL = import.meta.env.VITE_RENDER_API_URL || 'http://localhost:3001/api';

// Make sure API_URL ends with /api
const getApiBaseUrl = () => {
  const url = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
  console.log("Using API base URL:", url);
  return url;
};

// Helper function for API calls
const apiCall = async (endpoint: string, options = {}) => {
  const baseUrl = getApiBaseUrl();
  // Make sure endpoint starts with / if needed
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;
  
  console.log(`Making API call to ${url}`, options);
  
  try {
    // Add a timeout to the fetch to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Add some extra debugging data
    console.log('Current page URL:', window.location.href);
    console.log('VITE_RENDER_API_URL env value:', import.meta.env.VITE_RENDER_API_URL);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    console.log(`Response status:`, response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        // If response is not JSON, try to get text
        try {
          const textResponse = await response.text();
          if (textResponse) {
            console.error('Error text response:', textResponse);
            errorMessage = `${errorMessage} - ${textResponse}`;
          }
        } catch (textError) {
          console.error('Could not get error text:', textError);
        }
      }
      
      console.error(`API Error (${endpoint}):`, errorMessage);
      throw new Error(errorMessage);
    }
    
    if (response.status === 204) {
      return null;
    }
    
    const data = await response.json();
    console.log(`API response from ${endpoint}:`, data);
    return data;
  } catch (error: any) {
    // Check if it's an abort error (timeout)
    if (error.name === 'AbortError') {
      const timeoutMsg = 'Request timed out. The server may be down or slow to respond.';
      console.error(`API Timeout (${endpoint}):`, timeoutMsg);
      toast.error(timeoutMsg);
      throw new Error(timeoutMsg);
    }
    
    console.error(`API Error (${endpoint}):`, error);
    toast.error(error.message || 'Server error. Please try again.');
    throw error;
  }
};

// Election service
export const electionService = {
  // Test API connection
  testConnection: async () => {
    try {
      console.log("Testing API connection...");
      const baseUrl = getApiBaseUrl();
      const healthEndpoint = baseUrl.endsWith('/api') ? `${baseUrl}/health` : `${baseUrl}/api/health`;
      
      console.log(`Trying health check at: ${healthEndpoint}`);
      
      // Try with no timeout first
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Connection test successful:", data);
        toast.success("API connection successful!");
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.error("Connection test failed:", response.status, errorText);
        toast.error(`API connection failed: ${response.status} ${response.statusText}`);
        return { success: false, error: `${response.status} ${response.statusText}` };
      }
    } catch (error) {
      console.error("Connection test error:", error);
      toast.error(`API connection error: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  // Get all election data in one call
  getElectionData: async () => {
    return apiCall('/election');
  },
  
  // Get candidates
  getCandidates: async (): Promise<Candidate[]> => {
    return apiCall('/candidates');
  },
  
  // Add a candidate
  addCandidate: async (candidate: Omit<Candidate, 'id'>): Promise<Candidate> => {
    return apiCall('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidate),
    });
  },
  
  // Update a candidate
  updateCandidate: async (id: string, updates: Partial<Candidate>): Promise<Candidate> => {
    return apiCall(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  // Delete a candidate
  deleteCandidate: async (id: string): Promise<void> => {
    return apiCall(`/candidates/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Update election settings
  updateSettings: async (settings: ElectionSettings): Promise<ElectionSettings> => {
    return apiCall('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
  
  // Get vote statistics
  getVoteStatistics: async (): Promise<VoteStatistics> => {
    const data = await apiCall('/stats');
    return {
      ...data,
      lastUpdated: new Date(data.lastUpdated)
    };
  },
  
  // Cast a vote (for demo purposes)
  castVote: async (candidateId: string): Promise<void> => {
    return apiCall('/vote', {
      method: 'POST',
      body: JSON.stringify({ candidateId }),
    });
  },
}; 