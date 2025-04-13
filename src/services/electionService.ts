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
const API_URL = import.meta.env.VITE_RENDER_API_URL || 'http://localhost:3001';

console.log("Environment API URL:", import.meta.env.VITE_RENDER_API_URL);
console.log("Using base API URL:", API_URL);

// Make sure API_URL is properly formatted for API calls
const getApiBaseUrl = () => {
  // Remove trailing slash if present
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  
  // Check if the URL already includes /api somewhere in the path
  if (baseUrl.includes('/api')) {
    // If URL already has /api in it, don't add it again
    // This handles cases like example.com/api or api.example.com
    console.log("URL already contains /api path, using as is:", baseUrl);
    return baseUrl;
  } else {
    // Add /api if not already present in the path
    const url = `${baseUrl}/api`;
    console.log("Added /api to base URL:", url);
    return url;
  }
};

// Check if API is accessible
// Log the URL being accessed
window.setTimeout(() => {
  try {
    const testUrl = `${getApiBaseUrl()}/health`;
    console.log("Checking API health at:", testUrl);
    fetch(testUrl)
      .then(response => {
        console.log("API health check response:", response.status, response.statusText);
        if (!response.ok) {
          console.error("API health check failed: API might be down or misconfigured");
        } else {
          console.log("API health check successful");
        }
      })
      .catch(err => {
        console.error("API health check error:", err);
      });
  } catch (error) {
    console.error("Error during API health check setup:", error);
  }
}, 1000);

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
    
    // Special handling for 404 errors
    if (response.status === 404) {
      console.warn(`Endpoint not found: ${url}`);
      
      // Try alternative endpoints for common patterns
      if (endpoint.includes('/university/')) {
        console.log('University-specific endpoint not found, falling back to all candidates');
        
        // If trying to get candidates by university, fallback to getting all candidates
        const fallbackUrl = `${baseUrl}/candidates`;
        console.log(`Trying fallback URL: ${fallbackUrl}`);
        
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          console.log('Fallback successful, filtering data client-side');
          return data;
        }
      }
      
      throw new Error(`Resource not found: ${endpoint}`);
    }
    
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
  
  // Get candidates by university
  getCandidatesByUniversity: async (university: string): Promise<Candidate[]> => {
    console.log(`Getting candidates for ${university} using client-side filtering`);
    
    try {
      // Instead of requesting a non-existent endpoint, fetch all candidates
      // and filter them on the client side
      const allCandidates = await apiCall('/candidates');
      console.log(`Fetched ${allCandidates.length} total candidates`);
      
      // Filter by university name
      const filteredCandidates = allCandidates.filter(
        candidate => candidate.university === university
      );
      
      console.log(`Found ${filteredCandidates.length} candidates for ${university}`);
      return filteredCandidates;
    } catch (error) {
      console.error(`Error fetching candidates for ${university}:`, error);
      
      // Fallback to election data if candidates endpoint fails
      try {
        console.log("Falling back to election data endpoint");
        const electionData = await apiCall('/election');
        
        if (electionData && electionData.candidates) {
          const filteredCandidates = electionData.candidates.filter(
            (candidate: Candidate) => candidate.university === university
          );
          
          console.log(`Found ${filteredCandidates.length} candidates from election data`);
          return filteredCandidates;
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
      
      // If all attempts fail, rethrow the original error
      throw error;
    }
  },
  
  // Add a candidate
  addCandidate: async (candidate: Omit<Candidate, 'id'>): Promise<Candidate> => {
    console.log("Adding candidate:", candidate);
    
    try {
      // Validate candidate data before sending
      if (!candidate.name || !candidate.university || !candidate.position) {
        const error = new Error("Candidate data is incomplete. Name, university, and position are required.");
        console.error("Validation error:", error);
        toast.error(error.message);
        throw error;
      }
      
      // Make a direct fetch instead of using apiCall for more control
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/candidates`;
      console.log("POST request to:", url);
      console.log("With payload:", candidate);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Longer timeout for adding
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidate),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log("Add candidate response status:", response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Failed to add candidate: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error("Error response data:", errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error("Could not parse error response", e);
          try {
            const text = await response.text();
            console.error("Error response text:", text);
            errorMessage = `${errorMessage} - ${text}`;
          } catch (e2) {
            console.error("Could not get error text", e2);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Add candidate success:", data);
      return data;
    } catch (error: any) {
      // Check for network errors
      if (error.name === 'AbortError') {
        console.error("Add candidate timeout");
        toast.error("Request timed out when adding candidate");
        throw new Error("Request timed out when adding candidate");
      }
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error("Network error when adding candidate:", error);
        toast.error("Network error: Could not connect to server");
        throw new Error("Network error: Could not connect to server");
      }
      
      console.error("Error adding candidate:", error);
      toast.error(error.message || "Failed to add candidate");
      throw error;
    }
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
  castVote: async (candidateId: string) => {
    console.log(`Casting vote for candidate: ${candidateId}`);
    
    try {
      const response = await apiCall('/vote', {
        method: 'POST',
        body: JSON.stringify({ candidateId }),
      });
      
      console.log('Vote cast successfully, server response:', response);
      
      // Return the vote data if it's included in the response
      if (response && response.votes) {
        return {
          success: true,
          candidateId,
          votes: response.votes,
          stats: response.stats
        };
      }
      
      return { success: true, candidateId };
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  },
}; 