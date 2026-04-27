import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { Pane } from "tweakpane";
import type { ClockConfig, PrintSettings } from "../types/clock";
import { DEFAULT_CONFIG, DEFAULT_PRINT_SETTINGS } from "../types/clock";
import { ConfigManager } from "../utils/ConfigManager";
import { getPresetById, getPresetOptions } from "../types/presets";

interface ClockControlsProps {
  config: ClockConfig;
  onChange: (newConfig: ClockConfig) => void;
  printSettings: PrintSettings;
  onPrintSettingsChange: (newSettings: PrintSettings) => void;
  previewMode: "clock" | "print";
  onPreviewModeChange: (newMode: "clock" | "print") => void;
  explodeMm: number;
  onExplodeMmChange: (newExplodeMm: number) => void;
  printWarnings: string[];
  isExporting: boolean;
  onExportSTL: () => void;
}

interface PaneParams extends ClockConfig {
  previewMode: "clock" | "print";
  explodeMm: number;
  print: PrintSettings;
  warningSummary: string;
}

export const ClockControls = ({
  config,
  onChange,
  printSettings,
  onPrintSettingsChange,
  previewMode,
  onPreviewModeChange,
  explodeMm,
  onExplodeMmChange,
  printWarnings,
  onExportSTL,
}: ClockControlsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<Pane | null>(null);
  const configRef = useRef(config);
  const printSettingsRef = useRef(printSettings);
  const previewModeRef = useRef(previewMode);
  const explodeMmRef = useRef(explodeMm);
  const printWarningsRef = useRef(printWarnings);
  const onPreviewModeChangeRef = useRef(onPreviewModeChange);
  const onExplodeMmChangeRef = useRef(onExplodeMmChange);
  const onExportSTLRef = useRef(onExportSTL);
  const paramsRef = useRef<PaneParams>({
    ...JSON.parse(JSON.stringify(config)),
    previewMode,
    explodeMm,
    print: { ...printSettings },
    warningSummary: "",
  });
  const configManagerRef = useRef<ConfigManager | null>(null);

  // Keep config ref updated
  useLayoutEffect(() => {
    configRef.current = config;
  }, [config]);

  useLayoutEffect(() => {
    printSettingsRef.current = printSettings;
  }, [printSettings]);

  useLayoutEffect(() => {
    previewModeRef.current = previewMode;
  }, [previewMode]);

  useLayoutEffect(() => {
    explodeMmRef.current = explodeMm;
  }, [explodeMm]);

  useLayoutEffect(() => {
    printWarningsRef.current = printWarnings;
  }, [printWarnings]);

  useEffect(() => {
    onPreviewModeChangeRef.current = onPreviewModeChange;
  }, [onPreviewModeChange]);

  useEffect(() => {
    onExplodeMmChangeRef.current = onExplodeMmChange;
  }, [onExplodeMmChange]);

  useEffect(() => {
    onExportSTLRef.current = onExportSTL;
  }, [onExportSTL]);

  const handleConfigChange = useCallback((newConfig: ClockConfig) => {
    onChange(newConfig);
  }, [onChange]);

  const updatePrintSetting = useCallback((
    key: keyof PrintSettings,
    value: unknown,
    fallback: number
  ) => {
    const nextValue = typeof value === 'number' && !isNaN(value) ? value : fallback;
    onPrintSettingsChange({
      ...printSettingsRef.current,
      [key]: nextValue,
    });
  }, [onPrintSettingsChange]);

  const addPrintParams = useCallback((params: URLSearchParams) => {
    const mappings: Array<[keyof PrintSettings, string]> = [
      ['diameterMm', 'printDiameterMm'],
      ['centerHoleMm', 'printCenterHoleMm'],
      ['baseThicknessMm', 'printBaseThicknessMm'],
      ['markingHeightMm', 'printMarkingHeightMm'],
      ['layerHeightMm', 'printLayerHeightMm'],
      ['nozzleDiameterMm', 'printNozzleDiameterMm'],
    ];

    mappings.forEach(([key, param]) => {
      const value = printSettingsRef.current[key];
      if (value !== DEFAULT_PRINT_SETTINGS[key]) {
        params.set(param, String(Math.round(value * 100) / 100));
      }
    });
  }, []);

  const syncPaneParams = useCallback(() => {
    const params = paramsRef.current;
    const currentConfig = configRef.current;
    const currentPrintSettings = printSettingsRef.current;
    const currentWarnings = printWarningsRef.current;

    params.preset = getPresetById(currentConfig.preset || 'default')?.name || 'Default';
    Object.assign(params.face, JSON.parse(JSON.stringify(currentConfig.face)));

    const hands = ['hourHand', 'minuteHand', 'secondHand'] as const;
    hands.forEach((handKey) => {
      Object.assign(params[handKey], JSON.parse(JSON.stringify(currentConfig[handKey])));
      Object.assign(params[handKey].circle, JSON.parse(JSON.stringify(currentConfig[handKey].circle)));
    });

    params.previewMode = previewModeRef.current;
    params.explodeMm = explodeMmRef.current;
    Object.assign(params.print, currentPrintSettings);
    params.warningSummary = currentWarnings.length
      ? currentWarnings.join("\n")
      : "No printability warnings.";
  }, []);

  const syncPresetToPaneParams = useCallback((presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;

    const params = paramsRef.current;
    params.preset = preset.name;
    Object.assign(params.face, JSON.parse(JSON.stringify(preset.config.face)));

    const hands = ['hourHand', 'minuteHand', 'secondHand'] as const;
    hands.forEach((handKey) => {
      Object.assign(params[handKey], JSON.parse(JSON.stringify(preset.config[handKey])));
      Object.assign(params[handKey].circle, JSON.parse(JSON.stringify(preset.config[handKey].circle)));
    });

    paneRef.current?.refresh();
  }, []);

  // Initialize config manager
  useEffect(() => {
    if (!configManagerRef.current) {
      configManagerRef.current = new ConfigManager(config, handleConfigChange);
      
      // Register preset dependency
      configManagerRef.current.registerDependency(
        'preset',
        ['hourHand', 'minuteHand', 'secondHand', 'face'],
        (_, newPresetId) => {
          if (!newPresetId || typeof newPresetId !== 'string') return {};
          
          const preset = getPresetById(newPresetId);
          if (!preset) {
            return {};
          }
          
          return {
            ...preset.config,
            preset: newPresetId,
          };
        }
      );
    } else {
      // Update the ConfigManager's internal config when external config changes
      configManagerRef.current.setConfig(config);
    }
  }, [config, handleConfigChange]);

  useEffect(() => {
    syncPaneParams();
    paneRef.current?.refresh();
  }, [syncPaneParams]);

  // Create pane once. Recreating it during state changes interrupts active slider drags.
  useEffect(() => {
    if (!containerRef.current) return;
    
    syncPaneParams();
    
    // Create pane with updated config
    const pane = new Pane({
      container: containerRef.current,
    });
    paneRef.current = pane;

      const hands = ['hourHand', 'minuteHand', 'secondHand'] as const;
    const handLabels = ['Hour Hand', 'Minute Hand', 'Second Hand'];

    // Add preset dropdown first
    const presetOptions = getPresetOptions();
    const currentPreset = paramsRef.current.preset || 'default';
    paramsRef.current.preset = currentPreset;
    
    pane.addBinding(paramsRef.current, 'preset', {
      label: 'Preset',
      options: presetOptions,
    }).on('change', (ev) => {
      if (configManagerRef.current) {
        const presetId = String(ev.value).toLowerCase();
        syncPresetToPaneParams(presetId);
        configManagerRef.current.updateConfig('preset', presetId);
      }
    });

    pane.addBinding(paramsRef.current, 'previewMode', {
      label: 'Preview',
      options: {
        Clock: 'clock',
        Print: 'print',
      },
    }).on('change', (ev) => {
      if (ev.value === 'clock' || ev.value === 'print') {
        onPreviewModeChangeRef.current(ev.value);
      }
    });

    // Create main parameters folder
    const parametersFolder = pane.addFolder({
      title: 'Parameters',
    });

    // Add face controls
    const faceFolder = parametersFolder.addFolder({
      title: 'Clock Face',
      expanded: false
    });

    // Face background color
    faceFolder.addBinding(paramsRef.current.face, 'background', { label: 'Background' }).on("change", (ev) => {
      if (configManagerRef.current) {
        configManagerRef.current.updateConfig('face.background', ev.value);
      }
    });

    // Face numbers color
    faceFolder.addBinding(paramsRef.current.face, 'numbers', { label: 'Numbers' }).on("change", (ev) => {
      if (configManagerRef.current) {
        configManagerRef.current.updateConfig('face.numbers', ev.value);
      }
    });

    // Hour numbers radius
    faceFolder.addBinding(paramsRef.current.face, 'hourNumbers', {
      label: 'Hour Numbers Radius',
      min: 0.5,
      max: 5,
      step: 0.1,
    }).on("change", (ev) => {
      if (configManagerRef.current) {
        const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG.face.hourNumbers;
        configManagerRef.current.updateConfig('face.hourNumbers', value);
      }
    });

    // Minute numbers radius
    faceFolder.addBinding(paramsRef.current.face, 'minuteNumbers', {
      label: 'Minute Numbers Radius',
      min: 0.5,
      max: 5,
      step: 0.1,
    }).on("change", (ev) => {
      if (configManagerRef.current) {
        const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG.face.minuteNumbers;
        configManagerRef.current.updateConfig('face.minuteNumbers', value);
      }
    });

    // Tick marks radius
    faceFolder.addBinding(paramsRef.current.face, 'tickMarks', {
      label: 'Tick Marks Radius',
      min: 0.5,
      max: 5,
      step: 0.1,
    }).on("change", (ev) => {
      if (configManagerRef.current) {
        const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG.face.tickMarks;
        configManagerRef.current.updateConfig('face.tickMarks', value);
      }
    });

    // Add controls for each hand
    hands.forEach((handKey, index) => {
      const handFolder = parametersFolder.addFolder({
        title: handLabels[index] || handKey,
        expanded: false
      });

      // Hand color
      handFolder.addBinding(paramsRef.current[handKey], 'color', { label: 'Color' }).on("change", (ev) => {
        if (configManagerRef.current) {
          configManagerRef.current.updateConfig(`${handKey}.color`, ev.value);
        }
      });

      // Hand length
      handFolder.addBinding(paramsRef.current[handKey], 'length', {
        label: 'Length',
        min: 0.5,
        max: 5,
        step: 0.1,
      }).on("change", (ev) => {
        if (configManagerRef.current) {
          const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG[handKey].length;
          configManagerRef.current.updateConfig(`${handKey}.length`, value);
        }
      });

      // Circle subgroup
      const circleFolder = handFolder.addFolder({
        title: 'Circle',
      });

      // Circle show/hide
      circleFolder.addBinding(paramsRef.current[handKey].circle, 'show', { label: 'Show' }).on("change", (ev) => {
        if (configManagerRef.current) {
          configManagerRef.current.updateConfig(`${handKey}.circle.show`, ev.value);
        }
      });

      // Circle radius
      circleFolder.addBinding(paramsRef.current[handKey].circle, 'radius', {
        label: 'Radius',
        min: 0.01,
        max: 0.5,
        step: 0.01,
      }).on("change", (ev) => {
        if (configManagerRef.current) {
          const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG[handKey].circle.radius;
          configManagerRef.current.updateConfig(`${handKey}.circle.radius`, value);
        }
      });

      // Circle filled
      circleFolder.addBinding(paramsRef.current[handKey].circle, 'filled', { label: 'Filled' }).on("change", (ev) => {
        if (configManagerRef.current) {
          configManagerRef.current.updateConfig(`${handKey}.circle.filled`, ev.value);
        }
      });

      // Circle stroke width
      circleFolder.addBinding(paramsRef.current[handKey].circle, 'strokeWidth', {
        label: 'Stroke Width',
        min: 0.01,
        max: 0.2,
        step: 0.01,
      }).on("change", (ev) => {
        if (configManagerRef.current) {
          const value = typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : DEFAULT_CONFIG[handKey].circle.strokeWidth;
          configManagerRef.current.updateConfig(`${handKey}.circle.strokeWidth`, value);
        }
      });
    });

    const printFolder = pane.addFolder({
      title: '3D Print Export',
      expanded: true,
    });

    printFolder.addBinding(paramsRef.current.print, 'diameterMm', {
      label: 'Diameter (mm)',
      min: 50,
      max: 500,
      step: 1,
    }).on('change', (ev) => {
      updatePrintSetting('diameterMm', ev.value, DEFAULT_PRINT_SETTINGS.diameterMm);
    });

    printFolder.addBinding(paramsRef.current.print, 'centerHoleMm', {
      label: 'Center Hole (mm)',
      min: 0,
      max: 60,
      step: 0.1,
    }).on('change', (ev) => {
      updatePrintSetting('centerHoleMm', ev.value, DEFAULT_PRINT_SETTINGS.centerHoleMm);
    });

    printFolder.addBinding(paramsRef.current.print, 'baseThicknessMm', {
      label: 'Base Thick. (mm)',
      min: 0.4,
      max: 10,
      step: 0.1,
    }).on('change', (ev) => {
      updatePrintSetting('baseThicknessMm', ev.value, DEFAULT_PRINT_SETTINGS.baseThicknessMm);
    });

    printFolder.addBinding(paramsRef.current.print, 'markingHeightMm', {
      label: 'Marking Height (mm)',
      min: 0.1,
      max: 5,
      step: 0.1,
    }).on('change', (ev) => {
      updatePrintSetting('markingHeightMm', ev.value, DEFAULT_PRINT_SETTINGS.markingHeightMm);
    });

    printFolder.addBinding(paramsRef.current.print, 'layerHeightMm', {
      label: 'Layer Height (mm)',
      min: 0.05,
      max: 1,
      step: 0.01,
    }).on('change', (ev) => {
      updatePrintSetting('layerHeightMm', ev.value, DEFAULT_PRINT_SETTINGS.layerHeightMm);
    });

    printFolder.addBinding(paramsRef.current.print, 'nozzleDiameterMm', {
      label: 'Nozzle (mm)',
      min: 0.1,
      max: 2,
      step: 0.05,
    }).on('change', (ev) => {
      updatePrintSetting('nozzleDiameterMm', ev.value, DEFAULT_PRINT_SETTINGS.nozzleDiameterMm);
    });

    printFolder.addBinding(paramsRef.current, 'explodeMm', {
      label: 'Explode (mm)',
      min: 0,
      max: 30,
      step: 0.5,
    }).on('change', (ev) => {
      onExplodeMmChangeRef.current(typeof ev.value === 'number' && !isNaN(ev.value) ? ev.value : 0);
    });

    printFolder.addBinding(paramsRef.current, 'warningSummary', {
      label: 'Warnings',
      readonly: true,
      multiline: true,
      rows: 4,
    });

    printFolder.addButton({
      title: 'Export STL Zip',
    }).on('click', () => {
      onExportSTLRef.current();
    });

    // Add Share button
    pane.addButton({
      title: 'Share Config',
    }).on('click', () => {
      const params = new URLSearchParams();

      const hands = ['hourHand', 'minuteHand', 'secondHand'] as const;

      // Add hand parameters
      hands.forEach(handKey => {
        const hand = configRef.current[handKey];
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
      if (configRef.current.face.background !== DEFAULT_CONFIG.face.background) {
        params.set('faceBackground', configRef.current.face.background.replace('#', ''));
      }

      if (configRef.current.face.numbers !== DEFAULT_CONFIG.face.numbers) {
        params.set('faceNumbers', configRef.current.face.numbers.replace('#', ''));
      }

      if (configRef.current.face.hourNumbers !== DEFAULT_CONFIG.face.hourNumbers) {
        const roundedValue = Math.round(configRef.current.face.hourNumbers * 10) / 10;
        params.set('faceHourNumbers', roundedValue.toString());
      }

      if (configRef.current.face.minuteNumbers !== DEFAULT_CONFIG.face.minuteNumbers) {
        const roundedValue = Math.round(configRef.current.face.minuteNumbers * 10) / 10;
        params.set('faceMinuteNumbers', roundedValue.toString());
      }

      if (configRef.current.face.tickMarks !== DEFAULT_CONFIG.face.tickMarks) {
        const roundedValue = Math.round(configRef.current.face.tickMarks * 10) / 10;
        params.set('faceTickMarks', roundedValue.toString());
      }

      addPrintParams(params);

      const shareURL = params.toString()
        ? `${window.location.origin}${window.location.pathname}?${params.toString()}`
        : `${window.location.origin}${window.location.pathname}`;

      // Copy to clipboard
      navigator.clipboard.writeText(shareURL).then(() => {
        alert(`URL copied to clipboard: ${shareURL}`);
      }).catch(() => {
        alert(`Share URL: ${shareURL}`);
      });
    });

    return () => {
      pane.dispose();
      paneRef.current = null;
    };
  }, [addPrintParams, config.preset, handleConfigChange, syncPaneParams, syncPresetToPaneParams, updatePrintSetting]);


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
