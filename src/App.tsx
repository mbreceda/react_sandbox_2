import { WizardProvider } from "./context/WizardContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PhotoboothWizard } from "./components/PhotoboothWizard";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <WizardProvider>
        <PhotoboothWizard />
      </WizardProvider>
    </ThemeProvider>
  );
}

export default App;
