import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import { useWizard } from '../context/WizardContext';
import { PhotoCapture } from './steps/PhotoCapture';
import { TransformationStep } from './steps/TransformationStep';
import { ResultView } from './steps/ResultView';

const { width } = Dimensions.get('window');

const STEPS = [
  { number: 1, label: 'Foto' },
  { number: 2, label: 'Magia' },
  { number: 3, label: 'Result' },
];

export function PhotoboothWizard() {
  const { currentStep } = useWizard();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PhotoCapture />;
      case 2:
        return <TransformationStep />;
      case 3:
        return <ResultView />;
      default:
        return <PhotoCapture />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        source={require('../assets/wally-crowd-bg.png')}
        style={styles.background}
        imageStyle={{ opacity: 0.1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Photobooth AI</Text>
          <Text style={styles.subtitle}>by Fred Breceda</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLine}>
            <View
              style={[
                styles.progressLineFill,
                { width: `${((currentStep - 1) / 2) * 100}%` }
              ]}
            />
          </View>
          {STEPS.map((step) => (
            <View key={step.number} style={styles.stepWrapper}>
              <View style={[
                styles.stepIndicator,
                currentStep >= step.number && styles.stepIndicatorActive,
                currentStep > step.number && styles.stepIndicatorCompleted
              ]}>
                <Text style={[
                  styles.stepText,
                  currentStep >= step.number && styles.stepTextActive
                ]}>
                  {step.number}
                </Text>
              </View>
              <Text style={[
                styles.stepLabel,
                currentStep >= step.number && styles.stepLabelActive
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.wizardContent}>
            {/* Paper Texture Overlay (Simulated) */}
            <View style={styles.paperOverlay} pointerEvents="none" />

            <View style={styles.stepContainer}>
              {renderStep()}
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
    padding: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
    fontStyle: 'italic',
    marginTop: -5,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
    position: 'relative',
    height: 60,
  },
  progressLine: {
    position: 'absolute',
    top: 20,
    left: 45,
    right: 45,
    height: 4,
    backgroundColor: '#000',
    zIndex: 0,
  },
  progressLineFill: {
    height: '100%',
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  stepWrapper: {
    alignItems: 'center',
    zIndex: 1,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  stepIndicatorActive: {
    backgroundColor: '#000',
    transform: [{ scale: 1.1 }],
  },
  stepIndicatorCompleted: {
    backgroundColor: '#fff',
  },
  stepText: {
    fontWeight: '900',
    fontSize: 16,
    color: '#000',
  },
  stepTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 5,
    color: '#666',
    textTransform: 'uppercase',
  },
  stepLabelActive: {
    color: '#000',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wizardContent: {
    width: width * 0.9,
    minHeight: 520,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#000',
    position: 'relative',
    // Sketchbook shadow
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  paperOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    opacity: 0.05,
    // Note: ideally we'd use a small pattern image here
  },
  stepContainer: {
    flex: 1,
    padding: 10,
  }
});
