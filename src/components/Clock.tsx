import { useState, useEffect } from "react";
import { Text } from "@react-three/drei";
import type { ClockConfig } from "../types/clock";

// Clock face component
const ClockFace = ({ color }: { color: string }) => {
  return (
    <mesh>
      <circleGeometry args={[5, 128]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// Hour numbers component
const HourNumbers = ({ radius, color }: { radius: number; color: string }) => {
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
            color={color}
            anchorX="center"
            anchorY="middle"
          >
            {num}
          </Text>
        );
      })}
    </group>
  );
};

// Minute numbers component
const MinuteNumbers = ({
  radius,
  color,
}: {
  radius: number;
  color: string;
}) => {
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
            color={color}
            anchorX="center"
            anchorY="middle"
          >
            {num.toString().padStart(2, "0")}
          </Text>
        );
      })}
    </group>
  );
};

// Tick marks component
const TickMarks = ({ radius, color }: { radius: number; color: string }) => {
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  return (
    <group>
      {ticks.map((tick) => {
        const angle = ((tick - 15) * Math.PI * 2) / 60;
        const isMajorTick = tick % 5 === 0;
        const length = isMajorTick ? 0.3 : 0.15;
        const endRadius = radius + length;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const endX = Math.cos(angle) * endRadius;
        const endY = Math.sin(angle) * endRadius;
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
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
};

// Clock hands component
const ClockHands = ({
  hourHand,
  minuteHand,
  secondHand,
}: {
  hourHand: ClockConfig['hourHand'];
  minuteHand: ClockConfig['minuteHand'];
  secondHand: ClockConfig['secondHand'];
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
        <mesh position={[0, hourHand.length / 2, 0]}>
          <boxGeometry args={[0.1, hourHand.length, 0.1]} />
          <meshBasicMaterial color={hourHand.color} />
        </mesh>
        {hourHand.circle.show && (
          <mesh position={[0, hourHand.length + hourHand.circle.radius, 0.1]}>
            {hourHand.circle.filled ? (
              <>
                <circleGeometry args={[hourHand.circle.radius, 32]} />
                <meshBasicMaterial color={hourHand.color} />
              </>
            ) : (
              <>
                <ringGeometry args={[hourHand.circle.radius - hourHand.circle.strokeWidth/2, hourHand.circle.radius + hourHand.circle.strokeWidth/2, 32]} />
                <meshBasicMaterial color={hourHand.color} />
              </>
            )}
          </mesh>
        )}
      </group>

      {/* Minute hand */}
      <group rotation={[0, 0, minuteAngle]}>
        <mesh position={[0, minuteHand.length / 2, 0]}>
          <boxGeometry args={[0.1, minuteHand.length, 0.1]} />
          <meshBasicMaterial color={minuteHand.color} />
        </mesh>
        {minuteHand.circle.show && (
          <mesh position={[0, minuteHand.length + minuteHand.circle.radius, 0.1]}>
            {minuteHand.circle.filled ? (
              <>
                <circleGeometry args={[minuteHand.circle.radius, 32]} />
                <meshBasicMaterial color={minuteHand.color} />
              </>
            ) : (
              <>
                <ringGeometry args={[minuteHand.circle.radius - minuteHand.circle.strokeWidth/2, minuteHand.circle.radius + minuteHand.circle.strokeWidth/2, 32]} />
                <meshBasicMaterial color={minuteHand.color} />
              </>
            )}
          </mesh>
        )}
      </group>

      {/* Second hand */}
      <group rotation={[0, 0, secondAngle]}>
        <mesh position={[0, secondHand.length / 2, 0]}>
          <boxGeometry args={[0.05, secondHand.length, 0.05]} />
          <meshBasicMaterial color={secondHand.color} />
        </mesh>
        {secondHand.circle.show && (
          <mesh position={[0, secondHand.length + secondHand.circle.radius, 0.1]}>
            {secondHand.circle.filled ? (
              <>
                <circleGeometry args={[secondHand.circle.radius, 32]} />
                <meshBasicMaterial color={secondHand.color} />
              </>
            ) : (
              <>
                <ringGeometry args={[secondHand.circle.radius - secondHand.circle.strokeWidth/2, secondHand.circle.radius + secondHand.circle.strokeWidth/2, 32]} />
                <meshBasicMaterial color={secondHand.color} />
              </>
            )}
          </mesh>
        )}
      </group>
    </group>
  );
};

// Main Clock component
interface ClockProps {
  config: ClockConfig;
}

export const Clock = ({ config }: ClockProps) => {
  // Validate face values to prevent NaN errors
  const safeFace = {
    tickMarks: isNaN(config.face.tickMarks) ? 4.25 : config.face.tickMarks,
    hourNumbers: isNaN(config.face.hourNumbers) ? 3 : config.face.hourNumbers,
    minuteNumbers: isNaN(config.face.minuteNumbers) ? 3.75 : config.face.minuteNumbers,
  };

  // Validate hand lengths to prevent NaN errors
  const safeHands = {
    hourHand: {
      ...config.hourHand,
      length: isNaN(config.hourHand.length) ? 2 : config.hourHand.length,
    },
    minuteHand: {
      ...config.minuteHand,
      length: isNaN(config.minuteHand.length) ? 3 : config.minuteHand.length,
    },
    secondHand: {
      ...config.secondHand,
      length: isNaN(config.secondHand.length) ? 3.5 : config.secondHand.length,
    },
  };

  return (
    <group position={[0, 0, 0]} scale={0.9}>
      <ClockFace color={config.face.background} />
      <TickMarks
        radius={safeFace.tickMarks}
        color={config.face.numbers}
      />
      <HourNumbers
        radius={safeFace.hourNumbers}
        color={config.face.numbers}
      />
      <MinuteNumbers
        radius={safeFace.minuteNumbers}
        color={config.face.numbers}
      />
      <ClockHands
        hourHand={safeHands.hourHand}
        minuteHand={safeHands.minuteHand}
        secondHand={safeHands.secondHand}
      />
    </group>
  );
};
