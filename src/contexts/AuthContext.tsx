/**
 * AuthContext
 * 
 * This context provides authentication functionality throughout the application.
 * It uses localStorage to store user data instead of Supabase.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

// Local storage keys
const USER_STORAGE_KEY = 'secure_vote_user';
const SESSION_STORAGE_KEY = 'secure_vote_session';

// Types
interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
    is_admin?: boolean;
  };
}

interface Session {
  access_token: string;
  expires_at: number;
  user: User;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData?: { full_name?: string, phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

// Sample users for demo purposes
const DEMO_USERS = [
  {
    email: 'admin123',
    password: 'admin@123',
    isAdmin: true
  },
  {
    email: 'user@example.com',
    password: 'password123',
    isAdmin: false
  }
];

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  user: null,
  session: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from localStorage on startup
  useEffect(() => {
    const loadSession = () => {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      
      if (savedUser && savedSession) {
        try {
          const userObj = JSON.parse(savedUser) as User;
          const sessionObj = JSON.parse(savedSession) as Session;
          
          // Check if session is expired
          if (sessionObj.expires_at < Date.now()) {
            // Session expired, clear storage
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(SESSION_STORAGE_KEY);
          } else {
            setUser(userObj);
            setSession(sessionObj);
            setIsLoggedIn(true);
            setIsAdmin(!!userObj.user_metadata?.is_admin);
          }
        } catch (error) {
          console.error('Error parsing saved session:', error);
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
      
      setLoading(false);
    };
    
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Special case for hardcoded admin
      if (email === 'admin123' && password === 'admin@123') {
        const userObj: User = {
          id: 'admin-id',
          email: 'admin123',
          user_metadata: { is_admin: true }
        };
        
        const sessionObj: Session = {
          access_token: 'mock-token-' + Math.random().toString(36).substring(2),
          expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          user: userObj
        };
        
        // Save to state and localStorage
        setUser(userObj);
        setSession(sessionObj);
        setIsLoggedIn(true);
        setIsAdmin(true);
        
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionObj));
        
        toast.success('Signed in successfully!');
        return;
      }
      
      // Check against demo users
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      
      if (demoUser) {
        const userObj: User = {
          id: 'user-' + Math.random().toString(36).substring(2),
          email: demoUser.email,
          user_metadata: { is_admin: demoUser.isAdmin }
        };
        
        const sessionObj: Session = {
          access_token: 'mock-token-' + Math.random().toString(36).substring(2),
          expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          user: userObj
        };
        
        // Save to state and localStorage
        setUser(userObj);
        setSession(sessionObj);
        setIsLoggedIn(true);
        setIsAdmin(demoUser.isAdmin);
        
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionObj));
        
        toast.success('Signed in successfully!');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };

  const signup = async (email: string, password: string, userData?: { full_name?: string, phone?: string }) => {
    try {
      // Check if email already exists
      if (DEMO_USERS.some(u => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const userObj: User = {
        id: 'user-' + Math.random().toString(36).substring(2),
        email: email,
        user_metadata: { 
          ...userData,
          is_admin: false 
        }
      };
      
      const sessionObj: Session = {
        access_token: 'mock-token-' + Math.random().toString(36).substring(2),
        expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        user: userObj
      };
      
      // Save to state and localStorage
      setUser(userObj);
      setSession(sessionObj);
      setIsLoggedIn(true);
      setIsAdmin(false);
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionObj));
      
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear state and localStorage
      setUser(null);
      setSession(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, user, session, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
