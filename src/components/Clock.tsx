import { useState, useEffect } from "react";
import { Text } from "@react-three/drei";

// Constants for colors
const COLORS = {
  background: "#f5f5f5",
  hourHand: "#1e88e5", // Kandinsky blue
  minuteHand: "#ffd600", // Kandinsky yellow
  secondHand: "#d32f2f", // Kandinsky red
  numbers: "#000000",
};

// Clock face component
const ClockFace = () => {
  return (
    <mesh>
      <circleGeometry args={[5, 32]} />
      <meshBasicMaterial color={COLORS.background} />
    </mesh>
  );
};

// Hour numbers component
const HourNumbers = () => {
  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <group>
      {numbers.map((num) => {
        const angle = ((num - 3) * Math.PI * 2) / -12;
        const x = Math.cos(angle) * 4;
        const y = Math.sin(angle) * 4;
        return (
          <Text
            key={num}
            position={[x, y, 0.1]}
            fontSize={0.5}
            color={COLORS.numbers}
            anchorX="center"
            anchorY="middle"
            font="/fonts/JetBrainsMono-Regular.ttf"
          >
            {num}
          </Text>
        );
      })}
    </group>
  );
};

// Minute numbers component
const MinuteNumbers = () => {
  const numbers = Array.from({ length: 12 }, (_, i) => i * 5);
  return (
    <group>
      {numbers.map((num) => {
        const angle = ((num / 5 - 3) * Math.PI * 2) / -12;
        const x = Math.cos(angle) * 3.5;
        const y = Math.sin(angle) * 3.5;
        return (
          <Text
            key={num}
            position={[x, y, 0.1]}
            fontSize={0.3}
            color={COLORS.numbers}
            anchorX="center"
            anchorY="middle"
            font="/fonts/JetBrainsMono-Regular.ttf"
          >
            {num.toString().padStart(2, "0")}
          </Text>
        );
      })}
    </group>
  );
};

// Tick marks component
const TickMarks = () => {
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  return (
    <group>
      {ticks.map((tick) => {
        const angle = ((tick - 15) * Math.PI * 2) / 60;
        const x = Math.cos(angle) * 4.5;
        const y = Math.sin(angle) * 4.5;
        const length = tick % 5 === 0 ? 0.2 : 0.1;
        return (
          <mesh key={tick} position={[x, y, 0.1]}>
            <boxGeometry args={[0.05, length, 0.05]} />
            <meshBasicMaterial color={COLORS.numbers} />
          </mesh>
        );
      })}
    </group>
  );
};

// Clock hands component
const ClockHands = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourAngle = ((hours + minutes / 60) * Math.PI * 2) / 12;
  const minuteAngle = (minutes * Math.PI * 2) / 60;
  const secondAngle = (seconds * Math.PI * 2) / 60;

  return (
    <group>
      {/* Hour hand */}
      <mesh rotation={[0, 0, hourAngle]}>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshBasicMaterial color={COLORS.hourHand} />
      </mesh>

      {/* Minute hand */}
      <mesh rotation={[0, 0, minuteAngle]}>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshBasicMaterial color={COLORS.minuteHand} />
      </mesh>

      {/* Second hand */}
      <mesh rotation={[0, 0, secondAngle]}>
        <boxGeometry args={[0.05, 3.5, 0.05]} />
        <meshBasicMaterial color={COLORS.secondHand} />
      </mesh>
    </group>
  );
};

// Main Clock component
export const Clock = () => {
  return (
    <group>
      <ClockFace />
      <TickMarks />
      <HourNumbers />
      <MinuteNumbers />
      <ClockHands />
    </group>
  );
};
