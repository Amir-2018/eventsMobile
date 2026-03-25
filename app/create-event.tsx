import { apiService } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CreateEventScreen() {
  const [formData, setFormData] = useState({
    nom: '',
    date: '',
    adresse: '',
    image: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      const response = await apiService.uploadImage(imageUri);
      if (response.success && response.data) {
        return response.data.url;
      }
      return null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.nom.trim()) {
      Alert.alert('Erreur', 'Le nom de l\'événement est requis');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = '';
      
      // Upload image if selected
      if (selectedImage) {
        const uploadedUrl = await uploadImage(selectedImage);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const eventData = {
        nom: formData.nom.trim(),
        ...(formData.date && { date: new Date(formData.date).toISOString() }),
        ...(formData.adresse && { adresse: formData.adresse.trim() }),
        ...(imageUrl && { image: imageUrl }),
      };

      const response = await apiService.createEvent(eventData);
      
      if (response.success) {
        Alert.alert('Succès', 'Événement créé avec succès !', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Créer un événement</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom de l'événement *</Text>
            <TextInput
              style={styles.input}
              value={formData.nom}
              onChangeText={(value) => handleInputChange('nom', value)}
              placeholder="Nom de votre événement"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(value) => handleInputChange('date', value)}
              placeholder="2026-04-01T17:00:00"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Adresse (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={formData.adresse}
              onChangeText={(value) => handleInputChange('adresse', value)}
              placeholder="Adresse de l'événement"
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Image (optionnel)</Text>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>Choisir une image</Text>
            </TouchableOpacity>
            
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCreateEvent}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Création...' : 'Créer l\'événement'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
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
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonText: {
    color: '#333',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});