import { Canvas } from "@react-three/fiber";
import { Clock } from "./components/Clock";
import { ClockControls } from "./components/ClockControls";
import { useState } from "react";
import type { ClockConfig } from "./types/clock";
import { DEFAULT_COLORS, DEFAULT_RADII } from "./types/clock";
import "./App.css";

function App() {
  const [config, setConfig] = useState<ClockConfig>({
    colors: DEFAULT_COLORS,
    radii: DEFAULT_RADII,
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
