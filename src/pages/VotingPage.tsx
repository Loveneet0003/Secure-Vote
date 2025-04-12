import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, User, AlertCircle, Loader, ShieldAlert } from 'lucide-react';
import { hasDeviceVoted, recordVote } from '@/services/ethereumService';

const candidatesByUniversity = {
  uod: [{
    id: '1',
    name: 'Rajiv Kumar',
    party: 'Student Union',
    position: 'President'
  }, {
    id: '2',
    name: 'Priya Singh',
    party: 'Progressive Students',
    position: 'President'
  }, {
    id: '3',
    name: 'Amit Verma',
    party: 'Independent',
    position: 'President'
  }],
  nith: [{
    id: '1',
    name: 'Sneha Sharma',
    party: 'Unity Alliance',
    position: 'President'
  }, {
    id: '2',
    name: 'Karthik Reddy',
    party: 'Student Front',
    position: 'President'
  }]
};

const UniversityNames = {
  uod: 'University of Delhi',
  nith: 'National Institute Of Technology Hamirpur',
  bhu: 'Banaras Hindu University',
  iit: 'Indian Institute of Technology',
  iis: 'Indian Institute of Science',
  uoh: 'University of Hyderabad',
  ju: 'Jadavpur University',
  uoc: 'University of Calcutta',
  uom: 'University of Mumbai'
};

const VotingPage = () => {
  const {
    universityId
  } = useParams<{
    universityId: string;
  }>();
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const universityName = universityId ? UniversityNames[universityId as keyof typeof UniversityNames] : 'Unknown University';
  const candidates = universityId ? candidatesByUniversity[universityId as keyof typeof candidatesByUniversity] || [] : [];

  useEffect(() => {
    if (universityId && hasDeviceVoted(universityId)) {
      setAlreadyVoted(true);
      toast({
        title: "Already Voted",
        description: "This device has already cast a vote in this election.",
        variant: "destructive"
      });
    }
  }, [universityId]);

  const handleVote = async () => {
    if (!universityId) return;
    if (alreadyVoted) {
      toast({
        title: "Vote Restricted",
        description: "This device has already cast a vote in this election.",
        variant: "destructive"
      });
      return;
    }
    if (!selectedCandidate) {
      toast({
        title: "Error",
        description: "Please select a candidate to vote.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const hash = await recordVote(universityId, selectedCandidate);
      setTransactionHash(hash);
      setTimeout(() => {
        setIsProcessing(false);
        setHasVoted(true);
        toast({
          title: "Success",
          description: "Your vote has been successfully recorded on the blockchain."
        });
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record vote",
        variant: "destructive"
      });
    }
  };

  return <Layout>
      <div className="container mx-auto px-4 py-12">
        <Card className="mb-8 glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">{universityName} Elections</CardTitle>
          </CardHeader>
        </Card>
        
        {hasVoted ? <Card className="max-w-md mx-auto glass-card">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 animate-pulse-glow" />
              </div>
              <h2 className="text-2xl font-bold mb-2 gradient-text">Thank You!</h2>
              <p className="mb-6">Your vote has been successfully recorded on the blockchain.</p>
              
              {transactionHash && <div className="mb-6 p-4 bg-black/30 rounded-md dark:glass light:bg-white/30">
                  <p className="text-xs mb-2">Transaction Hash:</p>
                  <p className="text-xs font-mono text-voting-blue-light dark:text-voting-blue-light light:text-voting-blue-dark break-all">{transactionHash}</p>
                </div>}
              
              <Button onClick={() => navigate("/")} className="bg-gradient-blockchain hover:bg-voting-teal hover-glow">Return to Home</Button>
            </CardContent>
          </Card> : alreadyVoted ? <Card className="max-w-md mx-auto glass-card">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <ShieldAlert className="h-16 w-16 mx-auto text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-red-400">Already Voted</h2>
              <p className="mb-6">This device has already cast a vote in this election.</p>
              
              <Button onClick={() => navigate("/")} className="bg-gradient-blockchain hover:bg-voting-teal hover-glow">Return to Home</Button>
            </CardContent>
          </Card> : <Card className="glass-card">
            <CardHeader>
              <CardTitle>Select Your Preferred Candidate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <RadioGroup value={selectedCandidate || ''} onValueChange={setSelectedCandidate}>
                  {candidates.map(candidate => <div key={candidate.id} className="flex items-center space-x-4 p-4 border border-white/10 rounded-md mb-4 hover:bg-white/5 transition-colors glass">
                      <RadioGroupItem value={candidate.id} id={`candidate-${candidate.id}`} className="text-voting-blue" />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <User className="h-5 w-5 mr-2 text-voting-blue-light" />
                          <Label htmlFor={`candidate-${candidate.id}`} className="text-lg font-medium">
                            {candidate.name}
                          </Label>
                        </div>
                        <p className="text-muted-foreground">{candidate.party}</p>
                      </div>
                    </div>)}
                </RadioGroup>
              </div>
              
              {candidates.length === 0 && <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-voting-blue-light mb-4" />
                  <p>No candidates available for this election.</p>
                </div>}
              
              <div className="flex justify-end">
                <Button onClick={handleVote} className="bg-gradient-blockchain hover:bg-voting-teal px-8 py-2 hover-glow ripple-effect" disabled={!selectedCandidate || isProcessing}>
                  {isProcessing ? <span className="flex items-center">
                      <Loader className="animate-spin mr-2 h-4 w-4" />
                      Processing Vote...
                    </span> : "Submit Vote"}
                </Button>
              </div>
              
              {isProcessing && <div className="mt-6 p-4 glass rounded-lg text-center">
                  <p className="text-sm mb-2">Recording your vote on the blockchain</p>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-blockchain animate-gradient-shift" style={{
                width: '60%'
              }}></div>
                  </div>
                </div>}
            </CardContent>
          </Card>}
      </div>
    </Layout>;
};

export default VotingPage;
