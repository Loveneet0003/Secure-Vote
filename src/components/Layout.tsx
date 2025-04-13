import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRound, LogIn, Settings, BarChart3, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Helper to clear cache and refresh for troubleshooting
  const handleForceRefresh = () => {
    try {
      // Clear localStorage items
      localStorage.removeItem('voteCache');
      localStorage.removeItem('candidateCache');
      
      // Clear session storage
      sessionStorage.clear();
      
      // Show toast
      toast.success('Cache cleared, refreshing page...');
      
      // Wait a moment then reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-voting-blue-dark to-black text-white">
      <header className="glass-header backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-lg font-bold tracking-tight flex items-center">
            <span className="bg-gradient-text bg-clip-text text-transparent bg-gradient-blockchain">
              SecureVote
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceRefresh}
              title="Clear cache and refresh"
            >
              Refresh Data
            </Button>
            
            <Link to="/login">
              <Button size="sm" className="bg-gradient-blockchain hover:shadow-voting-blue/25 hover:shadow-md">
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Button>
            </Link>
          </div>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="container mx-auto px-4 pb-4 md:hidden">
            <div className="flex flex-col space-y-2">
              <Link to="/">
                <Button variant="ghost" className="w-full justify-start">Home</Button>
              </Link>
              <Link to="/admin">
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleForceRefresh}
              >
                Refresh Data
              </Button>
              <Link to="/login">
                <Button className="w-full justify-start bg-gradient-blockchain">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="py-4 text-center text-sm text-white/70">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} SecureVote. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
