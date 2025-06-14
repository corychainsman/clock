import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Clock } from "./components/Clock";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Clock />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

export default App;
