export interface ClockColors {
  background: string;
  hourHand: string;
  minuteHand: string;
  secondHand: string;
  numbers: string;
}

export interface ClockRadii {
  hourHand: number;
  minuteHand: number;
  secondHand: number;
  hourNumbers: number;
  minuteNumbers: number;
  tickMarks: number;
}

export interface ClockConfig {
  colors: ClockColors;
  radii: ClockRadii;
  // Future properties will go here, like:
  // sizes: ClockSizes;
  // etc.
}

export const DEFAULT_COLORS: ClockColors = {
  background: "#f5f5f5",
  hourHand: "#1e88e5", // Kandinsky blue
  minuteHand: "#ffd600", // Kandinsky yellow
  secondHand: "#d32f2f", // Kandinsky red
  numbers: "#000000",
};

export const DEFAULT_RADII: ClockRadii = {
  hourHand: 2,
  minuteHand: 3,
  secondHand: 3.5,
  hourNumbers: 3,
  minuteNumbers: 3.75,
  tickMarks: 4.25,
};
