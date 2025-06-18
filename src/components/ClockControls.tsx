import { useEffect, useRef, useCallback } from "react";
import { Pane } from "tweakpane";
import type { ClockConfig } from "../types/clock";
import { DEFAULT_CONFIG } from "../types/clock";

interface ClockControlsProps {
  config: ClockConfig;
  onChange: (newConfig: ClockConfig) => void;
}

const updateURL = (newConfig: ClockConfig) => {
  const params = new URLSearchParams();
  
  const hands = ['hourHand', 'minuteHand', 'secondHand'] as const;
  
  // Add hand parameters
  hands.forEach(handKey => {
    const hand = newConfig[handKey];
    const defaultHand = DEFAULT_CONFIG[handKey];
    
    // Hand color
    if (hand.color !== defaultHand.color) {
      params.set(`${handKey}Color`, hand.color.replace('#', ''));
    }
    
    // Hand length
    if (hand.length !== defaultHand.length) {
      const roundedValue = Math.round(hand.length * 10) / 10;
      params.set(`${handKey}Length`, roundedValue.toString());
    }
    
    // Circle parameters
    if (hand.circle.show !== defaultHand.circle.show) {
      params.set(`${handKey}CircleShow`, hand.circle.show.toString());
    }
    
    if (hand.circle.radius !== defaultHand.circle.radius) {
      const roundedValue = Math.round(hand.circle.radius * 100) / 100;
      params.set(`${handKey}CircleRadius`, roundedValue.toString());
    }
    
    if (hand.circle.filled !== defaultHand.circle.filled) {
      params.set(`${handKey}CircleFilled`, hand.circle.filled.toString());
    }
    
    if (hand.circle.strokeWidth !== defaultHand.circle.strokeWidth) {
      const roundedValue = Math.round(hand.circle.strokeWidth * 100) / 100;
      params.set(`${handKey}CircleStrokeWidth`, roundedValue.toString());
    }
  });
  
  // Add face parameters
  if (newConfig.face.background !== DEFAULT_CONFIG.face.background) {
    params.set('faceBackground', newConfig.face.background.replace('#', ''));
  }
  
  if (newConfig.face.numbers !== DEFAULT_CONFIG.face.numbers) {
    params.set('faceNumbers', newConfig.face.numbers.replace('#', ''));
  }
  
  if (newConfig.face.hourNumbers !== DEFAULT_CONFIG.face.hourNumbers) {
    const roundedValue = Math.round(newConfig.face.hourNumbers * 10) / 10;
    params.set('faceHourNumbers', roundedValue.toString());
  }
  
  if (newConfig.face.minuteNumbers !== DEFAULT_CONFIG.face.minuteNumbers) {
    const roundedValue = Math.round(newConfig.face.minuteNumbers * 10) / 10;
    params.set('faceMinuteNumbers', roundedValue.toString());
  }
  
  if (newConfig.face.tickMarks !== DEFAULT_CONFIG.face.tickMarks) {
    const roundedValue = Math.round(newConfig.face.tickMarks * 10) / 10;
    params.set('faceTickMarks', roundedValue.toString());
  }
  
  const newURL = params.toString() 
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
  
  window.history.replaceState({}, '', newURL);
};

export const ClockControls = ({ config, onChange }: ClockControlsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<Pane | null>(null);
  const configRef = useRef(config);
  const paramsRef = useRef<ClockConfig>(JSON.parse(JSON.stringify(config)));

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
    paramsRef.current = JSON.parse(JSON.stringify(config));
  }, [config]); // Update when config changes

  // Initialize pane once
  useEffect(() => {
    if (!containerRef.current || paneRef.current) return;

    // Create a new pane
    const pane = new Pane({
      container: containerRef.current,
    });
    paneRef.current = pane;

    const hands = ['hourHand', 'minuteHand', 'secondHand'] as const;
    const handLabels = ['Hour Hand', 'Minute Hand', 'Second Hand'];

    // Add controls for each hand
    hands.forEach((handKey, index) => {
      const handFolder = pane.addFolder({
        title: handLabels[index] || handKey,
      });

      // Hand color
      handFolder.addBinding(paramsRef.current[handKey], 'color', { label: 'Color' }).on("change", (ev) => {
        const newConfig = {
          ...configRef.current,
          [handKey]: {
            ...configRef.current[handKey],
            color: ev.value,
          },
        };
        handleConfigChange(newConfig);
      });

      // Hand length
      handFolder.addBinding(paramsRef.current[handKey], 'length', {
        label: 'Length',
        min: 0.5,
        max: 5,
        step: 0.1,
      }).on("change", (ev) => {
        const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG[handKey].length;
        const newConfig = {
          ...configRef.current,
          [handKey]: {
            ...configRef.current[handKey],
            length: value,
          },
        };
        handleConfigChange(newConfig);
      });

      // Circle subgroup
      const circleFolder = handFolder.addFolder({
        title: 'Circle',
      });

      // Circle show/hide
      circleFolder.addBinding(paramsRef.current[handKey].circle, 'show', { label: 'Show' }).on("change", (ev) => {
        const newConfig = {
          ...configRef.current,
          [handKey]: {
            ...configRef.current[handKey],
            circle: {
              ...configRef.current[handKey].circle,
              show: ev.value,
            },
          },
        };
        handleConfigChange(newConfig);
      });

      // Circle radius
      circleFolder.addBinding(paramsRef.current[handKey].circle, 'radius', {
        label: 'Radius',
        min: 0.01,
        max: 0.5,
        step: 0.01,
      }).on("change", (ev) => {
        const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG[handKey].circle.radius;
        const newConfig = {
          ...configRef.current,
          [handKey]: {
            ...configRef.current[handKey],
            circle: {
              ...configRef.current[handKey].circle,
              radius: value,
            },
          },
        };
        handleConfigChange(newConfig);
      });

      // Circle filled
      circleFolder.addBinding(paramsRef.current[handKey].circle, 'filled', { label: 'Filled' }).on("change", (ev) => {
        const newConfig = {
          ...configRef.current,
          [handKey]: {
            ...configRef.current[handKey],
            circle: {
              ...configRef.current[handKey].circle,
              filled: ev.value,
            },
          },
        };
        handleConfigChange(newConfig);
      });

      // Circle stroke width
      circleFolder.addBinding(paramsRef.current[handKey].circle, 'strokeWidth', {
        label: 'Stroke Width',
        min: 0.01,
        max: 0.2,
        step: 0.01,
      }).on("change", (ev) => {
        const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG[handKey].circle.strokeWidth;
        const newConfig = {
          ...configRef.current,
          [handKey]: {
            ...configRef.current[handKey],
            circle: {
              ...configRef.current[handKey].circle,
              strokeWidth: value,
            },
          },
        };
        handleConfigChange(newConfig);
      });
    });

    // Add face controls
    const faceFolder = pane.addFolder({
      title: 'Clock Face',
    });

    // Face background color
    faceFolder.addBinding(paramsRef.current.face, 'background', { label: 'Background' }).on("change", (ev) => {
      const newConfig = {
        ...configRef.current,
        face: {
          ...configRef.current.face,
          background: ev.value,
        },
      };
      handleConfigChange(newConfig);
    });

    // Face numbers color
    faceFolder.addBinding(paramsRef.current.face, 'numbers', { label: 'Numbers' }).on("change", (ev) => {
      const newConfig = {
        ...configRef.current,
        face: {
          ...configRef.current.face,
          numbers: ev.value,
        },
      };
      handleConfigChange(newConfig);
    });

    // Hour numbers radius
    faceFolder.addBinding(paramsRef.current.face, 'hourNumbers', {
      label: 'Hour Numbers Radius',
      min: 0.5,
      max: 5,
      step: 0.1,
    }).on("change", (ev) => {
      const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG.face.hourNumbers;
      const newConfig = {
        ...configRef.current,
        face: {
          ...configRef.current.face,
          hourNumbers: value,
        },
      };
      handleConfigChange(newConfig);
    });

    // Minute numbers radius
    faceFolder.addBinding(paramsRef.current.face, 'minuteNumbers', {
      label: 'Minute Numbers Radius',
      min: 0.5,
      max: 5,
      step: 0.1,
    }).on("change", (ev) => {
      const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG.face.minuteNumbers;
      const newConfig = {
        ...configRef.current,
        face: {
          ...configRef.current.face,
          minuteNumbers: value,
        },
      };
      handleConfigChange(newConfig);
    });

    // Tick marks radius
    faceFolder.addBinding(paramsRef.current.face, 'tickMarks', {
      label: 'Tick Marks Radius',
      min: 0.5,
      max: 5,
      step: 0.1,
    }).on("change", (ev) => {
      const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG.face.tickMarks;
      const newConfig = {
        ...configRef.current,
        face: {
          ...configRef.current.face,
          tickMarks: value,
        },
      };
      handleConfigChange(newConfig);
    });

  }, [handleConfigChange]); // Only initialize once

  // Update params when config changes externally (not from our own changes)
  useEffect(() => {
    if (!paneRef.current) return;

    // Update params to match current config
    paramsRef.current = JSON.parse(JSON.stringify(config));

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
