import { useAuth } from '@/contexts/AuthContext';
import { apiService, Event, User } from '@/services/api';
import { getImageSource } from '@/utils/imageUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user, logout } = useAuth();
  const router = useRouter();

  const loadEvents = async () => {
    try {
      const response = await apiService.getEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les événements');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents();
  }, []);

  const handleEventPress = (event: Event) => {
    router.push(`/event/${event.id}`);
  };

  const handleRegisterToEvent = async (eventId: string) => {
    try {
      const response = await apiService.registerToEvent(eventId);
      
      if (response.success) {
        if (response.data?.alreadyRegistered) {
          Alert.alert('Information', 'Vous êtes déjà inscrit à cet événement');
        } else {
          Alert.alert('Succès', 'Inscription réussie !');
          loadEvents(); // Refresh to show updated registration
        }
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUserRegistered = (event: Event) => {
    return event.clients?.some(client => client.id === user?.id);
  };

  const getInitials = (prenom: string, nom: string) => {
    const firstLetter = prenom ? prenom.charAt(0).toUpperCase() : '';
    const lastLetter = nom ? nom.charAt(0).toUpperCase() : '';
    return firstLetter + lastLetter;
  };

  const renderParticipantCircle = (participant: User, index: number) => (
    <View key={participant.id} style={[styles.participantCircle, { marginLeft: index > 0 ? -8 : 0 }]}>
      <Text style={styles.participantInitials}>
        {getInitials(participant.prenom, participant.nom)}
      </Text>
    </View>
  );

  const renderEventItem = ({ item }: { item: Event }) => {
    const imageSource = getImageSource(item.image);
    
    return (
      <View style={styles.eventCard}>
        {imageSource && (
          <Image source={imageSource} style={styles.eventImage} />
        )}
        
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.nom}</Text>
          
          {item.date && (
            <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
          )}
          
          {item.adresse && (
            <Text style={styles.eventAddress}>{item.adresse}</Text>
          )}
          
          <View style={styles.participantsSection}>
            <Text style={styles.participantsCount}>
              {item.clients?.length || 0} participant(s)
            </Text>
            
            {item.clients && item.clients.length > 0 && (
              <View style={styles.participantsContainer}>
                {item.clients.slice(0, 5).map((participant, index) => 
                  renderParticipantCircle(participant, index)
                )}
                {item.clients.length > 5 && (
                  <View style={[styles.participantCircle, styles.moreParticipants, { marginLeft: -8 }]}>
                    <Text style={styles.participantInitials}>+{item.clients.length - 5}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => handleEventPress(item)}
            >
              <Text style={styles.detailsButtonText}>Voir détails</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.registerButton,
                isUserRegistered(item) && styles.registeredButton
              ]}
              onPress={() => handleRegisterToEvent(item.id)}
            >
              <Text style={[
                styles.registerButtonText,
                isUserRegistered(item) && styles.registeredButtonText
              ]}>
                {isUserRegistered(item) ? 'Inscrit' : 'S\'inscrire'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Chargement des événements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userProfile}>
          <View style={[styles.participantCircle, styles.userAvatar]}>
            <Text style={styles.participantInitials}>
              {user ? getInitials(user.prenom, user.nom) : '??'}
            </Text>
          </View>
          <View>
            <Text style={styles.welcomeLabel}>Bonjour,</Text>
            <Text style={styles.userName}>{user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Événements disponibles</Text>
      
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#4A90E2',
    borderWidth: 0,
  },
  welcomeLabel: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  eventAddress: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  participantsSection: {
    marginBottom: 16,
  },
  participantsCount: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  moreParticipants: {
    backgroundColor: '#666',
  },
  participantInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  registeredButton: {
    backgroundColor: '#28A745',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registeredButtonText: {
    color: 'white',
  },
});