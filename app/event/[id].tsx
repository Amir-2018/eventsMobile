import { useAuth } from '@/contexts/AuthContext';
import { apiService, Event, User } from '@/services/api';
import { getImageSource } from '@/utils/imageUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const [event, setEvent] = useState<Event | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = new Animated.Value(0);
  
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

  const getInitials = (prenom?: string, nom?: string) => {
    if (!prenom && !nom) return '??';
    
    let initials = '';
    
    if (prenom && prenom.trim().length > 0) {
      initials += prenom.trim().charAt(0).toUpperCase();
    }
    
    if (nom && nom.trim().length > 0) {
      initials += nom.trim().charAt(0).toUpperCase();
    }
    
    // Si on n'a qu'une seule lettre, on essaie de prendre la deuxième du même mot
    if (initials.length === 1) {
      if (prenom && prenom.trim().length > 1) {
        initials += prenom.trim().charAt(1).toUpperCase();
      } else if (nom && nom.trim().length > 1) {
        initials += nom.trim().charAt(1).toUpperCase();
      } else {
        initials += initials; // Double la lettre si pas d'autre option
      }
    }
    
    return initials || '??';
  };

  const renderClientItem = ({ item, index }: { item: User; index: number }) => (
    <Animated.View 
      style={[
        styles.clientCard,
        {
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, -index * 2],
              extrapolate: 'clamp',
            })
          }]
        }
      ]}
    >
      <View style={[styles.clientAvatar, { backgroundColor: getAvatarColor(index) }]}>
        <Text style={styles.clientInitials}>{getInitials(item.prenom, item.nom)}</Text>
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.prenom} {item.nom}</Text>
        <Text style={styles.clientEmail}>{item.email}</Text>
      </View>
      {isUserRegistered() && item.id === user?.id && (
        <View style={styles.meBadge}>
          <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
          <Text style={styles.meBadgeText}>Moi</Text>
        </View>
      )}
    </Animated.View>
  );

  const getAvatarColor = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[index % colors.length];
  };

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
      
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.imageContainer}>
          {event.image ? (
            <Image source={getImageSource(event.image) || { uri: event.image }} style={styles.eventImage} />
          ) : (
            <View style={[styles.eventImage, styles.placeholderImage]}>
              <MaterialCommunityIcons name="calendar-star" size={80} color="#DDD" />
            </View>
          )}
          <View style={styles.imageOverlay} />
          
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.floatingTitle}>
            <Text style={styles.floatingTitleText} numberOfLines={2}>
              {event.nom}
            </Text>
          </View>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.nom}</Text>
            <View style={styles.eventBadge}>
              <MaterialCommunityIcons name="calendar-check" size={16} color="#4A90E2" />
              <Text style={styles.eventBadgeText}>Événement</Text>
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Date et Heure</Text>
                <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#4ECDC4" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Lieu</Text>
                <Text style={styles.infoValue}>{event.adresse || 'Lieu non spécifié'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="account-group" size={24} color="#96CEB4" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Participants</Text>
                <Text style={styles.infoValue}>{clients.length} inscrit{clients.length > 1 ? 's' : ''}</Text>
              </View>
            </View>
          </View>

          {!isUserRegistered() && (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegisterToEvent}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons 
                  name="plus-circle" 
                  size={24} 
                  color="white" 
                />
                <Text style={styles.registerButtonText}>
                  Rejoindre l'événement
                </Text>
              </View>
              <View style={styles.buttonShine} />
            </TouchableOpacity>
          )}

          {isUserRegistered() && (
            <View style={styles.registeredStatus}>
            
              <Text style={styles.registeredStatusText}>
                Vous participez à cet événement
              </Text>
            </View>
          )}

          <View style={styles.participantsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialCommunityIcons name="account-multiple" size={24} color="#1A1A1A" />
                <Text style={styles.sectionTitle}>Participants</Text>
              </View>
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
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyParticipants}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="account-plus-outline" size={64} color="#E0E0E0" />
                </View>
                <Text style={styles.emptyTitle}>Soyez le premier !</Text>
                <Text style={styles.emptyText}>Aucun participant pour le moment</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>
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
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    height: 320,
    width: '100%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backdropFilter: 'blur(10px)',
  },
  floatingTitle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    backdropFilter: 'blur(20px)',
  },
  floatingTitleText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contentCard: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  eventTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    lineHeight: 34,
    marginRight: 12,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eventBadgeText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  infoContainer: {
    backgroundColor: '#FAFBFC',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    lineHeight: 22,
  },
  registerButton: {
    backgroundColor: '#4A90E2',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  registeredStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FFF8',
    height: 64,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#28A745',
  },
  registeredStatusText: {
    color: '#28A745',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  participantsSection: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 32,
    alignItems: 'center',
  },
  countBadgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  clientList: {
    paddingBottom: 20,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clientInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  meBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  meBadgeText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  emptyParticipants: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 8,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
});