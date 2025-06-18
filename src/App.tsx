import { Canvas } from "@react-three/fiber";
import { Clock } from "./components/Clock";
import { ClockControls } from "./components/ClockControls";
import { useState } from "react";
import type { ClockConfig } from "./types/clock";
import { DEFAULT_COLORS, DEFAULT_RADII } from "./types/clock";
import "./App.css";

const getConfigFromURL = (): ClockConfig => {
  const params = new URLSearchParams(window.location.search);
  const config: ClockConfig = {
    colors: { ...DEFAULT_COLORS },
    radii: { ...DEFAULT_RADII }
  };
  
  // Parse color parameters with 'color' prefix and validation
  Object.keys(DEFAULT_COLORS).forEach(key => {
    const paramName = `color${key.charAt(0).toUpperCase() + key.slice(1)}`;
    const value = params.get(paramName);
    if (value) {
      // Validate hex color (3 or 6 characters)
      if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(value)) {
        config.colors[key as keyof typeof DEFAULT_COLORS] = `#${value}`;
      }
    }
  });
  
  // Parse radius parameters with 'radius' prefix and validation
  Object.keys(DEFAULT_RADII).forEach(key => {
    const paramName = `radius${key.charAt(0).toUpperCase() + key.slice(1)}`;
    const value = params.get(paramName);
    if (value) {
      const numValue = parseFloat(value);
      // Validate radius is a positive number within reasonable bounds
      if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
        config.radii[key as keyof typeof DEFAULT_RADII] = numValue;
      }
    }
  });
  
  return config;
};

function App() {
  const [config, setConfig] = useState<ClockConfig>(() => {
    // Initialize with URL parameters if available
    return getConfigFromURL();
  });

  return (
    <div className="app">
      <ClockControls config={config} onChange={setConfig} />
      <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 90 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Clock config={config} />
      </Canvas>
    </div>
  );
}

export default App;
