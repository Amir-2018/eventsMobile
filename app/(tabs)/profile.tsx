import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getInitials } from './index';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { width } = Dimensions.get('window');

  // États pour les vraies données
  const [stats, setStats] = useState({
    eventsCreated: 0,
    eventsAttended: 0,
    loading: true
  });

  const [userEvents, setUserEvents] = useState([]);

  // Récupérer les vraies données au chargement
  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Récupérer tous les événements
      const eventsResponse = await apiService.getEvents();
      
      if (eventsResponse.success && eventsResponse.data) {
        const allEvents = eventsResponse.data;
        
        // Nombre total d'événements créés dans l'application
        const totalEventsCreated = allEvents.length;
        
        // Compter les événements auxquels l'utilisateur participe
        let attendedEvents = 0;
        const userRegisteredEvents = [];
        
        for (const event of allEvents) {
          // Vérifier si l'utilisateur est inscrit à cet événement
          const clientsResponse = await apiService.getEventClients(event.id);
          if (clientsResponse.success && clientsResponse.data) {
            const isRegistered = clientsResponse.data.some(client => client.id === user.id);
            if (isRegistered) {
              attendedEvents++;
              userRegisteredEvents.push(event);
            }
          }
        }
        
        setStats({
          eventsCreated: totalEventsCreated,
          eventsAttended: attendedEvents,
          loading: false
        });
        
        setUserEvents(userRegisteredEvents);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  const ProfileOption = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity 
      style={[styles.optionItem, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff' }]} 
      onPress={onPress}
    >
      <View style={styles.optionLeft}>
        <View style={[styles.optionIcon, { backgroundColor: theme === 'dark' ? '#3a3a3a' : '#f8f9fa' }]}>
          <Ionicons name={icon} size={22} color={theme === 'dark' ? '#ECEDEE' : '#333'} />
        </View>
        <View style={styles.optionText}>
          <Text style={[styles.optionTitle, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.optionSubtitle, { color: theme === 'dark' ? '#9BA1A6' : '#666' }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#9BA1A6' : '#666'} />
      )}
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#151718' : '#f5f5f5' }]}>
        <View style={styles.emptyState}>
          <Ionicons name="person-circle-outline" size={80} color={theme === 'dark' ? '#9BA1A6' : '#666'} />
          <Text style={[styles.noUserText, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
            Aucun utilisateur connecté
          </Text>
          <Text style={[styles.noUserSubtext, { color: theme === 'dark' ? '#9BA1A6' : '#666' }]}>
            Connectez-vous pour accéder à votre profil
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme === 'dark' ? '#151718' : '#f8f9fa' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header avec dégradé CSS */}
      <View style={[styles.header, { backgroundColor: '#4A90E2' }]}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.initials}>
                {getInitials(user.prenom, user.nom)}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {user.prenom} {user.nom}
          </Text>
          <Text style={styles.userEmail}>
            {user.email}
          </Text>
        </View>
      </View>

      {/* Statistiques */}
      <View style={[styles.statsContainer, { backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff' }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
            {stats.loading ? '...' : stats.eventsCreated}
          </Text>
          <Text style={[styles.statLabel, { color: theme === 'dark' ? '#9BA1A6' : '#666' }]}>
            Événements disponibles
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme === 'dark' ? '#3a3a3a' : '#e9ecef' }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
            {stats.loading ? '...' : stats.eventsAttended}
          </Text>
          <Text style={[styles.statLabel, { color: theme === 'dark' ? '#9BA1A6' : '#666' }]}>
            Participations
          </Text>
        </View>
      </View>

      {/* Options du profil */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
          Mes participations
        </Text>
        <View style={[styles.optionsContainer, { backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff' }]}>
          <ProfileOption
            icon="calendar"
            title="Événements auxquels je participe"
            subtitle={`${stats.eventsAttended} événements`}
            onPress={() => {/* Navigation vers mes événements */}}
          />
          <ProfileOption
            icon="time-outline"
            title="Historique des participations"
            subtitle="Voir tous mes événements passés"
            onPress={() => {/* Navigation vers historique */}}
          />
          <ProfileOption
            icon="notifications-outline"
            title="Notifications d'événements"
            subtitle="Gérer mes alertes"
            onPress={() => {/* Navigation vers notifications */}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
          Favoris
        </Text>
        <View style={[styles.optionsContainer, { backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff' }]}>
          <ProfileOption
            icon="star"
            title="Mes événements favoris"
            subtitle={`${stats.eventsAttended} événements inscrits`}
            onPress={() => {/* Navigation vers événements favoris */}}
          />
          <ProfileOption
            icon="color-palette-outline"
            title="Thème"
            subtitle={theme === 'dark' ? 'Mode sombre' : 'Mode clair'}
            onPress={() => {/* Toggle theme */}}
          />
          <ProfileOption
            icon="language-outline"
            title="Langue"
            subtitle="Français"
            onPress={() => {/* Sélection langue */}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme === 'dark' ? '#ECEDEE' : '#333' }]}>
          Support
        </Text>
        <View style={[styles.optionsContainer, { backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff' }]}>
          <ProfileOption
            icon="help-circle-outline"
            title="Aide et support"
            subtitle="FAQ et contact"
            onPress={() => {/* Navigation vers aide */}}
          />
        </View>
      </View>

      {/* Bouton de déconnexion */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme === 'dark' ? '#3a1a1a' : '#fee' }]} 
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#dc2626" />
          <Text style={[styles.logoutText, { color: '#dc2626' }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noUserText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  noUserSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  initials: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
  },
  userName: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  section: {
    marginTop: 32,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  optionsContainer: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});

