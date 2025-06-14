import { useEffect, useRef } from "react";
import { Pane } from "tweakpane";
import type { ClockConfig } from "../types/clock";
import { DEFAULT_COLORS } from "../types/clock";

interface ClockControlsProps {
  config: ClockConfig;
  onChange: (newConfig: ClockConfig) => void;
}

export const ClockControls = ({ config, onChange }: ClockControlsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<Pane | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a new pane
    const pane = new Pane({
      container: containerRef.current,
    });
    paneRef.current = pane;

    // Add color controls
    const colorFolder = pane.addFolder({
      title: "Colors",
    });

    // Create a params object for the colors
    const colorParams = { ...config.colors };

    // Add color pickers for each color
    (Object.keys(config.colors) as Array<keyof typeof config.colors>).forEach(
      (key) => {
        colorFolder.addBinding(colorParams, key).on("change", (ev) => {
          onChange({
            ...config,
            colors: {
              ...config.colors,
              [key]: ev.value,
            },
          });
        });
      }
    );

    // Cleanup
    return () => {
      pane.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 1000,
      }}
    />
  );
};
