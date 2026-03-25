import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await apiService.isAuthenticated();
      if (!isAuth) {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔑 AuthContext login called with:', { email, password: '***' });
    
    try {
      const response = await apiService.login({ email, password });
      console.log('🔄 AuthContext login response:', response);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        console.log('👤 User set in context:', response.data.user);
        return { success: true };
      } else {
        console.log('❌ Login failed in AuthContext:', response.message);
        return { 
          success: false, 
          message: response.message || 'Erreur de connexion' 
        };
      }
    } catch (error) {
      console.error('💥 AuthContext login error:', error);
      return { 
        success: false, 
        message: 'Erreur de connexion au serveur' 
      };
    }
  };

  const register = async (userData: {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    password: string;
  }) => {
    try {
      const response = await apiService.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Erreur lors de l\'inscription' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Erreur de connexion au serveur' 
      };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};