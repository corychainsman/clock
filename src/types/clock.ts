export interface ClockColors {
  background: string;
  hourHand: string;
  minuteHand: string;
  secondHand: string;
  numbers: string;
}

export interface ClockConfig {
  colors: ClockColors;
  // Future properties will go here, like:
  // radii: ClockRadii;
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
