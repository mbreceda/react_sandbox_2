// Import polyfills first
import "./utils/globals";

import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import App from "./App";

// Find the root element
const rootElement = document.getElementById("root");

// Verify the root element exists
if (!rootElement) {
  console.error("Failed to find the root element");
  document.body.innerHTML =
    '<div style="color: red; padding: 20px;">Error: Could not find root element!</div>';
} else {
  // Create root and render app
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log("React app rendered successfully");
}
