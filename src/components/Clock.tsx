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
      <circleGeometry args={[5, 128]} />
      <meshBasicMaterial color={COLORS.background} />
    </mesh>
  );
};

// Hour numbers component
const HourNumbers = ({ radius = 3 }: { radius?: number }) => {
  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <group>
      {numbers.map((num) => {
        const angle = ((num - 3) * Math.PI * 2) / -12;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
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
const MinuteNumbers = ({ radius = 3.75 }: { radius?: number }) => {
  const numbers = Array.from({ length: 12 }, (_, i) => i * 5);
  return (
    <group>
      {numbers.map((num) => {
        const angle = ((num / 5 - 3) * Math.PI * 2) / -12;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
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
const TickMarks = ({ radius = 4.25 }: { radius?: number }) => {
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  return (
    <group>
      {ticks.map((tick) => {
        const angle = ((tick - 15) * Math.PI * 2) / 60;
        const isMajorTick = tick % 5 === 0;
        const length = isMajorTick ? 0.3 : 0.15;
        // Calculate the end point of the tick mark
        const endRadius = radius + length;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const endX = Math.cos(angle) * endRadius;
        const endY = Math.sin(angle) * endRadius;
        // Calculate the center point and length of the tick mark
        const centerX = (x + endX) / 2;
        const centerY = (y + endY) / 2;
        const tickLength = Math.sqrt(
          Math.pow(endX - x, 2) + Math.pow(endY - y, 2)
        );
        return (
          <mesh
            key={tick}
            position={[centerX, centerY, 0.1]}
            rotation={[0, 0, angle + Math.PI / 2]}
          >
            <boxGeometry args={[0.05, tickLength, 0.05]} />
            <meshBasicMaterial color={COLORS.numbers} />
          </mesh>
        );
      })}
    </group>
  );
};

// Clock hands component
const ClockHands = ({
  hourHandRadius = 2,
  minuteHandRadius = 3,
  secondHandRadius = 3.5,
}: {
  hourHandRadius?: number;
  minuteHandRadius?: number;
  secondHandRadius?: number;
}) => {
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

  const hourAngle = -((hours + minutes / 60) * Math.PI * 2) / 12;
  const minuteAngle = -(minutes * Math.PI * 2) / 60;
  const secondAngle = -(seconds * Math.PI * 2) / 60;

  return (
    <group>
      {/* Hour hand */}
      <group rotation={[0, 0, hourAngle]}>
        <mesh position={[0, hourHandRadius / 2, 0]}>
          <boxGeometry args={[0.1, hourHandRadius, 0.1]} />
          <meshBasicMaterial color={COLORS.hourHand} />
        </mesh>
      </group>

      {/* Minute hand */}
      <group rotation={[0, 0, minuteAngle]}>
        <mesh position={[0, minuteHandRadius / 2, 0]}>
          <boxGeometry args={[0.1, minuteHandRadius, 0.1]} />
          <meshBasicMaterial color={COLORS.minuteHand} />
        </mesh>
      </group>

      {/* Second hand */}
      <group rotation={[0, 0, secondAngle]}>
        <mesh position={[0, secondHandRadius / 2, 0]}>
          <boxGeometry args={[0.05, secondHandRadius, 0.05]} />
          <meshBasicMaterial color={COLORS.secondHand} />
        </mesh>
      </group>
    </group>
  );
};

// Main Clock component
export const Clock = () => {
  return (
    <group position={[0, 0, 0]} scale={0.9}>
      <ClockFace />
      <TickMarks />
      <HourNumbers />
      <MinuteNumbers />
      <ClockHands />
    </group>
  );
};
