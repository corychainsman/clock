import type { ClockConfig, ClockHand, HandEndCap, HandCenterCircle } from './clock';

export interface ClockPreset {
  id: string;
  name: string;
  description: string;
  config: Omit<ClockConfig, 'preset'>;
}

const flatEndCap = (): HandEndCap => ({
  shape: 'flat',
  tipRadius: 0,
  tipAngle: 60,
  baseScale: 1,
  tipScale: 1,
  slot: { show: false, length: 0.4, width: 0.04, inset: 0.2 },
});

const center = (color: string, radius: number, show = false): HandCenterCircle => ({
  show,
  radius,
  filled: true,
  strokeWidth: 0.05,
  color,
});

type LegacyHand = Omit<ClockHand, 'show' | 'thickness' | 'centerCircle' | 'endCap'>;

const hand = (
  legacy: LegacyHand,
  thickness: number,
  centerCircle: HandCenterCircle,
  overrides: Partial<ClockHand> = {}
): ClockHand => ({
  ...legacy,
  show: true,
  thickness,
  centerCircle,
  endCap: flatEndCap(),
  ...overrides,
});

export const CLOCK_PRESETS: ClockPreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'The original clock design',
    config: {
      face: {
        background: "#f5f5f5",
        numbers: "#000000",
        hourNumbers: 3,
        minuteNumbers: 3.75,
        tickMarks: 4.25,
      },
      hourHand: hand(
        { color: "#1e88e5", length: 2.9, circle: { show: false, radius: 0.15, filled: false, strokeWidth: 0.05 } },
        0.1,
        center("#1e88e5", 0.18),
      ),
      minuteHand: hand(
        { color: "#ffd600", length: 3.8, circle: { show: false, radius: 0.12, filled: false, strokeWidth: 0.05 } },
        0.1,
        center("#ffd600", 0.14),
      ),
      secondHand: hand(
        { color: "#d32f2f", length: 4.2, circle: { show: false, radius: 0.08, filled: false, strokeWidth: 0.03 } },
        0.05,
        center("#d32f2f", 0.1),
      ),
    },
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional analog clock with Roman numerals feel',
    config: {
      face: {
        background: "#ffffff",
        numbers: "#2c3e50",
        hourNumbers: 2.8,
        minuteNumbers: 3.5,
        tickMarks: 4.0,
      },
      hourHand: hand(
        { color: "#2c3e50", length: 2.5, circle: { show: true, radius: 0.2, filled: true, strokeWidth: 0.05 } },
        0.1,
        center("#2c3e50", 0.18),
      ),
      minuteHand: hand(
        { color: "#2c3e50", length: 3.5, circle: { show: true, radius: 0.15, filled: true, strokeWidth: 0.05 } },
        0.1,
        center("#2c3e50", 0.14),
      ),
      secondHand: hand(
        { color: "#e74c3c", length: 4.0, circle: { show: true, radius: 0.1, filled: true, strokeWidth: 0.03 } },
        0.05,
        center("#e74c3c", 0.1),
      ),
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, minimalist design with thin hands',
    config: {
      face: {
        background: "#ecf0f1",
        numbers: "#34495e",
        hourNumbers: 3.2,
        minuteNumbers: 3.8,
        tickMarks: 4.3,
      },
      hourHand: hand(
        { color: "#3498db", length: 2.8, circle: { show: false, radius: 0.08, filled: false, strokeWidth: 0.02 } },
        0.1,
        center("#3498db", 0.18),
      ),
      minuteHand: hand(
        { color: "#2ecc71", length: 3.9, circle: { show: false, radius: 0.06, filled: false, strokeWidth: 0.02 } },
        0.1,
        center("#2ecc71", 0.14),
      ),
      secondHand: hand(
        { color: "#e67e22", length: 4.3, circle: { show: false, radius: 0.04, filled: false, strokeWidth: 0.01 } },
        0.05,
        center("#e67e22", 0.1),
      ),
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Bright, glowing colors on dark background',
    config: {
      face: {
        background: "#1a1a1a",
        numbers: "#00ffff",
        hourNumbers: 3.0,
        minuteNumbers: 3.6,
        tickMarks: 4.1,
      },
      hourHand: hand(
        { color: "#ff00ff", length: 2.7, circle: { show: true, radius: 0.18, filled: false, strokeWidth: 0.08 } },
        0.1,
        center("#ff00ff", 0.18),
      ),
      minuteHand: hand(
        { color: "#00ff00", length: 3.7, circle: { show: true, radius: 0.14, filled: false, strokeWidth: 0.06 } },
        0.1,
        center("#00ff00", 0.14),
      ),
      secondHand: hand(
        { color: "#ffff00", length: 4.1, circle: { show: true, radius: 0.1, filled: false, strokeWidth: 0.04 } },
        0.05,
        center("#ffff00", 0.1),
      ),
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean design with no numbers',
    config: {
      face: {
        background: "#ffffff",
        numbers: "#bdc3c7",
        hourNumbers: 2.5,
        minuteNumbers: 2.8,
        tickMarks: 3.8,
      },
      hourHand: hand(
        { color: "#95a5a6", length: 2.2, circle: { show: false, radius: 0.05, filled: false, strokeWidth: 0.02 } },
        0.1,
        center("#95a5a6", 0.18),
      ),
      minuteHand: hand(
        { color: "#7f8c8d", length: 3.2, circle: { show: false, radius: 0.03, filled: false, strokeWidth: 0.01 } },
        0.1,
        center("#7f8c8d", 0.14),
      ),
      secondHand: hand(
        { color: "#34495e", length: 3.8, circle: { show: false, radius: 0.02, filled: false, strokeWidth: 0.01 } },
        0.05,
        center("#34495e", 0.1),
      ),
    },
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Vintage-inspired with warm colors',
    config: {
      face: {
        background: "#f4e4c1",
        numbers: "#8b4513",
        hourNumbers: 2.9,
        minuteNumbers: 3.4,
        tickMarks: 3.9,
      },
      hourHand: hand(
        { color: "#a0522d", length: 2.6, circle: { show: true, radius: 0.16, filled: true, strokeWidth: 0.04 } },
        0.1,
        center("#a0522d", 0.18),
      ),
      minuteHand: hand(
        { color: "#cd853f", length: 3.4, circle: { show: true, radius: 0.12, filled: true, strokeWidth: 0.04 } },
        0.1,
        center("#cd853f", 0.14),
      ),
      secondHand: hand(
        { color: "#d2691e", length: 3.9, circle: { show: true, radius: 0.08, filled: true, strokeWidth: 0.02 } },
        0.05,
        center("#d2691e", 0.1),
      ),
    },
  },
];

export const getPresetById = (id: string): ClockPreset | undefined => {
  return CLOCK_PRESETS.find(preset => preset.id === id);
};

export const getPresetOptions = () => {
  return CLOCK_PRESETS.map(preset => ({
    text: preset.name,
    value: preset.name,
  }));
};
