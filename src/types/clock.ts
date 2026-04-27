export interface HandCircle {
  show: boolean;
  radius: number;
  filled: boolean;
  strokeWidth: number;
}

export interface ClockHand {
  color: string;
  length: number;
  circle: HandCircle;
}

export interface ClockFace {
  background: string;
  numbers: string;
  hourNumbers: number;
  minuteNumbers: number;
  tickMarks: number;
}

export interface ClockConfig {
  preset?: string;
  hourHand: ClockHand;
  minuteHand: ClockHand;
  secondHand: ClockHand;
  face: ClockFace;
}

export interface PrintSettings {
  diameterMm: number;
  centerHoleMm: number;
  baseThicknessMm: number;
  markingHeightMm: number;
  layerHeightMm: number;
  nozzleDiameterMm: number;
}

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  diameterMm: 200,
  centerHoleMm: 8.2,
  baseThicknessMm: 2.4,
  markingHeightMm: 0.6,
  layerHeightMm: 0.2,
  nozzleDiameterMm: 0.4,
};

export const DEFAULT_CONFIG: ClockConfig = {
  face: {
    background: "#f5f5f5",
    numbers: "#000000",
    hourNumbers: 3,
    minuteNumbers: 3.75,
    tickMarks: 4.25,
  },
  hourHand: {
    color: "#1e88e5", // Kandinsky blue
    length: 2.9,
    circle: {
      show: false,
      radius: 0.15,
      filled: false,
      strokeWidth: 0.05,
    },
  },
  minuteHand: {
    color: "#ffd600", // Kandinsky yellow
    length: 3.8,
    circle: {
      show: false,
      radius: 0.12,
      filled: false,
      strokeWidth: 0.05,
    },
  },
  secondHand: {
    color: "#d32f2f", // Kandinsky red
    length: 4.2,
    circle: {
      show: false,
      radius: 0.08,
      filled: false,
      strokeWidth: 0.03,
    },
  },
};
