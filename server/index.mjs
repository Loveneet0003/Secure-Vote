// ESM compatible wrapper for server
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-vote';
let db;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db();
    
    // Create initial collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('candidates')) {
      await db.createCollection('candidates');
    }
    
    if (!collectionNames.includes('votes')) {
      await db.createCollection('votes');
    }
    
    if (!collectionNames.includes('settings')) {
      await db.createCollection('settings');
      // Add default settings
      const settingsExist = await db.collection('settings').findOne({});
      if (!settingsExist) {
        await db.collection('settings').insertOne({
          name: 'University Student Council Elections 2025',
          organization: 'National University Association',
          startDate: '2025-04-05T08:00',
          endDate: '2025-04-07T18:00'
        });
      }
    }

    if (!collectionNames.includes('voters')) {
      await db.createCollection('voters');
      // Add total voter count for statistics
      const voterStatsExist = await db.collection('voters').findOne({ _id: 'stats' });
      if (!voterStatsExist) {
        await db.collection('voters').insertOne({
          _id: 'stats',
          totalRegistered: 2548
        });
      }
    }
    
    // Add default candidates if none exist
    const candidatesExist = await db.collection('candidates').findOne({});
    if (!candidatesExist) {
      await db.collection('candidates').insertMany([
        { 
          name: 'John Doe', 
          university: 'MIT', 
          position: 'President', 
          bio: 'Student leader with 3 years experience' 
        },
        { 
          name: 'Jane Smith', 
          university: 'Stanford', 
          position: 'Vice President', 
          bio: 'Honor student and community advocate' 
        }
      ]);
    }
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  if (!db) {
    return res.status(500).json({ status: 'ERROR', message: 'Database not connected' });
  }
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Get all election data
app.get('/api/election', async (req, res) => {
  try {
    const candidates = await db.collection('candidates').find({}).toArray();
    const settings = await db.collection('settings').findOne({});
    
    // Get votes for each candidate
    const votes = {};
    for (const candidate of candidates) {
      const vote = await db.collection('votes').findOne({ candidateId: candidate._id.toString() });
      votes[candidate._id.toString()] = vote ? vote.count : 0;
    }
    
    // Get vote statistics
    const voterStats = await db.collection('voters').findOne({ _id: 'stats' });
    const totalVoters = voterStats ? voterStats.totalRegistered : 0;
    
    const totalVotesCast = Object.values(votes).reduce((sum, count) => sum + count, 0);
    const turnoutPercentage = totalVoters > 0 
      ? parseFloat(((totalVotesCast / totalVoters) * 100).toFixed(1)) 
      : 0;
    
    // Transform MongoDB _id to id for client
    const transformedCandidates = candidates.map(c => ({
      id: c._id.toString(),
      name: c.name,
      university: c.university,
      position: c.position,
      bio: c.bio
    }));
    
    res.json({
      candidates: transformedCandidates,
      settings: settings || {},
      votes,
      stats: {
        totalVoters,
        votesCast: totalVotesCast,
        turnoutPercentage,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching election data:', error);
    res.status(500).json({ error: 'Failed to fetch election data' });
  }
});

// Get candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await db.collection('candidates').find({}).toArray();
    // Transform MongoDB _id to id for client
    const transformedCandidates = candidates.map(c => ({
      id: c._id.toString(),
      name: c.name,
      university: c.university,
      position: c.position,
      bio: c.bio
    }));
    res.json(transformedCandidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Add a candidate
app.post('/api/candidates', async (req, res) => {
  try {
    const candidate = req.body;
    const result = await db.collection('candidates').insertOne(candidate);
    
    const candidateId = result.insertedId.toString();
    
    // Initialize vote count for the new candidate
    await db.collection('votes').insertOne({
      candidateId,
      count: 0
    });
    
    // Return the created candidate with id
    res.status(201).json({
      id: candidateId,
      ...candidate
    });
  } catch (error) {
    console.error('Error adding candidate:', error);
    res.status(500).json({ error: 'Failed to add candidate' });
  }
});

// Update a candidate
app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Ensure ObjectId is valid
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }
    
    const result = await db.collection('candidates').updateOne(
      { _id: objectId },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    // Get updated candidate
    const updatedCandidate = await db.collection('candidates').findOne({ _id: objectId });
    
    // Transform for client
    res.json({
      id,
      name: updatedCandidate.name,
      university: updatedCandidate.university,
      position: updatedCandidate.position,
      bio: updatedCandidate.bio
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete a candidate
app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure ObjectId is valid
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }
    
    const result = await db.collection('candidates').deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    // Remove votes for this candidate
    await db.collection('votes').deleteOne({ candidateId: id });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// Update election settings
app.put('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    // Find existing settings (there should only be one document)
    const existingSettings = await db.collection('settings').findOne({});
    
    if (existingSettings) {
      await db.collection('settings').updateOne(
        { _id: existingSettings._id },
        { $set: settings }
      );
    } else {
      await db.collection('settings').insertOne(settings);
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Cast a vote
app.post('/api/vote', async (req, res) => {
  try {
    const { candidateId } = req.body;
    
    // Check if candidate exists
    let objectId;
    try {
      objectId = new ObjectId(candidateId);
    } catch {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }
    
    const candidate = await db.collection('candidates').findOne({ _id: objectId });
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    // Find or create vote record
    const voteRecord = await db.collection('votes').findOne({ candidateId });
    
    if (voteRecord) {
      await db.collection('votes').updateOne(
        { candidateId },
        { $inc: { count: 1 } }
      );
    } else {
      await db.collection('votes').insertOne({
        candidateId,
        count: 1
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

// Get vote statistics
app.get('/api/stats', async (req, res) => {
  try {
    // Get voter stats
    const voterStats = await db.collection('voters').findOne({ _id: 'stats' });
    const totalVoters = voterStats ? voterStats.totalRegistered : 0;
    
    // Get all vote counts
    const votes = await db.collection('votes').find({}).toArray();
    const totalVotesCast = votes.reduce((sum, vote) => sum + vote.count, 0);
    
    // Calculate turnout
    const turnoutPercentage = totalVoters > 0 
      ? parseFloat(((totalVotesCast / totalVoters) * 100).toFixed(1)) 
      : 0;
    
    res.json({
      totalVoters,
      votesCast: totalVotesCast,
      turnoutPercentage,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching vote statistics:', error);
    res.status(500).json({ error: 'Failed to fetch vote statistics' });
  }
});

// Start server
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer(); 