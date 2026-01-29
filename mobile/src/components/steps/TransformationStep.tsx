import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useWizard } from '../../context/WizardContext';
import { transformToToddlerCaricature } from '../../services/GeminiService';
import { Wand2, ChevronLeft, Sparkles, Pencil } from 'lucide-react-native';

export function TransformationStep() {
  const {
    originalImage,
    setGeneratedImage,
    goNext,
    goBack,
    isProcessing,
    setIsProcessing,
  } = useWizard();

  const [error, setError] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState("Trazando líneas...");

  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isProcessing) {
      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Phrase bounce animation
      const startBounce = () => {
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -5, duration: 400, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start(() => {
          if (isProcessing) startBounce();
        });
      };
      startBounce();

      const phrases = [
        "Afilando el lápiz...",
        "Buscando mi goma de borrar...",
        "¡Qué perfil tan interesante!",
        "Mmm... esa nariz es un reto...",
        "Añadiendo un poco de magia...",
        "¡No te muevas!",
        "Capturando tu esencia...",
        "Dibujando como Picasso...",
        "¡Casi termino! Solo falta el bigote...",
      ];

      let index = 0;
      setLoadingPhrase(phrases[0]);

      const interval = setInterval(() => {
        index = (index + 1) % phrases.length;
        setLoadingPhrase(phrases[index]);
      }, 2500);

      return () => {
        clearInterval(interval);
        rotateAnim.stopAnimation();
        bounceAnim.stopAnimation();
      };
    }
  }, [isProcessing]);

  const handleTransform = async () => {
    if (!originalImage) return;

    setError(null);
    setIsProcessing(true);

    try {
      const result = await transformToToddlerCaricature(originalImage);
      setGeneratedImage(result);
      goNext();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al transformar la imagen");
      setIsProcessing(false);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        {originalImage && (
          <Image source={{ uri: originalImage }} style={styles.preview} />
        )}
        <View style={styles.sketchOverlay} pointerEvents="none" />
        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Sparkles color="#000" size={80} />
            </Animated.View>
          </View>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {!isProcessing && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={goBack}
            activeOpacity={0.7}
          >
            <ChevronLeft color="#000" size={32} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.primaryBtn,
            isProcessing && styles.processingBtn
          ]}
          onPress={handleTransform}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View style={styles.btnContent}>
              <Wand2 color="#000" size={32} />
              <Text style={[styles.btnText, { color: '#000' }]}>¡MAGIA!</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isProcessing && (
        <Animated.View style={[styles.loadingBox, { transform: [{ translateY: bounceAnim }] }]}>
          <Pencil color="#000" size={20} style={{ marginRight: 10 }} />
          <Text style={styles.loadingText}>{loadingPhrase}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 4,
    borderColor: '#000',
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  preview: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  sketchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.2)',
    // In a real app we'd use a pattern image here for fixed grain
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  actionBtn: {
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#FFDD00', // Web Yellow
  },
  secondaryBtn: {
    width: 70,
    backgroundColor: '#fff',
  },
  processingBtn: {
    backgroundColor: '#fff',
    borderColor: '#666',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#F44336',
    borderRadius: 10,
    marginBottom: 15,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 12,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    fontStyle: 'italic',
  },
});
