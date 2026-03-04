import { WizardProvider } from "./context/WizardContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";
import { PhotoboothWizard } from "./components/PhotoboothWizard";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <WizardProvider>
          <PhotoboothWizard />
        </WizardProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
