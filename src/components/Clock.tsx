import { useState, useEffect, useMemo } from "react";
import { Text } from "@react-three/drei";
import { ExtrudeGeometry, Path, Shape } from "three";
import type { ClockConfig, ClockHand } from "../types/clock";
import { useResponsiveCamera } from "../hooks/useResponsiveCamera";

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
const HourNumbers = ({ radius, color, font }: { radius: number; color: string; font: string }) => {
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
            font={font}
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
  font,
}: {
  radius: number;
  color: string;
  font: string;
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
            font={font}
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

// Build the 2D shape (with optional slot hole) for a hand
const buildHandShape = (hand: ClockHand): Shape => {
  const shape = new Shape();
  const length = Math.max(hand.length, 0.01);
  const baseWidth = Math.max(hand.width * hand.endCap.baseScale, 0.001);
  const tipWidth = Math.max(hand.width * hand.endCap.tipScale, 0.001);

  // Outer outline, traced counter-clockwise so the front face normal points +Z.
  shape.moveTo(baseWidth / 2, 0);

  if (hand.endCap.shape === "rounded") {
    const r = Math.max(0, Math.min(hand.endCap.tipRadius, tipWidth / 2, length));
    shape.lineTo(tipWidth / 2, length - r);
    if (r > 0) {
      shape.quadraticCurveTo(tipWidth / 2, length, tipWidth / 2 - r, length);
      shape.lineTo(-tipWidth / 2 + r, length);
      shape.quadraticCurveTo(-tipWidth / 2, length, -tipWidth / 2, length - r);
    } else {
      shape.lineTo(-tipWidth / 2, length);
    }
  } else if (hand.endCap.shape === "pointed") {
    const angleDeg = Math.max(1, Math.min(179, hand.endCap.tipAngle));
    const halfAngle = (angleDeg * Math.PI) / 360;
    const extension = (tipWidth / 2) / Math.tan(halfAngle);
    shape.lineTo(tipWidth / 2, length);
    shape.lineTo(0, length + extension);
    shape.lineTo(-tipWidth / 2, length);
  } else {
    shape.lineTo(tipWidth / 2, length);
    shape.lineTo(-tipWidth / 2, length);
  }

  shape.lineTo(-baseWidth / 2, 0);
  shape.lineTo(baseWidth / 2, 0);

  if (hand.endCap.slot.show) {
    const slot = hand.endCap.slot;
    const safeLength = Math.max(0.001, Math.min(slot.length, length - Math.max(0, slot.inset)));
    const slotCenterY = length - Math.max(0, slot.inset) - safeLength / 2;
    const t = length === 0 ? 0 : Math.max(0, Math.min(1, slotCenterY / length));
    const localWidth = baseWidth + (tipWidth - baseWidth) * t;
    const safeWidth = Math.max(0.001, Math.min(slot.width, localWidth * 0.85));

    const hole = new Path();
    const xR = safeWidth / 2;
    const yT = slotCenterY + safeLength / 2;
    const yB = slotCenterY - safeLength / 2;
    // Hole traced clockwise (opposite of outer ring) to count as a hole.
    hole.moveTo(xR, yB);
    hole.lineTo(-xR, yB);
    hole.lineTo(-xR, yT);
    hole.lineTo(xR, yT);
    hole.lineTo(xR, yB);
    shape.holes.push(hole);
  }

  return shape;
};

const Hand = ({ hand, angle }: { hand: ClockHand; angle: number }) => {
  const geometry = useMemo(() => {
    const shape = buildHandShape(hand);
    return new ExtrudeGeometry(shape, {
      depth: Math.max(0.001, hand.depth),
      bevelEnabled: false,
      curveSegments: 24,
    });
    // hand reference changes every render (Clock re-spreads it for NaN guards),
    // so depend on the geometry-affecting primitives instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hand.length,
    hand.width,
    hand.depth,
    hand.endCap.shape,
    hand.endCap.tipRadius,
    hand.endCap.tipAngle,
    hand.endCap.baseScale,
    hand.endCap.tipScale,
    hand.endCap.slot.show,
    hand.endCap.slot.length,
    hand.endCap.slot.width,
    hand.endCap.slot.inset,
  ]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  if (!hand.show) return null;

  // The body is extruded from z=0 to z=depth. Place caps just above the front face.
  const capZ = hand.depth + 0.01;
  const tipCircle = hand.circle;
  const center = hand.centerCircle;
  const centerColor = center.color || hand.color;

  return (
    <group rotation={[0, 0, angle]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={hand.color} />
      </mesh>
      {tipCircle.show && (
        <mesh position={[0, hand.length + tipCircle.radius, capZ]}>
          {tipCircle.filled ? (
            <>
              <circleGeometry args={[tipCircle.radius, 32]} />
              <meshBasicMaterial color={hand.color} />
            </>
          ) : (
            <>
              <ringGeometry
                args={[
                  Math.max(0, tipCircle.radius - tipCircle.strokeWidth / 2),
                  tipCircle.radius + tipCircle.strokeWidth / 2,
                  32,
                ]}
              />
              <meshBasicMaterial color={hand.color} />
            </>
          )}
        </mesh>
      )}
      {center.show && (
        <mesh position={[0, 0, capZ]}>
          {center.filled ? (
            <>
              <circleGeometry args={[center.radius, 64]} />
              <meshBasicMaterial color={centerColor} />
            </>
          ) : (
            <>
              <ringGeometry
                args={[
                  Math.max(0, center.radius - center.strokeWidth / 2),
                  center.radius + center.strokeWidth / 2,
                  64,
                ]}
              />
              <meshBasicMaterial color={centerColor} />
            </>
          )}
        </mesh>
      )}
    </group>
  );
};

// Clock hands component
const ClockHands = ({
  hourHand,
  minuteHand,
  secondHand,
}: {
  hourHand: ClockHand;
  minuteHand: ClockHand;
  secondHand: ClockHand;
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
      <Hand hand={hourHand} angle={hourAngle} />
      <Hand hand={minuteHand} angle={minuteAngle} />
      <Hand hand={secondHand} angle={secondAngle} />
    </group>
  );
};

// Main Clock component
interface ClockProps {
  config: ClockConfig;
  fontUrl: string;
}

export const Clock = ({ config, fontUrl }: ClockProps) => {
  // Use responsive camera hook
  useResponsiveCamera();

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
        font={fontUrl}
      />
      <MinuteNumbers
        radius={safeFace.minuteNumbers}
        color={config.face.numbers}
        font={fontUrl}
      />
      <ClockHands
        hourHand={safeHands.hourHand}
        minuteHand={safeHands.minuteHand}
        secondHand={safeHands.secondHand}
      />
    </group>
  );
};
