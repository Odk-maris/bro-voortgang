
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserByCredentials, getUserById } from '../utils/mockData';
import { toast } from 'sonner';

interface User {
  id: number;
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
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const foundUser = getUserById(parsedUser.id);
          if (foundUser) {
            setUser({
              id: foundUser.id,
              username: foundUser.username,
              name: foundUser.name,
              role: foundUser.role as 'student' | 'teacher' | 'admin',
              ...(foundUser.role === 'student' && { groep: foundUser.groep })
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
    
    // Simulate network request
    return new Promise(resolve => {
      setTimeout(() => {
        try {
          const foundUser = getUserByCredentials(username, password);
          if (foundUser) {
            const userData = {
              id: foundUser.id,
              username: foundUser.username,
              name: foundUser.name,
              role: foundUser.role as 'student' | 'teacher' | 'admin',
              ...(foundUser.role === 'student' && { groep: foundUser.groep })
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            toast.success('Login successful', {
              description: `Welcome back, ${foundUser.name}!`,
            });
            
            // Redirect based on role
            if (userData.role === 'student') {
              navigate('/student');
            } else if (userData.role === 'teacher') {
              navigate('/teacher');
            } else if (userData.role === 'admin') {
              navigate('/admin');
            }
            
            resolve(true);
          } else {
            toast.error('Login failed', {
              description: 'Invalid username or password',
            });
            resolve(false);
          }
        } catch (error) {
          toast.error('Login failed', {
            description: 'An error occurred during login',
          });
          resolve(false);
        } finally {
          setLoading(false);
        }
      }, 800); // Simulate network delay
    });
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
