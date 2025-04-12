import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "sonner";
import { 
  electionService, 
  Candidate, 
  ElectionSettings, 
  VoteStatistics 
} from '@/services/electionService';

const Admin = () => {
  const [showChart, setShowChart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State management
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidate, setNewCandidate] = useState<Omit<Candidate, 'id'>>({
    name: '',
    university: '',
    position: '',
    bio: ''
  });
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [electionSettings, setElectionSettings] = useState<ElectionSettings>({
    name: '',
    organization: '',
    startDate: '',
    endDate: ''
  });
  
  // Vote statistics state
  const [voteStats, setVoteStats] = useState<VoteStatistics>({
    totalVoters: 0,
    votesCast: 0,
    turnoutPercentage: 0,
    lastUpdated: new Date()
  });
  
  const [isPolling, setIsPolling] = useState(true);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await electionService.getElectionData();
        
        // Set candidates
        setCandidates(data.candidates);
        
        // Set settings
        setElectionSettings(data.settings);
        
        // Set vote statistics
        setVoteStats({
          ...data.stats,
          lastUpdated: new Date(data.stats.lastUpdated)
        });
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load election data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Set up polling for vote updates
  useEffect(() => {
    if (!isPolling) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const newStats = await electionService.getVoteStatistics();
        setVoteStats(newStats);
      } catch (error) {
        console.error('Error fetching vote statistics:', error);
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(pollInterval);
  }, [isPolling]);

  // Prepare data for the chart
  const resultsData = candidates.map((candidate) => {
    const colors = ['#0EA5E9', '#14B8A6', '#F59E0B', '#8B5CF6', '#EC4899'];
    const colorIndex = parseInt(candidate.id) % colors.length;
    
    return {
      name: candidate.name,
      votes: electionService.getElectionData().votes?.[candidate.id] || 0,
      university: candidate.university,
      fill: colors[colorIndex]
    };
  });

  const chartConfig = {
    votes: {
      theme: {
        light: '#0EA5E9',
        dark: '#38BDF8'
      }
    }
  };

  // Toggle live updates
  const togglePolling = () => {
    setIsPolling(prev => !prev);
    toast.success(isPolling ? 'Live updates paused' : 'Live updates resumed');
  };

  // Handler functions
  const handleCandidateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewCandidate(prev => ({ ...prev, [id]: value }));
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCandidate.name || !newCandidate.university || !newCandidate.position) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      const addedCandidate = await electionService.addCandidate(newCandidate);
      setCandidates(prev => [...prev, addedCandidate]);
      setNewCandidate({ name: '', university: '', position: '', bio: '' });
      toast.success("Candidate added successfully");
    } catch (error) {
      console.error('Failed to add candidate:', error);
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setNewCandidate(candidate);
  };

  const handleUpdateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCandidate) return;
    
    try {
      const updatedCandidate = await electionService.updateCandidate(
        editingCandidate.id, 
        newCandidate
      );
      
      setCandidates(prev => 
        prev.map(c => c.id === editingCandidate.id ? updatedCandidate : c)
      );
      
      setEditingCandidate(null);
      setNewCandidate({ name: '', university: '', position: '', bio: '' });
      toast.success("Candidate updated successfully");
    } catch (error) {
      console.error('Failed to update candidate:', error);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      await electionService.deleteCandidate(id);
      setCandidates(prev => prev.filter(c => c.id !== id));
      toast.success("Candidate deleted successfully");
    } catch (error) {
      console.error('Failed to delete candidate:', error);
    }
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const key = id.replace('election-', '') as keyof ElectionSettings;
    setElectionSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await electionService.updateSettings(electionSettings);
      toast.success("Election settings saved successfully");
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error("Failed to save settings");
    }
  };

  // For demo purposes: Cast a vote for a random candidate
  const handleSimulateVote = async () => {
    if (candidates.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const candidateId = candidates[randomIndex].id;
    
    try {
      await electionService.castVote(candidateId);
      toast.success(`Vote cast for ${candidates[randomIndex].name}`);
    } catch (error) {
      console.error('Failed to cast vote:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">Loading admin dashboard...</h2>
        </div>
      </Layout>
    );
  }

  return <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center gradient-text">Admin Dashboard</h1>
        
        <Tabs defaultValue="candidates" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="candidates">Manage Candidates</TabsTrigger>
            <TabsTrigger value="election">Election Settings</TabsTrigger>
            <TabsTrigger value="results">View Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="candidates">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{editingCandidate ? 'Edit Candidate' : 'Add Candidate'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={editingCandidate ? handleUpdateCandidate : handleAddCandidate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Candidate Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter candidate name" 
                        value={newCandidate.name}
                        onChange={handleCandidateInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input 
                        id="university" 
                        placeholder="Enter university name" 
                        value={newCandidate.university}
                        onChange={handleCandidateInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input 
                      id="position" 
                      placeholder="Enter position" 
                      value={newCandidate.position}
                      onChange={handleCandidateInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Short Bio</Label>
                    <Input 
                      id="bio" 
                      placeholder="Enter candidate bio" 
                      value={newCandidate.bio}
                      onChange={handleCandidateInputChange}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    {editingCandidate && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditingCandidate(null);
                          setNewCandidate({ name: '', university: '', position: '', bio: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" className="bg-gradient-blockchain hover:shadow-lg hover:shadow-voting-blue/25">
                      {editingCandidate ? 'Update Candidate' : 'Add Candidate'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="mt-8 glass-card">
              <CardHeader>
                <CardTitle>Candidate List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {candidates.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No candidates added yet</td>
                        </tr>
                      ) : (
                        candidates.map(candidate => (
                          <tr key={candidate.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{candidate.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{candidate.university}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{candidate.position}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mr-2"
                                onClick={() => handleEditCandidate(candidate)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteCandidate(candidate.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="election">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Election Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSaveSettings}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="election-name">Election Name</Label>
                      <Input 
                        id="election-name" 
                        placeholder="Enter election name" 
                        value={electionSettings.name}
                        onChange={handleSettingChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="election-organization">Organization</Label>
                      <Input 
                        id="election-organization" 
                        placeholder="Enter organization name" 
                        value={electionSettings.organization}
                        onChange={handleSettingChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="election-startDate">Start Date & Time</Label>
                      <Input 
                        id="election-startDate" 
                        type="datetime-local" 
                        value={electionSettings.startDate}
                        onChange={handleSettingChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="election-endDate">End Date & Time</Label>
                      <Input 
                        id="election-endDate" 
                        type="datetime-local" 
                        value={electionSettings.endDate}
                        onChange={handleSettingChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-gradient-blockchain hover:shadow-lg hover:shadow-voting-blue/25">Save Settings</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Election Results</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={togglePolling}
                    >
                      {isPolling ? 'Pause Updates' : 'Resume Updates'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-6 bg-black/20 backdrop-blur-md rounded-lg border border-white/10">
                    <h3 className="text-lg font-medium mb-4">Current Status: Election in Progress</h3>
                    <p className="text-gray-400 mb-4">
                      {isPolling 
                        ? `Live results updating - Last update: ${voteStats.lastUpdated.toLocaleTimeString()}` 
                        : 'Results updates paused'}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">
                          Start Date: {new Date(electionSettings.startDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          End Date: {new Date(electionSettings.endDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSimulateVote} 
                          className="bg-gradient-blockchain hover:shadow-lg hover:shadow-voting-blue/25"
                          disabled={candidates.length === 0}
                        >
                          Simulate Vote
                        </Button>
                        <Button 
                          onClick={() => setShowChart(!showChart)} 
                          className="bg-gradient-blockchain hover:shadow-lg hover:shadow-voting-blue/25" 
                          disabled={candidates.length === 0}
                        >
                          {showChart ? "Hide Results" : "View Results"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Live Voting Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 text-center glass-card">
                        <h4 className="text-gray-400 mb-2">Total Registered Voters</h4>
                        <p className="text-3xl font-bold gradient-text">{voteStats.totalVoters.toLocaleString()}</p>
                      </Card>
                      
                      <Card className="p-4 text-center glass-card relative overflow-hidden">
                        <div className={`absolute inset-0 bg-voting-blue/5 transition-transform duration-500 ${isPolling ? 'animate-pulse' : ''}`}></div>
                        <h4 className="text-gray-400 mb-2 relative z-10">Votes Cast</h4>
                        <p className="text-3xl font-bold gradient-text relative z-10">{voteStats.votesCast.toLocaleString()}</p>
                      </Card>
                      
                      <Card className="p-4 text-center glass-card">
                        <h4 className="text-gray-400 mb-2">Voter Turnout</h4>
                        <p className="text-3xl font-bold gradient-text">{voteStats.turnoutPercentage}%</p>
                      </Card>
                    </div>
                  </div>
                  
                  {showChart && candidates.length > 0 && <div className="mt-8 p-6 bg-black/20 backdrop-blur-md rounded-lg border border-white/10 mx-0">
                      <h3 className="text-lg font-medium mb-6">Election Results Visualization</h3>
                      <div className="h-96 w-full">
                        <ChartContainer config={chartConfig} className="h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={resultsData} margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 70
                        }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{
                            fill: 'var(--foreground)'
                          }} />
                              <YAxis tick={{
                            fill: 'var(--foreground)'
                          }} />
                              <Tooltip content={<ChartTooltipContent formatter={(value, name, props) => {
                            return <div className="flex items-center gap-2">
                                          <span className="font-mono font-medium">{value} votes</span>
                                          <span className="text-xs text-gray-400">({props.payload.university})</span>
                                        </div>;
                          }} />} />
                              <Legend wrapperStyle={{
                            position: 'relative',
                            marginTop: '10px'
                          }} />
                              <Bar dataKey="votes" name="Votes" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        <div className="mt-4 text-center text-xs text-gray-400 my-0">
                          <p>Data secured and verified on Ethereum blockchain</p>
                          <p className="eth-tx-hash mt-2 my-0">0xfe3a82d9bc997b59fa3cb648c905b3c3c37a52d0fe7bd69e3c9b6f576602bdc1</p>
                        </div>
                      </div>
                    </div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>;
};
export default Admin;