import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useWizard } from '../../context/WizardContext';
import { Camera, RotateCw, Check, X, Upload, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export function PhotoCapture() {
  const { setOriginalImage, goNext } = useWizard();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef<any>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const uploadScale = useRef(new Animated.Value(1)).current;
  const cameraScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isCameraActive, preview]);

  const animatePress = (scale: Animated.Value, toValue: number) => {
    Animated.spring(scale, {
      toValue,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setPreview(photo.uri);
        setIsCameraActive(false);
      } catch (err) {
        console.error("Camera capture error:", err);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setPreview(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Image pick error:", err);
    }
  };

  const startCamera = async () => {
    if (!permission?.granted) {
      const resp = await requestPermission();
      if (!resp.granted) return;
    }
    setIsCameraActive(true);
  };

  const confirmPhoto = () => {
    if (preview) {
      setOriginalImage(preview);
      goNext();
    }
  };

  // 1. Loading / Initialization
  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#000" /></View>;
  }

  // 2. Preview State (Selected/Captured)
  if (preview) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: preview }} style={styles.previewImage} />
        <View style={styles.previewActions}>
          <TouchableOpacity
            style={[styles.circleBtn, styles.dangerBtn]}
            onPress={() => setPreview(null)}
            activeOpacity={0.8}
          >
            <X color="#fff" size={28} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.circleBtn, styles.successBtn]}
            onPress={confirmPhoto}
            activeOpacity={0.8}
          >
            <Check color="#000" size={28} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3. Camera Active State
  if (isCameraActive) {
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <View style={styles.topControls}>
              <TouchableOpacity onPress={() => setIsCameraActive(false)}>
                <X color="#fff" size={28} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}>
                <RotateCw color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // 4. Landing State (Choice)
  return (
    <Animated.View style={[
      styles.landingContainer,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <View style={styles.landingHeader}>
        <Sparkles color="#000" size={36} style={{ marginBottom: 15 }} />
        <Text style={styles.landingTitle}>Capturar Modelo</Text>
        <Text style={styles.landingSubtitle}>Sube una referencia o posa para el artista</Text>
      </View>

      <View style={styles.landingOptions}>
        <Animated.View style={{ transform: [{ scale: uploadScale }] }}>
          <TouchableOpacity
            style={[styles.landingBtn, styles.uploadBtn]}
            onPress={pickImage}
            onPressIn={() => animatePress(uploadScale, 0.95)}
            onPressOut={() => animatePress(uploadScale, 1)}
            activeOpacity={1}
          >
            <View style={styles.iconCircle}>
              <Upload color="#000" size={28} />
            </View>
            <View>
              <Text style={styles.landingBtnLabel}>Galería</Text>
              <Text style={styles.landingBtnText}>Subir Referencia</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: cameraScale }] }}>
          <TouchableOpacity
            style={[styles.landingBtn, styles.cameraBtn]}
            onPress={startCamera}
            onPressIn={() => animatePress(cameraScale, 0.95)}
            onPressOut={() => animatePress(cameraScale, 1)}
            activeOpacity={1}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
              <Camera color="#000" size={28} />
            </View>
            <View>
              <Text style={[styles.landingBtnLabel, { color: '#666' }]}>Cámara</Text>
              <Text style={[styles.landingBtnText, styles.textBlack]}>Posar Ahora</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  landingContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  landingHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  landingTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 5,
    color: '#000',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  landingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  landingOptions: {
    width: '100%',
    gap: 15,
  },
  landingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#000',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  uploadBtn: {
    backgroundColor: '#fff',
  },
  cameraBtn: {
    backgroundColor: '#FFDD00', // Web Yellow
  },
  landingBtnLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  landingBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  textWhite: {
    color: '#fff',
  },
  textBlack: {
    color: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  circleBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  successBtn: {
    backgroundColor: '#FFDD00', // Web Yellow
  },
  dangerBtn: {
    backgroundColor: '#FF0033', // Web Red
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
    backgroundColor: '#f5f5f5',
  },
  previewActions: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    color: '#333',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
