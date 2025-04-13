// ESM compatible wrapper for server
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

// Setup correct paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Load environment variables from various locations
dotenv.config({ path: join(rootDir, '.env') });
dotenv.config({ path: join(__dirname, '.env') });

console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI exists' : 'URI missing');
console.log('PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-vote';
let db;
let isConnected = false;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB with URI:', 
                MONGODB_URI ? `${MONGODB_URI.substring(0, 15)}...` : 'missing URI');
    
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
      socketTimeoutMS: 45000, // 45 seconds timeout for operations
    });
    
    await client.connect();
    console.log('Connected to MongoDB successfully');
    db = client.db();
    isConnected = true;
    
    // Create initial collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Existing collections:', collectionNames);
    
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
    
    // Run initial data consistency check
    await ensureDataConsistency();
    
    // Set up periodic data consistency checks (every 5 minutes)
    setInterval(ensureDataConsistency, 5 * 60 * 1000);
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit the process, try to keep the server running
    // but mark as not connected
    isConnected = false;
  }
}

// Ensure data consistency across collections
async function ensureDataConsistency() {
  try {
    if (!isConnected || !db) {
      console.log('Database not connected, skipping data consistency check');
      return;
    }
    
    console.log('Running data consistency check...');
    
    // 1. Get all candidates
    const candidates = await db.collection('candidates').find({}).toArray();
    console.log(`Found ${candidates.length} candidates`);
    
    // 2. Get all vote records
    const voteRecords = await db.collection('votes').find({}).toArray();
    console.log(`Found ${voteRecords.length} vote records`);
    
    // Create a map of existing vote records
    const voteMap = voteRecords.reduce((map, vote) => {
      if (vote.candidateId) {
        map[vote.candidateId.toString()] = vote;
      }
      return map;
    }, {});
    
    // 3. Check for missing or invalid vote records
    let fixedRecords = 0;
    
    // Ensure each candidate has a vote record
    for (const candidate of candidates) {
      const candidateId = candidate._id.toString();
      
      // If no vote record exists for this candidate, create one
      if (!voteMap[candidateId]) {
        await db.collection('votes').insertOne({
          candidateId,
          count: 0
        });
        fixedRecords++;
        console.log(`Created missing vote record for candidate: ${candidate.name} (${candidateId})`);
      }
      // If vote record exists but has invalid count, fix it
      else if (voteMap[candidateId].count === undefined || 
               voteMap[candidateId].count === null || 
               isNaN(voteMap[candidateId].count)) {
        await db.collection('votes').updateOne(
          { candidateId },
          { $set: { count: 0 } }
        );
        fixedRecords++;
        console.log(`Fixed invalid vote count for candidate: ${candidate.name} (${candidateId})`);
      }
    }
    
    // 4. Check for orphaned vote records (no corresponding candidate)
    let orphanedRecords = 0;
    const candidateIdSet = new Set(candidates.map(c => c._id.toString()));
    
    for (const vote of voteRecords) {
      // Skip if candidateId is missing
      if (!vote.candidateId) continue;
      
      const voteForId = vote.candidateId.toString();
      if (!candidateIdSet.has(voteForId)) {
        // This vote record is for a candidate that no longer exists
        await db.collection('votes').deleteOne({ _id: vote._id });
        orphanedRecords++;
        console.log(`Removed orphaned vote record for non-existent candidate ID: ${voteForId}`);
      }
    }
    
    // 5. Ensure voter stats exist
    const voterStats = await db.collection('voters').findOne({ _id: 'stats' });
    if (!voterStats) {
      await db.collection('voters').insertOne({
        _id: 'stats',
        totalRegistered: 2548,
        lastUpdated: new Date()
      });
      fixedRecords++;
      console.log('Created missing voter statistics record');
    }
    
    console.log(`Data consistency check completed. Fixed ${fixedRecords} records, removed ${orphanedRecords} orphaned records.`);
    
  } catch (error) {
    console.error('Error during data consistency check:', error);
  }
}

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.originalUrl}`);
  next();
});

// Root endpoint for health checks
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Secure Vote API is running',
    version: '1.0.0',
    endpoints: '/api/*' 
  });
});

// Add middleware to check DB connection
app.use((req, res, next) => {
  if (!isConnected && req.path !== '/api/health' && req.path !== '/api') {
    console.error('Database not connected, rejecting request to', req.path);
    return res.status(503).json({ 
      error: 'Service Unavailable', 
      message: 'Database connection is not established. Please try again later.' 
    });
  }
  next();
});

// Routes
app.get('/api', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is ready',
    endpoints: [
      '/api/health',
      '/api/election',
      '/api/candidates',
      '/api/vote',
      '/api/stats',
      '/api/settings'
    ] 
  });
});

app.get('/api/health', (req, res) => {
  const dbStatus = isConnected ? 'connected' : 'disconnected';
  console.log(`Health check: Database ${dbStatus}`);
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running', 
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Get all election data
app.get('/api/election', async (req, res) => {
  try {
    console.log('Fetching all election data');
    const candidates = await db.collection('candidates').find({}).toArray();
    const settings = await db.collection('settings').findOne({});
    
    console.log(`Found ${candidates.length} candidates`);
    
    // Get votes for each candidate
    const votes = {};
    const voteRecords = await db.collection('votes').find({}).toArray();
    console.log(`Found ${voteRecords.length} vote records`);
    
    // Create a map of candidateId to vote count
    const voteMap = voteRecords.reduce((map, vote) => {
      // Ensure we're using string IDs consistently
      const candidateId = vote.candidateId?.toString();
      if (candidateId) {
        map[candidateId] = vote.count || 0;
      }
      return map;
    }, {});
    
    // Ensure each candidate has a vote count (even if 0)
    for (const candidate of candidates) {
      const candidateId = candidate._id.toString();
      votes[candidateId] = voteMap[candidateId] || 0;
      
      // If no vote record exists yet for this candidate, create one
      if (!voteMap[candidateId]) {
        try {
          await db.collection('votes').insertOne({
            candidateId,
            count: 0
          });
          console.log(`Created missing vote record for candidate: ${candidate.name} (${candidateId})`);
        } catch (voteError) {
          console.error(`Error creating vote record for candidate ${candidateId}:`, voteError);
        }
      }
    }
    
    console.log('Vote counts:', votes);
    
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
    
    const response = {
      candidates: transformedCandidates,
      settings: settings || {},
      votes,
      stats: {
        totalVoters,
        votesCast: totalVotesCast,
        turnoutPercentage,
        lastUpdated: new Date()
      }
    };
    
    console.log('Sending election data response');
    res.json(response);
  } catch (error) {
    console.error('Error fetching election data:', error);
    res.status(500).json({ error: 'Failed to fetch election data', message: error.message });
  }
});

// Get candidates
app.get('/api/candidates', async (req, res) => {
  try {
    console.log('Fetching all candidates');
    const candidates = await db.collection('candidates').find({}).toArray();
    
    // Check for missing vote records and create them
    const voteRecords = await db.collection('votes').find({}).toArray();
    const voteMap = voteRecords.reduce((map, vote) => {
      if (vote.candidateId) {
        map[vote.candidateId.toString()] = true;
      }
      return map;
    }, {});
    
    // Ensure each candidate has a vote record
    for (const candidate of candidates) {
      const candidateId = candidate._id.toString();
      
      if (!voteMap[candidateId]) {
        try {
          await db.collection('votes').insertOne({
            candidateId,
            count: 0
          });
          console.log(`Created missing vote record for candidate: ${candidate.name} (${candidateId})`);
        } catch (voteError) {
          console.error(`Error creating vote record for candidate ${candidateId}:`, voteError);
        }
      }
    }
    
    // Transform MongoDB _id to id for client
    const transformedCandidates = candidates.map(c => ({
      id: c._id.toString(),
      name: c.name,
      university: c.university,
      position: c.position,
      bio: c.bio
    }));
    
    console.log(`Returning ${transformedCandidates.length} candidates`);
    res.json(transformedCandidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get candidates filtered by university
app.get('/api/candidates/university/:university', async (req, res) => {
  try {
    const { university } = req.params;
    console.log(`Fetching candidates for university: ${university}`);
    
    // Validate university parameter
    if (!university) {
      return res.status(400).json({ 
        error: 'Missing university parameter', 
        message: 'University parameter is required' 
      });
    }
    
    // Find candidates for this university
    const candidates = await db.collection('candidates')
      .find({ university: { $regex: new RegExp(university, 'i') } })
      .toArray();
    
    console.log(`Found ${candidates.length} candidates for university: ${university}`);
    
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
    console.error('Error fetching candidates by university:', error);
    res.status(500).json({ 
      error: 'Failed to fetch candidates', 
      message: error.message 
    });
  }
});

// Add a candidate
app.post('/api/candidates', async (req, res) => {
  try {
    console.log('Received add candidate request:', req.body);
    
    // Validate required fields
    const candidate = req.body;
    if (!candidate.name || !candidate.position || !candidate.university) {
      console.error('Missing required fields in candidate data');
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Name, position, and university are required' 
      });
    }
    
    // Double-check database connection
    if (!db) {
      console.error('Database object is undefined when trying to add candidate');
      return res.status(500).json({ 
        error: 'Database Error', 
        message: 'Database connection issue. Please try again later.' 
      });
    }
    
    try {
      const result = await db.collection('candidates').insertOne(candidate);
      console.log('Candidate inserted with ID:', result.insertedId);
      
      const candidateId = result.insertedId.toString();
      
      // Initialize vote count for the new candidate
      await db.collection('votes').insertOne({
        candidateId,
        count: 0
      });
      console.log('Vote record initialized for candidate ID:', candidateId);
      
      // Return the created candidate with id
      const createdCandidate = {
        id: candidateId,
        ...candidate
      };
      console.log('Returning created candidate:', createdCandidate);
      
      res.status(201).json(createdCandidate);
    } catch (dbError) {
      console.error('Database operation error when adding candidate:', dbError);
      res.status(500).json({ 
        error: 'Database Operation Failed', 
        message: dbError.message || 'Failed to add candidate to database'
      });
    }
  } catch (error) {
    console.error('Error adding candidate:', error);
    res.status(500).json({ error: 'Failed to add candidate', message: error.message });
  }
});

// Update a candidate
app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log(`Updating candidate ${id} with:`, updates);
    
    // Validate required fields
    if (!updates.name || !updates.position || !updates.university) {
      console.error('Missing required fields in update data');
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Name, position, and university are required' 
      });
    }
    
    // Ensure ObjectId is valid
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      console.error('Invalid ObjectId format:', id);
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }
    
    const result = await db.collection('candidates').updateOne(
      { _id: objectId },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      console.error('Candidate not found with ID:', id);
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    console.log(`Candidate ${id} updated successfully`);
    
    // Get updated candidate
    const updatedCandidate = await db.collection('candidates').findOne({ _id: objectId });
    
    // Transform for client
    const response = {
      id,
      name: updatedCandidate.name,
      university: updatedCandidate.university,
      position: updatedCandidate.position,
      bio: updatedCandidate.bio
    };
    console.log('Returning updated candidate:', response);
    
    res.json(response);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate', message: error.message });
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
    console.log(`Casting vote for candidate ID: ${candidateId}`);
    
    if (!candidateId) {
      console.error('Missing candidateId in request body');
      return res.status(400).json({ 
        error: 'Missing candidateId', 
        message: 'Candidate ID is required' 
      });
    }
    
    // Check if candidate exists
    let objectId;
    try {
      objectId = new ObjectId(candidateId);
    } catch (error) {
      console.error('Invalid candidate ID format:', candidateId);
      return res.status(400).json({ 
        error: 'Invalid candidate ID format', 
        message: error.message 
      });
    }
    
    const candidate = await db.collection('candidates').findOne({ _id: objectId });
    if (!candidate) {
      console.error('Candidate not found with ID:', candidateId);
      return res.status(404).json({ 
        error: 'Candidate not found', 
        message: 'No candidate exists with the provided ID' 
      });
    }
    
    console.log(`Found candidate: ${candidate.name}`);
    
    // Find or create vote record - ensure we're using string IDs consistently
    const voteRecord = await db.collection('votes').findOne({ candidateId: candidateId.toString() });
    
    let result;
    if (voteRecord) {
      console.log(`Updating existing vote record for ${candidateId}, current count: ${voteRecord.count}`);
      result = await db.collection('votes').updateOne(
        { candidateId: candidateId.toString() },
        { $inc: { count: 1 } }
      );
      console.log(`Vote record updated: ${result.modifiedCount} document modified`);
    } else {
      console.log(`Creating new vote record for ${candidateId}`);
      result = await db.collection('votes').insertOne({
        candidateId: candidateId.toString(),
        count: 1
      });
      console.log(`Vote record created with ID: ${result.insertedId}`);
    }
    
    // Get updated vote count
    const updatedVoteRecord = await db.collection('votes').findOne({ candidateId: candidateId.toString() });
    const newCount = updatedVoteRecord ? updatedVoteRecord.count : 1;
    
    console.log(`New vote count for ${candidate.name}: ${newCount}`);
    
    // Get all current votes to return them
    const allVotes = await db.collection('votes').find({}).toArray();
    const voteMap = {};
    
    // Build vote map - ensure we're using string IDs consistently
    for (const vote of allVotes) {
      if (vote.candidateId) {
        voteMap[vote.candidateId.toString()] = vote.count || 0;
      }
    }
    
    // Get all candidates to ensure every candidate has a vote entry
    const allCandidates = await db.collection('candidates').find({}).toArray();
    for (const candidate of allCandidates) {
      const id = candidate._id.toString();
      if (!voteMap[id]) {
        voteMap[id] = 0;
      }
    }
    
    // Get vote statistics
    const voterStats = await db.collection('voters').findOne({ _id: 'stats' });
    const totalVoters = voterStats ? voterStats.totalRegistered : 0;
    
    const totalVotesCast = Object.values(voteMap).reduce((sum, count) => sum + count, 0);
    const turnoutPercentage = totalVoters > 0 
      ? parseFloat(((totalVotesCast / totalVoters) * 100).toFixed(1)) 
      : 0;
    
    console.log(`Returning updated vote data: ${totalVotesCast} total votes (${turnoutPercentage}% turnout)`);
    
    // Update voter stats record with new total
    await db.collection('voters').updateOne(
      { _id: 'stats' },
      { $set: { lastUpdated: new Date() } }
    );
    
    res.json({ 
      success: true, 
      candidate: {
        id: candidateId.toString(),
        name: candidate.name
      },
      newCount,
      votes: voteMap,
      stats: {
        totalVoters,
        votesCast: totalVotesCast,
        turnoutPercentage,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ error: 'Failed to cast vote', message: error.message });
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
    
    // Validate all votes have proper counts
    let needsRepair = false;
    for (const vote of votes) {
      if (vote.count === undefined || vote.count === null || isNaN(vote.count)) {
        // Fix corrupted vote records
        await db.collection('votes').updateOne(
          { _id: vote._id },
          { $set: { count: 0 } }
        );
        needsRepair = true;
        console.log(`Repaired corrupted vote record for candidate ID: ${vote.candidateId}`);
      }
    }
    
    // If records were repaired, get fresh data
    const validVotes = needsRepair 
      ? await db.collection('votes').find({}).toArray()
      : votes;
    
    const totalVotesCast = validVotes.reduce((sum, vote) => sum + (vote.count || 0), 0);
    
    // Calculate turnout
    const turnoutPercentage = totalVoters > 0 
      ? parseFloat(((totalVotesCast / totalVoters) * 100).toFixed(1)) 
      : 0;
    
    // Update last updated timestamp
    const now = new Date();
    await db.collection('voters').updateOne(
      { _id: 'stats' },
      { $set: { lastUpdated: now } }
    );
    
    res.json({
      totalVoters,
      votesCast: totalVotesCast,
      turnoutPercentage,
      lastUpdated: now
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