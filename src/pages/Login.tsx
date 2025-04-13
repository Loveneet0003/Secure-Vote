import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { login, isLoggedIn, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin123');
  const [adminPassword, setAdminPassword] = useState('admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const [adminIsLoading, setAdminIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('voter');

  // Get the intended destination from location state, or default to homepage
  const from = location.state?.from?.pathname || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      // Redirect admin to admin panel, regular users to homepage or intended destination
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate(from);
      }
    }
  }, [isLoggedIn, isAdmin, navigate, from]);

  const handleVoterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      setError("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");
      // Navigation happens automatically via the useEffect when isLoggedIn changes
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!adminEmail || !adminPassword) {
      toast.error("Please fill in all fields");
      setError("Please fill in all fields");
      return;
    }
    
    setAdminIsLoading(true);
    try {
      await login(adminEmail, adminPassword);
      toast.success("Admin login successful!");
      // Navigation happens automatically via the useEffect when isLoggedIn changes
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setAdminIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError('');
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-16">
        <Tabs defaultValue="voter" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 glass">
            <TabsTrigger value="voter">Voter Login</TabsTrigger>
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
          </TabsList>
          
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-950/10 border border-red-800/20 text-red-500">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
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
                    required
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
                    required
                  />
                </div>
                
                <Alert className="mt-4 bg-voting-blue/10 border-voting-blue/20">
                  <InfoIcon className="h-4 w-4 text-voting-blue" />
                  <AlertDescription className="text-xs">
                    For demo purposes, login with: <strong>user@example.com</strong> and password <strong>password123</strong>
                  </AlertDescription>
                </Alert>
                
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
                  <Label htmlFor="admin-email">Username</Label>
                  <Input 
                    id="admin-email" 
                    type="text"
                    placeholder="Enter your admin username" 
                    className="glass"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={adminIsLoading}
                    required
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
                    required
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
