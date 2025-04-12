import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminIsLoading, setAdminIsLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleVoterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation happens automatically via the useEffect when isLoggedIn changes
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminEmail || !adminPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setAdminIsLoading(true);
    try {
      await login(adminEmail, adminPassword);
      // Navigation happens automatically via the useEffect when isLoggedIn changes
    } catch (error) {
      console.error("Admin login error:", error);
    } finally {
      setAdminIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-16">
        <Tabs defaultValue="voter" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 glass">
            <TabsTrigger value="voter">Voter Login</TabsTrigger>
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="voter">
            <Card className="p-6 glass-card">
              <h2 className="text-2xl font-bold mb-6 text-center">Voter Login</h2>
              <form className="space-y-4" onSubmit={handleVoterSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="Enter your email" 
                    className="glass" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="Enter your password" 
                    className="glass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-blockchain hover:bg-voting-teal hover-glow"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
                
                <div className="text-center text-sm mt-4">
                  <p>
                    Don't have an account?{" "}
                    <Link to="/register" className="text-voting-blue hover:underline">
                      Register here
                    </Link>
                  </p>
                  <p className="mt-2">
                    <Link to="/forgot-password" className="text-voting-blue hover:underline">
                      Change phone number or forgot credentials?
                    </Link>
                  </p>
                </div>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin">
            <Card className="p-6 glass-card">
              <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
              <form className="space-y-4" onSubmit={handleAdminSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input 
                    id="admin-email" 
                    type="email"
                    placeholder="Enter your admin email" 
                    className="glass"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={adminIsLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input 
                    id="admin-password" 
                    type="password" 
                    placeholder="Enter your password" 
                    className="glass"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={adminIsLoading}
                  />
                </div>
                
                <Alert className="mt-4 bg-voting-blue/10 border-voting-blue/20">
                  <InfoIcon className="h-4 w-4 text-voting-blue" />
                  <AlertDescription className="text-xs">
                    For demo purposes, login with: <strong>admin123</strong> and password <strong>admin@123</strong> to get admin privileges
                  </AlertDescription>
                </Alert>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-blockchain hover:bg-voting-teal hover-glow"
                  disabled={adminIsLoading}
                >
                  {adminIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Login;
