import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Clock } from "./components/Clock";
import { ClockControls } from "./components/ClockControls";
import { useState } from "react";
import type { ClockConfig } from "./types/clock";
import { DEFAULT_COLORS } from "./types/clock";
import "./App.css";

function App() {
  const [config, setConfig] = useState<ClockConfig>({
    colors: DEFAULT_COLORS,
  });

  return (
    <div className="app">
      <ClockControls config={config} onChange={setConfig} />
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Clock config={config} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

export default App;
