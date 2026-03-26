import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FavoritesTabIconProps {
  color: string;
  size?: number;
}

export function FavoritesTabIcon({ color, size = 28 }: FavoritesTabIconProps) {
  const { user } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadFavoritesCount();
    } else {
      setFavoritesCount(0);
    }
  }, [user]);

  const loadFavoritesCount = async () => {
    try {
      const eventsResponse = await apiService.getEvents();
      
      if (eventsResponse.success && eventsResponse.data) {
        const allEvents = eventsResponse.data;
        let count = 0;
        
        for (const event of allEvents) {
          const clientsResponse = await apiService.getEventClients(event.id);
          if (clientsResponse.success && clientsResponse.data) {
            const isRegistered = clientsResponse.data.some(client => client.id === user?.id);
            if (isRegistered) {
              count++;
            }
          }
        }
        
        setFavoritesCount(count);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de favoris:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="star" size={size} color={color} />
      {favoritesCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {favoritesCount > 99 ? '99+' : favoritesCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});