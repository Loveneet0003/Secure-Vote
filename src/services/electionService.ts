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

// Helper function for API calls
const apiCall = async (endpoint: string, options = {}) => {
  try {
    console.log(`Making API call to ${API_URL}${endpoint}`, options);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
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
    console.error(`API Error (${endpoint}):`, error);
    toast.error(error.message || 'Server error. Please try again.');
    throw error;
  }
};

// Election service
export const electionService = {
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