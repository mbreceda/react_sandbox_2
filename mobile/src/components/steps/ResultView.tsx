import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Dimensions,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useWizard } from '../../context/WizardContext';
import { RotateCcw, Share2, Mail, Download, Sparkles } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

export function ResultView() {
  const { originalImage, generatedImage, reset } = useWizard();

  // Animation values
  const stampOpacity = useRef(new Animated.Value(0)).current;
  const stampScale = useRef(new Animated.Value(2)).current;
  const resultScale = useRef(new Animated.Value(0.9)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation for the whole view
    Animated.parallel([
      Animated.timing(resultOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(resultScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    // Delayed stamp animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(stampOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(stampScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
      ]).start();
    }, 1200);
  }, []);

  const handleShare = async () => {
    if (!generatedImage) return;

    try {
      // 1. Prepare filename and path
      const filename = `caricatura_${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      // 2. Clean base64 data (strip prefix)
      const base64Data = generatedImage.replace(/^data:image\/\w+;base64,/, "");

      // 3. Write to temporary file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 4. Share the local file URI
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Compartir mi Caricatura',
        });
      } else {
        Share.share({
          url: fileUri,
          message: '¡Mira mi caricatura hecha con Photobooth AI!',
        });
      }
    } catch (error) {
      console.error("Error al compartir imagen:", error);
      alert("No se pudo compartir la imagen. Intenta de nuevo.");
    }
  };

  const handleEmail = async () => {
    // Simple mailto for mobile
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.imageStack, { opacity: resultOpacity, transform: [{ scale: resultScale }] }]}>
          <View style={styles.comparisonHeader}>
            <Sparkles color="#000" size={20} />
            <Text style={styles.comparisonTitle}>¡Obra Maestra Lista!</Text>
            <Sparkles color="#000" size={20} />
          </View>

          <View style={styles.resultMainContainer}>
            <View style={styles.imageWrapper}>
              <View style={styles.labelRibbon}>
                <Text style={styles.label}>TÚ</Text>
              </View>
              <Image
                source={{ uri: originalImage || '' }}
                style={styles.resultImageSmall}
                contentFit="cover"
              />
            </View>

            <View style={styles.generatedWrapper}>
              <View style={[styles.labelRibbon, styles.labelRibbonGold]}>
                <Text style={styles.label}>CARICATURA</Text>
              </View>
              <Image
                source={{ uri: generatedImage || '' }}
                style={styles.resultImageLarge}
                contentFit="cover"
              />

              {/* Signature Stamp Animation */}
              <Animated.View style={[
                styles.stampContainer,
                { opacity: stampOpacity, transform: [{ scale: stampScale }, { rotate: '-15deg' }] }
              ]}>
                <View style={styles.stamp}>
                  <Text style={styles.stampText}>APROBADO</Text>
                  <Text style={styles.stampSubText}>BY ARTIST</Text>
                </View>
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.resetBtn]} onPress={reset}>
            <RotateCcw color="#fff" size={24} style={{ marginBottom: 5 }} />
            <Text style={styles.actionLabel}>REINTENTAR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={handleShare}>
            <Share2 color="#000" size={24} style={{ marginBottom: 5 }} />
            <Text style={[styles.actionLabel, styles.actionLabelBlack]}>COMPARTIR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.emailBtn]} onPress={handleEmail}>
            <Mail color="#fff" size={24} style={{ marginBottom: 5 }} />
            <Text style={styles.actionLabel}>EMAIL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfettiCannon
        count={200}
        origin={{ x: width / 2, y: 0 }}
        autoStart={true}
        fadeOut={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  imageStack: {
    marginTop: 10,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
  },
  resultMainContainer: {
    gap: 20,
  },
  imageWrapper: {
    width: '40%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#eee',
    position: 'relative',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  generatedWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#f9f9f9',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  labelRibbon: {
    position: 'absolute',
    top: -10,
    left: -10,
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  labelRibbonGold: {
    backgroundColor: '#000',
  },
  label: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  resultImageSmall: {
    width: '100%',
    height: '100%',
  },
  resultImageLarge: {
    width: '100%',
    height: '100%',
  },
  stampContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 20,
  },
  stamp: {
    borderWidth: 4,
    borderColor: '#F44336',
    borderRadius: 10,
    padding: 10,
    transform: [{ rotate: '5deg' }],
  },
  stampText: {
    color: '#F44336',
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  stampSubText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: -5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 10,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  resetBtn: {
    backgroundColor: '#FF0033', // Web Red
  },
  shareBtn: {
    backgroundColor: '#FFDD00', // Web Yellow
  },
  emailBtn: {
    backgroundColor: '#0044FF', // Web Blue
    borderColor: '#000',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
  },
  actionLabelBlack: {
    color: '#000',
  },
});
