import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for vote tracking
export const voteService = {
  // Get total registered voters
  getTotalVoters: async () => {
    const { data, error } = await supabase
      .from('voters')
      .select('count', { count: 'exact' });
    
    if (error) throw error;
    return data.count || 0;
  },
  
  // Get vote counts for all candidates
  getVoteCounts: async () => {
    const { data, error } = await supabase
      .from('votes')
      .select('candidate_id, count')
      .order('count', { ascending: false });
    
    if (error) throw error;
    
    // Transform to a record of id -> count
    const counts: Record<string, number> = {};
    data.forEach(item => {
      counts[item.candidate_id] = item.count;
    });
    
    return counts;
  },
  
  // Get total votes cast
  getTotalVotes: async () => {
    const { data, error } = await supabase
      .from('votes')
      .select('count');
    
    if (error) throw error;
    
    let total = 0;
    data.forEach(item => {
      total += item.count;
    });
    
    return total;
  },
  
  // Get or create election settings
  getElectionSettings: async () => {
    // Try to get existing settings
    const { data, error } = await supabase
      .from('election_settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  },
  
  // Save election settings
  saveElectionSettings: async (settings: any) => {
    const { data, error } = await supabase
      .from('election_settings')
      .upsert(settings)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Get candidates
  getCandidates: async () => {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data;
  },
  
  // Add candidate
  addCandidate: async (candidate: any) => {
    const { data, error } = await supabase
      .from('candidates')
      .insert(candidate)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Update candidate
  updateCandidate: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Delete candidate
  deleteCandidate: async (id: string) => {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}; 