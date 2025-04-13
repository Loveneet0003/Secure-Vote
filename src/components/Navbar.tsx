/**
 * Navbar Component
 * 
 * This component provides the main navigation for the application,
 * including links to various pages, user authentication controls,
 * and responsive mobile menu functionality.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

const Navbar = () => {
  //------------------------------------------------------
  // State and Hooks
  //------------------------------------------------------
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    user,
    isLoggedIn,
    isAdmin,
    logout
  } = useAuth();
  const navigate = useNavigate();

  //------------------------------------------------------
  // Event Handlers
  //------------------------------------------------------
  /**
   * Handles search button click
   * Shows toast notification for coming functionality
   */
  const handleSearch = () => {
    try {
      // Handle search
      toast.info("Search functionality not implemented yet");
    } catch (error) {
      console.error('Error during search:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  /**
   * Handles user logout
   * Calls auth context logout method and redirects to home page
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  /**
   * Handles login button click
   * Navigates to login page and closes mobile menu
   */
  const handleLoginClick = () => {
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  /**
   * Toggles mobile menu open/closed
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  //------------------------------------------------------
  // Component Render
  //------------------------------------------------------
  return <header className="w-full sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
    <div className="container flex items-center justify-between h-16 px-4 md:px-6">
      {/* Logo and Nav Links */}
      <div className="flex items-center">
        <Link 
          to="/" 
          className="flex items-center mr-6 text-xl font-bold"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="bg-gradient-blockchain bg-clip-text text-transparent">
            SecureVote
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link 
            to="/" 
            className="text-sm font-medium transition-colors hover:text-foreground/80"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="text-sm font-medium transition-colors hover:text-foreground/80"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="text-sm font-medium transition-colors hover:text-foreground/80"
          >
            Contact
          </Link>
          {isAdmin && (
            <Link 
              to="/admin" 
              className="text-sm font-medium transition-colors text-voting-blue hover:text-voting-blue/80"
            >
              Admin Panel
            </Link>
          )}
        </nav>
      </div>

      {/* Right side - Theme, Search, Auth */}
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9" 
          onClick={handleSearch}
          aria-label="Search"
        >
          <Search size={20} className="h-5 w-5" />
        </Button>
        
        {/* Auth Buttons */}
        {isLoggedIn ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout} 
            className="hidden md:flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleLoginClick} 
            className="hidden md:flex bg-gradient-blockchain hover:bg-voting-teal"
          >
            Login
          </Button>
        )}
        
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>

    {/* Mobile Navigation */}
    {isMobileMenuOpen && (
      <div className="md:hidden border-t">
        <div className="container px-4 py-4 space-y-3">
          <Link 
            to="/" 
            className="block py-2 text-sm font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="block py-2 text-sm font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="block py-2 text-sm font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </Link>
          {isAdmin && (
            <Link 
              to="/admin" 
              className="block py-2 text-sm font-medium text-voting-blue"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Panel
            </Link>
          )}
          
          {/* Auth in Mobile Menu */}
          {isLoggedIn ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="w-full mt-2"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleLoginClick} 
              className="w-full mt-2 bg-gradient-blockchain hover:bg-voting-teal"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    )}
  </header>;
};

export default Navbar;
