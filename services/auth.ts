import { apiService } from './api';
import { User } from '../types';

export const getUserProfile = async (): Promise<{ success: boolean; data?: User; message?: string }> => {
  try {
    const response = await fetch('http://192.168.43.219:3000/api/auth/1');
    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        data: data.data
      };
    } else {
      return {
        success: false,
        message: data.message || 'Erreur de chargement du profil'
      };
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    return {
      success: false,
      message: 'Erreur de connexion'
    };
  }
};

