export interface HandCircle {
  show: boolean;
  radius: number;
  filled: boolean;
  strokeWidth: number;
}

export interface HandCenterCircle {
  show: boolean;
  radius: number;
  filled: boolean;
  strokeWidth: number;
  color: string;
}

export interface HandSlot {
  show: boolean;
  length: number;
  width: number;
  inset: number;
}

export type EndCapShape = "flat" | "rounded" | "pointed";

export interface HandEndCap {
  shape: EndCapShape;
  tipRadius: number;
  tipAngle: number;
  baseScale: number;
  tipScale: number;
  slot: HandSlot;
}

export interface ClockHand {
  show: boolean;
  color: string;
  length: number;
  width: number;
  depth: number;
  circle: HandCircle;
  centerCircle: HandCenterCircle;
  endCap: HandEndCap;
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

const defaultEndCap = (): HandEndCap => ({
  shape: "flat",
  tipRadius: 0,
  tipAngle: 60,
  baseScale: 1,
  tipScale: 1,
  slot: {
    show: false,
    length: 0.4,
    width: 0.04,
    inset: 0.2,
  },
});

const defaultCenterCircle = (color: string, radius: number): HandCenterCircle => ({
  show: false,
  radius,
  filled: true,
  strokeWidth: 0.05,
  color,
});

export const DEFAULT_CONFIG: ClockConfig = {
  face: {
    background: "#f5f5f5",
    numbers: "#000000",
    hourNumbers: 3,
    minuteNumbers: 3.75,
    tickMarks: 4.25,
  },
  hourHand: {
    show: true,
    color: "#1e88e5",
    length: 2.9,
    width: 0.1,
    depth: 0.1,
    circle: {
      show: false,
      radius: 0.15,
      filled: false,
      strokeWidth: 0.05,
    },
    centerCircle: defaultCenterCircle("#1e88e5", 0.18),
    endCap: defaultEndCap(),
  },
  minuteHand: {
    show: true,
    color: "#ffd600",
    length: 3.8,
    width: 0.1,
    depth: 0.1,
    circle: {
      show: false,
      radius: 0.12,
      filled: false,
      strokeWidth: 0.05,
    },
    centerCircle: defaultCenterCircle("#ffd600", 0.14),
    endCap: defaultEndCap(),
  },
  secondHand: {
    show: true,
    color: "#d32f2f",
    length: 4.2,
    width: 0.05,
    depth: 0.05,
    circle: {
      show: false,
      radius: 0.08,
      filled: false,
      strokeWidth: 0.03,
    },
    centerCircle: defaultCenterCircle("#d32f2f", 0.1),
    endCap: defaultEndCap(),
  },
};
