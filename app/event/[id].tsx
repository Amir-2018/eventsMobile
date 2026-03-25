import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Event, User } from '@/services/api';
import { getImageSource } from '@/utils/imageUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
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

  const getInitials = (prenom: string, nom: string) => {
    const firstLetter = prenom ? prenom.charAt(0).toUpperCase() : '';
    const lastLetter = nom ? nom.charAt(0).toUpperCase() : '';
    return firstLetter + lastLetter;
  };

  const renderClientItem = ({ item }: { item: User }) => (
    <View style={styles.clientCard}>
      <View style={styles.clientAvatar}>
        <Text style={styles.clientInitials}>{getInitials(item.prenom, item.nom)}</Text>
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.prenom} {item.nom}</Text>
        <Text style={styles.clientEmail}>{item.email}</Text>
      </View>
      {isUserRegistered() && item.id === user?.id && (
        <View style={styles.meBadge}>
          <Text style={styles.meBadgeText}>Moi</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.imageContainer}>
          {event.image ? (
            <Image source={getImageSource(event.image) || { uri: event.image }} style={styles.eventImage} />
          ) : (
            <View style={[styles.eventImage, styles.placeholderImage]}>
              <MaterialCommunityIcons name="image-off-outline" size={60} color="#DDD" />
            </View>
          )}
          <View style={styles.imageOverlay} />
          
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.eventTitle}>{event.nom}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#4A90E2" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Date et Heure</Text>
              <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="#4A90E2" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Lieu</Text>
              <Text style={styles.infoValue}>{event.adresse || 'Lieu non spécifié'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons name="account-group" size={24} color="#4A90E2" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Inscriptions</Text>
              <Text style={styles.infoValue}>{clients.length} participant(s) inscrit(s)</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              isUserRegistered() && styles.registeredButton
            ]}
            onPress={handleRegisterToEvent}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name={isUserRegistered() ? "check-circle" : "plus-circle"} 
              size={24} 
              color="white" 
              style={styles.btnIcon} 
            />
            <Text style={styles.registerButtonText}>
              {isUserRegistered() ? 'Vous êtes inscrit' : 'S\'inscrire à l\'événement'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.participantsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{clients.length}</Text>
              </View>
            </View>
            
            {clients.length > 0 ? (
              <FlatList
                data={clients}
                renderItem={renderClientItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.clientList}
              />
            ) : (
              <View style={styles.emptyParticipants}>
                <MaterialCommunityIcons name="account-search-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>Aucun participant pour le moment</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    width: '100%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  contentCard: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#4A90E2',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registeredButton: {
    backgroundColor: '#28A745',
    shadowColor: '#28A745',
  },
  btnIcon: {
    marginRight: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 30,
  },
  participantsSection: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  countBadge: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countBadgeText: {
    color: '#4A90E2',
    fontWeight: '700',
    fontSize: 14,
  },
  clientList: {
    paddingBottom: 20,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#A0C4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientInitials: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  clientEmail: {
    fontSize: 13,
    color: '#666',
  },
  meBadge: {
    backgroundColor: '#E7F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  meBadgeText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyParticipants: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: 14,
  },
});
lor: '#666',
  },
});