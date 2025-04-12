import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
const Admin = () => {
  const [showChart, setShowChart] = useState(false);

  // Mock election results data
  const resultsData = [{
    name: 'John Doe',
    votes: 156,
    party: 'Student Union',
    fill: '#0EA5E9'
  }, {
    name: 'Jane Smith',
    votes: 142,
    party: 'Progressive Students',
    fill: '#14B8A6'
  }, {
    name: 'Alex Johnson',
    votes: 98,
    party: 'Student Voice',
    fill: '#F59E0B'
  }, {
    name: 'Maria Garcia',
    votes: 87,
    party: 'Academic Excellence',
    fill: '#8B5CF6'
  }, {
    name: 'Thomas Lee',
    votes: 65,
    party: 'Student First',
    fill: '#EC4899'
  }];
  const chartConfig = {
    votes: {
      theme: {
        light: '#0EA5E9',
        dark: '#38BDF8'
      }
    }
  };
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
                <CardTitle>Add Candidate</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Candidate Name</Label>
                      <Input id="name" placeholder="Enter candidate name" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="party">Party</Label>
                      <Input id="party" placeholder="Enter party name" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" placeholder="Enter position" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Short Bio</Label>
                    <Input id="bio" placeholder="Enter candidate bio" />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-gradient-blockchain hover:shadow-lg hover:shadow-voting-blue/25">Add Candidate</Button>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                        <td className="px-6 py-4 whitespace-nowrap">Student Union</td>
                        <td className="px-6 py-4 whitespace-nowrap">President</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Jane Smith</td>
                        <td className="px-6 py-4 whitespace-nowrap">Progressive Students</td>
                        <td className="px-6 py-4 whitespace-nowrap">Vice President</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </td>
                      </tr>
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
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="election-name">Election Name</Label>
                      <Input id="election-name" placeholder="Enter election name" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input id="organization" placeholder="Enter organization name" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date & Time</Label>
                      <Input id="start-date" type="datetime-local" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date & Time</Label>
                      <Input id="end-date" type="datetime-local" />
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
                <CardTitle>Election Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-6 bg-black/20 backdrop-blur-md rounded-lg border border-white/10">
                    <h3 className="text-lg font-medium mb-4">Current Status: Election in Progress</h3>
                    <p className="text-gray-400 mb-4">Results will be available after the election ends.</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Start Date: 2025-04-05 08:00 AM</p>
                        <p className="text-sm text-gray-500">End Date: 2025-04-07 06:00 PM</p>
                      </div>
                      <Button onClick={() => setShowChart(!showChart)} className="bg-gradient-blockchain hover:shadow-lg hover:shadow-voting-blue/25" disabled={false}>
                        {showChart ? "Hide Results" : "View Results"}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Live Voting Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 text-center glass-card">
                        <h4 className="text-gray-400 mb-2">Total Registered Voters</h4>
                        <p className="text-3xl font-bold gradient-text">2,548</p>
                      </Card>
                      
                      <Card className="p-4 text-center glass-card">
                        <h4 className="text-gray-400 mb-2">Votes Cast</h4>
                        <p className="text-3xl font-bold gradient-text">1,256</p>
                      </Card>
                      
                      <Card className="p-4 text-center glass-card">
                        <h4 className="text-gray-400 mb-2">Voter Turnout</h4>
                        <p className="text-3xl font-bold gradient-text">49.3%</p>
                      </Card>
                    </div>
                  </div>
                  
                  {showChart && <div className="mt-8 p-6 bg-black/20 backdrop-blur-md rounded-lg border border-white/10 mx-0">
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
                                          <span className="text-xs text-gray-400">({props.payload.party})</span>
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