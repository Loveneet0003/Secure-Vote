const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Initial mock data (will be replaced with database data)
let electionData = {
  candidates: [
    { id: '1', name: 'John Doe', university: 'MIT', position: 'President', bio: 'Student leader with 3 years experience' },
    { id: '2', name: 'Jane Smith', university: 'Stanford', position: 'Vice President', bio: 'Honor student and community advocate' }
  ],
  settings: {
    name: 'University Student Council Elections 2025',
    organization: 'National University Association',
    startDate: '2025-04-05T08:00',
    endDate: '2025-04-07T18:00'
  },
  votes: {
    '1': 156,
    '2': 142
  },
  stats: {
    totalVoters: 2548,
    votesCast: 298,
    turnoutPercentage: 11.7,
    lastUpdated: new Date()
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Get all election data
app.get('/api/election', (req, res) => {
  res.json(electionData);
});

// Get candidates
app.get('/api/candidates', (req, res) => {
  res.json(electionData.candidates);
});

// Add a candidate
app.post('/api/candidates', (req, res) => {
  const candidate = req.body;
  const id = Date.now().toString();
  const newCandidate = { id, ...candidate };
  
  electionData.candidates.push(newCandidate);
  electionData.votes[id] = 0; // Initialize vote count
  
  res.status(201).json(newCandidate);
});

// Update a candidate
app.put('/api/candidates/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const index = electionData.candidates.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  electionData.candidates[index] = { ...electionData.candidates[index], ...updates };
  res.json(electionData.candidates[index]);
});

// Delete a candidate
app.delete('/api/candidates/:id', (req, res) => {
  const { id } = req.params;
  
  const index = electionData.candidates.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  electionData.candidates.splice(index, 1);
  delete electionData.votes[id];
  
  res.status(204).send();
});

// Update election settings
app.put('/api/settings', (req, res) => {
  const settings = req.body;
  electionData.settings = { ...electionData.settings, ...settings };
  res.json(electionData.settings);
});

// Cast a vote (for demonstration)
app.post('/api/vote', (req, res) => {
  const { candidateId } = req.body;
  
  if (!electionData.votes[candidateId]) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  // Increment vote
  electionData.votes[candidateId]++;
  electionData.stats.votesCast++;
  electionData.stats.turnoutPercentage = parseFloat(((electionData.stats.votesCast / electionData.stats.totalVoters) * 100).toFixed(1));
  electionData.stats.lastUpdated = new Date();
  
  res.json({ success: true });
});

// Get vote statistics
app.get('/api/stats', (req, res) => {
  res.json(electionData.stats);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing 