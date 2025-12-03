import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/auth';
import { membersService } from '../services/members';
import { components } from '../types/schema';

type LoginRequest = components['schemas']['LoginRequest'];

interface AuthContextType {
  user: User | null;
  login: (data: LoginRequest) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await membersService.getProfile();
          setUser({
            name: profile.full_name,
            email: profile.email,
            role: profile.role === 'admin' ? UserRole.ADMIN : UserRole.MEMBER,
            avatar: '', // Placeholder
          });
        } catch (error) {
          console.error('Failed to fetch profile', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data);
    localStorage.setItem('token', response.access_token);

    const profile = await membersService.getProfile();
    const newUser: User = {
      name: profile.full_name,
      email: profile.email,
      role: profile.role === 'admin' ? UserRole.ADMIN : UserRole.MEMBER,
      avatar: '',
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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