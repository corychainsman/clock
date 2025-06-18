import { useEffect, useRef, useCallback } from "react";
import { Pane } from "tweakpane";
import type { ClockConfig } from "../types/clock";
import { DEFAULT_COLORS, DEFAULT_RADII } from "../types/clock";

interface ClockControlsProps {
  config: ClockConfig;
  onChange: (newConfig: ClockConfig) => void;
}

const updateURL = (newConfig: ClockConfig) => {
  const params = new URLSearchParams();
  
  // Add color parameters (remove # from hex values) with 'color' prefix
  Object.entries(newConfig.colors).forEach(([key, value]) => {
    const defaultValue = DEFAULT_COLORS[key as keyof typeof DEFAULT_COLORS];
    if (value !== defaultValue) {
      params.set(`color${key.charAt(0).toUpperCase() + key.slice(1)}`, value.replace('#', ''));
    }
  });
  
  // Add radius parameters with 'radius' prefix (rounded to 1 decimal place)
  Object.entries(newConfig.radii).forEach(([key, value]) => {
    const defaultValue = DEFAULT_RADII[key as keyof typeof DEFAULT_RADII];
    if (value !== defaultValue) {
      const roundedValue = Math.round(value * 10) / 10;
      params.set(`radius${key.charAt(0).toUpperCase() + key.slice(1)}`, roundedValue.toString());
    }
  });
  
  const newURL = params.toString() 
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
  
  window.history.replaceState({}, '', newURL);
};

export const ClockControls = ({ config, onChange }: ClockControlsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<Pane | null>(null);
  const configRef = useRef(config);
  const paramsRef = useRef<{ colors: ClockConfig['colors']; radii: ClockConfig['radii'] }>({
    colors: { ...config.colors },
    radii: { ...config.radii }
  });

  // Keep config ref updated
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const handleConfigChange = useCallback((newConfig: ClockConfig) => {
    onChange(newConfig);
    updateURL(newConfig);
  }, [onChange]);

  // Initialize params ref with current config
  useEffect(() => {
    paramsRef.current = {
      colors: { ...config.colors },
      radii: { ...config.radii }
    };
  }, [config.colors, config.radii]); // Update when config changes

  // Initialize pane once
  useEffect(() => {
    if (!containerRef.current || paneRef.current) return;

    // Create a new pane
    const pane = new Pane({
      container: containerRef.current,
    });
    paneRef.current = pane;

    // Add color controls
    const colorFolder = pane.addFolder({
      title: "Colors",
    });

    // Add color pickers for each color
    (Object.keys(paramsRef.current.colors) as Array<keyof typeof paramsRef.current.colors>).forEach(
      (key) => {
        colorFolder.addBinding(paramsRef.current.colors, key).on("change", (ev) => {
          const newConfig = {
            ...configRef.current,
            colors: {
              ...configRef.current.colors,
              [key]: ev.value,
            },
          };
          handleConfigChange(newConfig);
        });
      }
    );

    // Add radius controls
    const radiusFolder = pane.addFolder({
      title: "Radii",
    });

    // Add number inputs for each radius
    (Object.keys(paramsRef.current.radii) as Array<keyof typeof paramsRef.current.radii>).forEach(
      (key) => {
        radiusFolder
          .addBinding(paramsRef.current.radii, key, {
            min: 0.5,
            max: 5,
            step: 0.1,
          })
          .on("change", (ev) => {
            // Validate the value to prevent NaN
            const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_RADII[key];
            const newConfig = {
              ...configRef.current,
              radii: {
                ...configRef.current.radii,
                [key]: value,
              },
            };
            handleConfigChange(newConfig);
          });
      }
    );

  }, [handleConfigChange]); // Only initialize once

  // Update params when config changes externally (not from our own changes)
  useEffect(() => {
    if (!paneRef.current) return;

    // Update params to match current config
    Object.keys(paramsRef.current.colors).forEach(key => {
      const typedKey = key as keyof typeof paramsRef.current.colors;
      paramsRef.current.colors[typedKey] = config.colors[typedKey];
    });

    Object.keys(paramsRef.current.radii).forEach(key => {
      const typedKey = key as keyof typeof paramsRef.current.radii;
      paramsRef.current.radii[typedKey] = config.radii[typedKey];
    });

    // Refresh the pane to show updated values
    paneRef.current.refresh();
  }, [config]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (paneRef.current) {
        paneRef.current.dispose();
        paneRef.current = null;
      }
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
