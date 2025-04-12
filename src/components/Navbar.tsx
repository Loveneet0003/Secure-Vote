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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
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
  const handleSearchClick = () => {
    toast.success('Search functionality coming soon!');
  };

  /**
   * Handles user logout
   * Calls auth context logout method and redirects to home page
   */
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  //------------------------------------------------------
  // Component Render
  //------------------------------------------------------
  return <nav className="bg-voting-primary/80 backdrop-blur-md text-white w-full sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* App Logo and Title */}
        <Link to="/" className="text-xl font-bold flex items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" className="mr-2 text-voting-blue-light">
            <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17.13C15.92,18.34 14.11,19 12,19C9.89,19 8.08,18.34 6.87,17.13C8.08,15.92 9.89,15.26 12,15.26C14.11,15.26 15.92,15.92 17.13,17.13Z" />
          </svg>
          SecureVote
        </Link>
        
        {/* Desktop Navigation Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Main Navigation Links */}
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          
          {/* Admin Links - Only visible to admin users */}
          {isAdmin && <Link to="/admin" className="nav-link">Admin Panel</Link>}
          
          {/* Theme Toggle Button */}
          <ThemeToggle />
          
          {/* Search Button */}
          <div className="relative group">
            <button 
              onClick={handleSearchClick}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-voting-blue/20 text-voting-blue-light hover:bg-voting-blue/30 transition-colors active:scale-95" 
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-white">
              Search
            </span>
          </div>
          
          {/* User Authentication Controls */}
          {isLoggedIn ? (
            // Logout Button - Shown when user is logged in
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="flex items-center gap-1 border-red-400 text-red-400 hover:bg-red-500/10 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-950/50"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          ) : (
            // Login Button - Shown when user is not logged in
            <Link to="/login">
              <Button 
                variant="outline" 
                className="border-voting-blue-light bg-sky-500 hover:bg-sky-400 text-white dark:border-voting-blue-light"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
        
        {/* Mobile Navigation Controls */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Theme Toggle for Mobile */}
          <ThemeToggle />
          
          {/* Mobile Search Button */}
          <button 
            onClick={handleSearchClick}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-voting-blue/20 text-voting-blue-light hover:bg-voting-blue/30 transition-colors active:scale-95" 
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          
          {/* Mobile Menu Toggle Button */}
          <Button 
            variant="ghost" 
            className="text-white" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu - Shown when menu is toggled open */}
      {isMenuOpen && (
        <div className="md:hidden bg-voting-primary/90 backdrop-blur-md py-4 px-4 absolute w-full z-10 animate-fade-in">
          <div className="flex flex-col space-y-3">
            {/* Mobile Navigation Links */}
            <Link 
              to="/" 
              className="nav-link py-2 px-4 rounded hover:bg-voting-secondary" 
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="nav-link py-2 px-4 rounded hover:bg-voting-secondary" 
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="nav-link py-2 px-4 rounded hover:bg-voting-secondary" 
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Mobile Admin Link - Only visible to admin users */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="nav-link py-2 px-4 rounded hover:bg-voting-secondary" 
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            
            {/* Mobile Authentication Controls */}
            {isLoggedIn ? (
              // Mobile Logout Button
              <Button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }} 
                variant="outline" 
                className="flex items-center justify-center gap-1 border-red-400 text-red-400 hover:bg-red-500/20 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-950/50"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            ) : (
              // Mobile Login Button
              <Link 
                to="/login" 
                className="block bg-voting-blue-light text-white font-medium py-2 px-4 rounded hover:bg-voting-blue" 
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>;
};

export default Navbar;
