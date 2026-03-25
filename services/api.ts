import { Platform } from 'react-native';

// Workaround for TypeScript module resolution issue
const SecureStore = require('expo-secure-store');

// Configuration de l'API selon l'environnement
const getBaseURL = () => {
  if (__DEV__) {
    // Utiliser l'IP du PC pour permettre la connexion depuis l'appareil mobile
    return 'http://192.168.43.219:3000';
  }
  return 'http://localhost:3000';
};

const BASE_URL = getBaseURL();
console.log('🌐 API Base URL:', BASE_URL, 'Platform:', Platform.OS);

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  tel: string;
}

export interface Event {
  id: string;
  nom: string;
  date: string;
  image?: string;
  adresse?: string;
  created_at: string;
  updated_at: string;
  clients?: User[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

class ApiService {
  private async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('userToken');
  }

  private async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('userToken', token);
  }

  private async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync('userToken');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const url = `${BASE_URL}${endpoint}`;
    console.log('🚀 API Request:', {
      method: config.method || 'GET',
      url,
      headers: config.headers,
      body: config.body,
    });

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log('📥 API Response:', {
        status: response.status,
        url,
        data,
      });
      
      if (response.status === 401) {
        await this.removeToken();
      }
      
      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  // Authentification
  async register(userData: {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.makeRequest<{ user: User; token: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );

    if (response.success && response.data?.token) {
      await this.setToken(response.data.token);
    }

    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.makeRequest<{ user: User; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data?.token) {
      await this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  // Événements
  async getEvents(): Promise<ApiResponse<Event[]>> {
    return this.makeRequest<Event[]>('/api/events');
  }

  async getEvent(eventId: string): Promise<ApiResponse<Event>> {
    return this.makeRequest<Event>(`/api/events/${eventId}`);
  }

  async createEvent(eventData: {
    nom: string;
    date?: string;
    image?: string;
    adresse?: string;
  }): Promise<ApiResponse<Event>> {
    return this.makeRequest<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async registerToEvent(eventId: string): Promise<ApiResponse<{
    registered: boolean;
    alreadyRegistered: boolean;
    registration?: any;
  }>> {
    return this.makeRequest(`/api/events/${eventId}/register`, {
      method: 'POST',
    });
  }

  async getEventClients(eventId: string): Promise<ApiResponse<User[]>> {
    return this.makeRequest<User[]>(`/api/events/${eventId}/clients`);
  }

  // Upload d'image
  async uploadImage(imageUri: string): Promise<ApiResponse<{
    filename: string;
    originalName: string;
    size: number;
    url: string;
  }>> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);

    try {
      const token = await this.getToken();
      const response = await fetch(`${BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'upload de l\'image',
      };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const apiService = new ApiService();