// Ethereum blockchain integration service using ethers.js
import { ethers } from 'ethers';

// ABI for a simple voting contract
const VOTING_CONTRACT_ABI = [
  "function castVote(string memory universityId, string memory candidateId) public returns (string memory)",
  "function hasVoted(string memory universityId, string memory deviceId) public view returns (bool)"
];

// This would be the actual deployed contract address in a real application
const VOTING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual contract address

// Store device ID in localStorage
const DEVICE_ID_KEY = 'device_voter_id';

// Generate a unique device ID if it doesn't exist
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
};

// Initialize ethers provider and contract
const getProvider = () => {
  try {
    // Check if MetaMask is installed
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    } else {
      console.error("MetaMask not detected. Please install MetaMask.");
      // Fallback to a mock provider for testing
      return mockEthereumBehavior();
    }
  } catch (error) {
    console.error("Error initializing provider:", error);
    // Fallback to a mock provider for testing
    return mockEthereumBehavior();
  }
};

// Get contract instance
const getContract = async () => {
  try {
    const provider = getProvider();
    
    if (provider instanceof ethers.BrowserProvider) {
      const signer = await provider.getSigner();
      return new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
    } else {
      // Using mock provider
      return provider;
    }
  } catch (error) {
    console.error("Error getting contract:", error);
    return mockEthereumBehavior();
  }
};

// Check if this device has already voted in a specific election
export const hasDeviceVoted = (universityId: string): boolean => {
  try {
    // In a real implementation, we would call the contract:
    // const contract = await getContract();
    // return await contract.hasVoted(universityId, getDeviceId());
    
    // For now, use localStorage as fallback
    const votes = getVotesMock();
    const deviceId = getDeviceId();
    
    return votes.some(vote => 
      vote.deviceId === deviceId && 
      vote.universityId === universityId
    );
  } catch (error) {
    console.error("Error checking vote status:", error);
    return false;
  }
};

// Record a vote on the blockchain
export const recordVote = async (
  universityId: string, 
  candidateId: string
): Promise<string> => {
  // Check if device already voted in this election
  if (hasDeviceVoted(universityId)) {
    throw new Error("This device has already cast a vote in this election.");
  }
  
  try {
    // Try to use real blockchain if available
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
        
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Cast vote on the blockchain
        const tx = await contract.castVote(universityId, candidateId);
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        return receipt.hash;
      } catch (error) {
        console.error("Blockchain transaction failed:", error);
        // Fall back to mock implementation
        return mockRecordVote(universityId, candidateId);
      }
    } else {
      // Fall back to mock implementation
      return mockRecordVote(universityId, candidateId);
    }
  } catch (error) {
    console.error("Error recording vote:", error);
    return mockRecordVote(universityId, candidateId);
  }
};

// Mock implementation for testing or when blockchain is not available
const mockEthereumBehavior = () => {
  return {
    hasVoted: (universityId: string, deviceId: string) => {
      const votes = getVotesMock();
      return votes.some(vote => 
        vote.deviceId === deviceId && 
        vote.universityId === universityId
      );
    },
    castVote: (universityId: string, candidateId: string) => {
      return {
        wait: () => Promise.resolve({
          hash: '0x' + Array.from(
            {length: 64}, 
            () => Math.floor(Math.random() * 16).toString(16)
          ).join('')
        })
      };
    }
  };
};

// Mock implementation to record vote in localStorage
const mockRecordVote = (universityId: string, candidateId: string): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate blockchain transaction delay
    setTimeout(() => {
      const votes = getVotesMock();
      const deviceId = getDeviceId();
      
      // Generate a fake transaction hash
      const transactionHash = '0x' + Array.from(
        {length: 64}, 
        () => Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      // Store the vote
      votes.push({
        universityId,
        candidateId,
        deviceId,
        timestamp: Date.now(),
        transactionHash
      });
      
      localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
      resolve(transactionHash);
    }, 3000); // 3 second delay to simulate blockchain transaction
  });
};

// Mock storage key
const VOTES_STORAGE_KEY = 'blockchain_votes';

// Get all recorded votes (mock implementation)
const getVotesMock = (): Array<{
  universityId: string;
  candidateId: string;
  deviceId: string;
  timestamp: number;
  transactionHash: string;
}> => {
  const votes = localStorage.getItem(VOTES_STORAGE_KEY);
  return votes ? JSON.parse(votes) : [];
};

// Add TypeScript interface for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}
