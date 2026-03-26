import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService, Event } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FavoritesScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserEvents();
    }
  }, [user]);

  const loadUserEvents = async () => {
    try {
      setLoading(true);
      const eventsResponse = await apiService.getEvents();
      
      if (eventsResponse.success && eventsResponse.data) {
        const allEvents = eventsResponse.data;
        const userRegisteredEvents = [];
        
        for (const event of allEvents) {
          const clientsResponse = await apiService.getEventClients(event.id);
          if (clientsResponse.success && clientsResponse.data) {
            const isRegistered = clientsResponse.data.some(client => client.id === user?.id);
            if (isRegistered) {
              userRegisteredEvents.push(event);
            }
          }
        }
        
        setUserEvents(userRegisteredEvents);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  const EventCard = ({ event }: { event: Event }) => (
    <TouchableOpacity 
      style={[styles.eventCard, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff' }]}
      onPress={() => router.push(`/event/${event.id}`)}
    >
      {event.image && (
        <Image source={{ uri: event.image }} style={styles.eventImage} />
      )}
      <View style={styles.eventContent}>
        <Text style={[styles.eventTitle, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
          {event.nom}
        </Text>
        {event.date && (
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color={theme === 'dark' ? '#9BA1A6' : '#666'} />
            <Text style={[styles.eventDate, { color: theme === 'dark' ? '#9BA1A6' : '#666' }]}>
              {new Date(event.date).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        )}
        {event.adresse && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={theme === 'dark' ? '#9BA1A6' : '#666'} />
            <Text style={[styles.eventLocation, { color: theme === 'dark' ? '#9BA1A6' : '#666' }]}>
              {event.adresse}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.favoriteIcon}>
        <Ionicons name="star" size={20} color="#FFD700" />
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#151718' : '#f8f9fa' }]}>
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={80} color={theme === 'dark' ? '#9BA1A6' : '#666'} />
          <Text style={[styles.emptyTitle, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
            Connectez-vous
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme === 'dark' ? '#9BA1A6' : '#666' }]}>
            Connectez-vous pour voir vos événements favoris
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#151718' : '#f8f9fa' }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
          Mes Favoris
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme === 'dark' ? '#9BA1A6' : '#666' }]}>
          {userEvents.length} événement{userEvents.length !== 1 ? 's' : ''} inscrit{userEvents.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={[styles.loadingText, { color: theme === 'dark' ? '#9BA1A6' : '#666' }]}>
            Chargement de vos favoris...
          </Text>
        </View>
      ) : userEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={80} color={theme === 'dark' ? '#9BA1A6' : '#666'} />
          <Text style={[styles.emptyTitle, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
            Aucun favori
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme === 'dark' ? '#9BA1A6' : '#666' }]}>
            Vous n'êtes inscrit à aucun événement pour le moment
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.exploreButtonText}>Explorer les événements</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.eventsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.eventsContainer}
        >
          {userEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  exploreButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
  },
  eventsContainer: {
    padding: 20,
    gap: 16,
  },
  eventCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  eventDate: {
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventLocation: {
    fontSize: 14,
    flex: 1,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});