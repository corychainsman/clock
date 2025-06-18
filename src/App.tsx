import { Canvas } from "@react-three/fiber";
import { Clock } from "./components/Clock";
import { ClockControls } from "./components/ClockControls";
import { useState } from "react";
import type { ClockConfig } from "./types/clock";
import { DEFAULT_CONFIG } from "./types/clock";
import "./App.css";

const getConfigFromURL = (): ClockConfig => {
  const params = new URLSearchParams(window.location.search);
  const config: ClockConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); // Deep copy
  
  const hands = ['hourHand', 'minuteHand', 'secondHand'] as const;
  
  // Parse hand parameters
  hands.forEach(handKey => {
    const hand = config[handKey];
    
    // Parse hand color
    const colorValue = params.get(`${handKey}Color`);
    if (colorValue && /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(colorValue)) {
      hand.color = `#${colorValue}`;
    }
    
    // Parse hand length
    const lengthValue = params.get(`${handKey}Length`);
    if (lengthValue) {
      const numValue = parseFloat(lengthValue);
      if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
        hand.length = numValue;
      }
    }
    
    // Parse circle parameters
    const circleShowValue = params.get(`${handKey}CircleShow`);
    if (circleShowValue !== null) {
      hand.circle.show = circleShowValue === 'true';
    }
    
    const circleRadiusValue = params.get(`${handKey}CircleRadius`);
    if (circleRadiusValue) {
      const numValue = parseFloat(circleRadiusValue);
      if (!isNaN(numValue) && numValue >= 0.01 && numValue <= 1) {
        hand.circle.radius = numValue;
      }
    }
    
    const circleFilledValue = params.get(`${handKey}CircleFilled`);
    if (circleFilledValue !== null) {
      hand.circle.filled = circleFilledValue === 'true';
    }
    
    const circleStrokeWidthValue = params.get(`${handKey}CircleStrokeWidth`);
    if (circleStrokeWidthValue) {
      const numValue = parseFloat(circleStrokeWidthValue);
      if (!isNaN(numValue) && numValue >= 0.01 && numValue <= 0.5) {
        hand.circle.strokeWidth = numValue;
      }
    }
  });
  
  // Parse face parameters
  const faceBackgroundValue = params.get('faceBackground');
  if (faceBackgroundValue && /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(faceBackgroundValue)) {
    config.face.background = `#${faceBackgroundValue}`;
  }
  
  const faceNumbersValue = params.get('faceNumbers');
  if (faceNumbersValue && /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(faceNumbersValue)) {
    config.face.numbers = `#${faceNumbersValue}`;
  }
  
  const faceHourNumbersValue = params.get('faceHourNumbers');
  if (faceHourNumbersValue) {
    const numValue = parseFloat(faceHourNumbersValue);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
      config.face.hourNumbers = numValue;
    }
  }
  
  const faceMinuteNumbersValue = params.get('faceMinuteNumbers');
  if (faceMinuteNumbersValue) {
    const numValue = parseFloat(faceMinuteNumbersValue);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
      config.face.minuteNumbers = numValue;
    }
  }
  
  const faceTickMarksValue = params.get('faceTickMarks');
  if (faceTickMarksValue) {
    const numValue = parseFloat(faceTickMarksValue);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
      config.face.tickMarks = numValue;
    }
  }
  
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
