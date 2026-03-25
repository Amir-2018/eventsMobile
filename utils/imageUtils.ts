/**
 * Utilitaires pour la gestion des images dans l'application
 */

export interface ImageSource {
  uri: string;
}

/**
 * Convertit une chaîne d'image (URL ou base64) en source d'image utilisable par React Native
 * @param imageData - Données d'image (URL, base64 avec ou sans préfixe)
 * @returns Source d'image formatée ou null si invalide
 */
export const getImageSource = (imageData: string | undefined): ImageSource | null => {
  if (!imageData) return null;
  
  // Si l'image est déjà une URL complète, l'utiliser directement
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return { uri: imageData };
  }
  
  // Si l'image est en base64, vérifier si elle a déjà le préfixe data:image
  if (imageData.startsWith('data:image/')) {
    return { uri: imageData };
  }
  
  // Si c'est juste la chaîne base64 sans préfixe, ajouter le préfixe
  if (imageData.length > 50) { // Vérification basique pour s'assurer que c'est du base64
    return { uri: `data:image/jpeg;base64,${imageData}` };
  }
  
  return null;
};

/**
 * Vérifie si une chaîne est une image base64 valide
 * @param imageData - Données à vérifier
 * @returns true si c'est du base64 valide
 */
export const isBase64Image = (imageData: string): boolean => {
  if (!imageData) return false;
  
  // Vérifier si c'est déjà formaté avec le préfixe data:image
  if (imageData.startsWith('data:image/')) return true;
  
  // Vérifier si c'est une chaîne base64 brute (longueur minimale et caractères valides)
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return imageData.length > 50 && base64Regex.test(imageData);
};

/**
 * Convertit une image base64 en format data URI
 * @param base64String - Chaîne base64 (avec ou sans préfixe)
 * @param mimeType - Type MIME de l'image (par défaut: image/jpeg)
 * @returns Data URI formatée
 */
export const base64ToDataUri = (base64String: string, mimeType: string = 'image/jpeg'): string => {
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  return `data:${mimeType};base64,${base64String}`;
};