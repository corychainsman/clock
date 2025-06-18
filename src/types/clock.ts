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
  hourHand: ClockHand;
  minuteHand: ClockHand;
  secondHand: ClockHand;
  face: ClockFace;
}

export const DEFAULT_CONFIG: ClockConfig = {
  hourHand: {
    color: "#1e88e5", // Kandinsky blue
    length: 2,
    circle: {
      show: true,
      radius: 0.15,
      filled: true,
      strokeWidth: 0.05,
    },
  },
  minuteHand: {
    color: "#ffd600", // Kandinsky yellow
    length: 3,
    circle: {
      show: true,
      radius: 0.12,
      filled: true,
      strokeWidth: 0.05,
    },
  },
  secondHand: {
    color: "#d32f2f", // Kandinsky red
    length: 3.5,
    circle: {
      show: true,
      radius: 0.08,
      filled: false,
      strokeWidth: 0.03,
    },
  },
  face: {
    background: "#f5f5f5",
    numbers: "#000000",
    hourNumbers: 3,
    minuteNumbers: 3.75,
    tickMarks: 4.25,
  },
};
