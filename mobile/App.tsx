import React from 'react';
import { WizardProvider } from './src/context/WizardContext';
import { PhotoboothWizard } from './src/components/PhotoboothWizard';

export default function App() {
  return (
    <WizardProvider>
      <PhotoboothWizard />
    </WizardProvider>
  );
}
