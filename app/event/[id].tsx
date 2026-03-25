import { useAuth } from '@/contexts/AuthContext';
import { apiService, Event, User } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EventDetailScreen() {
  const [event, setEvent] = useState<Event | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadEventDetails();
      loadEventClients();
    }
  }, [id]);

  const loadEventDetails = async () => {
    try {
      const response = await apiService.getEvent(id!);
      if (response.success && response.data) {
        setEvent(response.data);
      } else {
        Alert.alert('Erreur', 'Événement non trouvé');
        router.back();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventClients = async () => {
    try {
      const response = await apiService.getEventClients(id!);
      if (response.success && response.data) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleRegisterToEvent = async () => {
    try {
      const response = await apiService.registerToEvent(id!);
      
      if (response.success) {
        if (response.data?.alreadyRegistered) {
          Alert.alert('Information', 'Vous êtes déjà inscrit à cet événement');
        } else {
          Alert.alert('Succès', 'Inscription réussie !');
          loadEventDetails();
          loadEventClients();
        }
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUserRegistered = () => {
    return clients.some(client => client.id === user?.id);
  };

  const renderClientItem = ({ item }: { item: User }) => (
    <View style={styles.clientCard}>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.prenom} {item.nom}</Text>
        <Text style={styles.clientEmail}>{item.email}</Text>
        {item.tel && <Text style={styles.clientPhone}>{item.tel}</Text>}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centerContainer}>
        <Text>Événement non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>

      {event.image && (
        <Image source={{ uri: event.image }} style={styles.eventImage} />
      )}

      <View style={styles.content}>
        <Text style={styles.eventTitle}>{event.nom}</Text>
        
        {event.date && (
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Date et heure</Text>
            <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
          </View>
        )}
        
        {event.adresse && (
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Adresse</Text>
            <Text style={styles.infoValue}>{event.adresse}</Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Participants</Text>
          <Text style={styles.infoValue}>{clients.length} inscrit(s)</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.registerButton,
            isUserRegistered() && styles.registeredButton
          ]}
          onPress={handleRegisterToEvent}
        >
          <Text style={[
            styles.registerButtonText,
            isUserRegistered() && styles.registeredButtonText
          ]}>
            {isUserRegistered() ? 'Déjà inscrit' : 'S\'inscrire à cet événement'}
          </Text>
        </TouchableOpacity>

        {clients.length > 0 && (
          <View style={styles.participantsSection}>
            <Text style={styles.participantsTitle}>Liste des participants</Text>
            <FlatList
              data={clients}
              renderItem={renderClientItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  registeredButton: {
    backgroundColor: '#28A745',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registeredButtonText: {
    color: 'white',
  },
  participantsSection: {
    marginTop: 20,
  },
  participantsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  clientCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 14,
    color: '#666',
  },
});