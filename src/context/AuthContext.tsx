
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  groep?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Fetch the user from Supabase to ensure it's still valid
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', parsedUser.id)
            .single();
            
          if (data && !error) {
            setUser({
              id: data.id,
              username: data.username,
              name: data.name,
              role: data.role,
              ...(data.role === 'student' && { groep: data.groep })
            });
          } else {
            localStorage.removeItem('user');
          }
        } catch (error) {
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Query Supabase for the user with matching credentials
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)  // Note: In a production app, you should use proper password hashing
        .single();
      
      if (data && !error) {
        const userData = {
          id: data.id,
          username: data.username,
          name: data.name,
          role: data.role,
          ...(data.role === 'student' && { groep: data.groep })
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        toast.success('Login successful', {
          description: `Welcome back, ${data.name}!`,
        });
        
        // Redirect based on role
        if (data.role === 'student') {
          navigate('/student');
        } else if (data.role === 'teacher') {
          navigate('/teacher');
        } else if (data.role === 'admin') {
          navigate('/admin');
        }
        
        return true;
      } else {
        toast.error('Login failed', {
          description: 'Invalid username or password',
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: 'An error occurred during login',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
