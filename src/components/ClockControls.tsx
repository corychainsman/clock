import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { Pane } from "tweakpane";
import type { ClockConfig, ClockHand, PrintSettings } from "../types/clock";
import { DEFAULT_CONFIG, DEFAULT_PRINT_SETTINGS } from "../types/clock";
import { ConfigManager } from "../utils/ConfigManager";
import { getPresetById, getPresetOptions } from "../types/presets";

// Deep-merge primitives from source into target without replacing nested object
// references. Tweakpane bindings hold a reference to a specific (sub)object, so
// reassigning that reference (as Object.assign would for nested objects) would
// orphan the binding and break refresh.
const deepMergeInto = (target: Record<string, unknown>, source: Record<string, unknown>) => {
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }
      deepMergeInto(target[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
};

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
    deepMergeInto(params.face as unknown as Record<string, unknown>, currentConfig.face as unknown as Record<string, unknown>);

    const hands = ['hourHand', 'minuteHand', 'secondHand'] as const;
    hands.forEach((handKey) => {
      deepMergeInto(
        params[handKey] as unknown as Record<string, unknown>,
        currentConfig[handKey] as unknown as Record<string, unknown>
      );
    });

    params.previewMode = previewModeRef.current;
    params.explodeMm = explodeMmRef.current;
    deepMergeInto(params.print as unknown as Record<string, unknown>, currentPrintSettings as unknown as Record<string, unknown>);
    params.warningSummary = currentWarnings.length
      ? currentWarnings.join("\n")
      : "No printability warnings.";
  }, []);

  const syncPresetToPaneParams = useCallback((presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;

    const params = paramsRef.current;
    params.preset = preset.name;
    deepMergeInto(params.face as unknown as Record<string, unknown>, preset.config.face as unknown as Record<string, unknown>);

    const hands = ['hourHand', 'minuteHand', 'secondHand'] as const;
    hands.forEach((handKey) => {
      deepMergeInto(
        params[handKey] as unknown as Record<string, unknown>,
        preset.config[handKey] as unknown as Record<string, unknown>
      );
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
      title: "Clock Controls",
      expanded: true,
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

    const numFallback = (value: unknown, fallback: number): number =>
      typeof value === 'number' && !isNaN(value) ? value : fallback;

    const bindNumber = <T extends object, K extends keyof T & string>(
      folder: ReturnType<Pane['addFolder']>,
      target: T,
      key: K,
      opts: { label: string; min: number; max: number; step: number },
      path: string,
      fallback: number,
    ) => {
      folder.addBinding(target, key, opts).on('change', (ev) => {
        if (configManagerRef.current) {
          configManagerRef.current.updateConfig(path, numFallback(ev.value, fallback));
        }
      });
    };

    const bindBool = <T extends object, K extends keyof T & string>(
      folder: ReturnType<Pane['addFolder']>,
      target: T,
      key: K,
      label: string,
      path: string,
    ) => {
      folder.addBinding(target, key, { label }).on('change', (ev) => {
        if (configManagerRef.current) {
          configManagerRef.current.updateConfig(path, ev.value);
        }
      });
    };

    const bindColor = <T extends object, K extends keyof T & string>(
      folder: ReturnType<Pane['addFolder']>,
      target: T,
      key: K,
      label: string,
      path: string,
    ) => {
      folder.addBinding(target, key, { label }).on('change', (ev) => {
        if (configManagerRef.current) {
          configManagerRef.current.updateConfig(path, ev.value);
        }
      });
    };

    // Add controls for each hand
    hands.forEach((handKey, index) => {
      const handFolder = parametersFolder.addFolder({
        title: handLabels[index] || handKey,
        expanded: false
      });
      const handDefaults: ClockHand = DEFAULT_CONFIG[handKey];

      bindBool(handFolder, paramsRef.current[handKey], 'show', 'Show', `${handKey}.show`);
      bindColor(handFolder, paramsRef.current[handKey], 'color', 'Color', `${handKey}.color`);
      bindNumber(handFolder, paramsRef.current[handKey], 'length',
        { label: 'Length', min: 0.5, max: 5, step: 0.1 },
        `${handKey}.length`, handDefaults.length);
      bindNumber(handFolder, paramsRef.current[handKey], 'thickness',
        { label: 'Thickness', min: 0.01, max: 0.5, step: 0.01 },
        `${handKey}.thickness`, handDefaults.thickness);

      // Tip Circle subgroup (existing)
      const tipCircleFolder = handFolder.addFolder({ title: 'Tip Circle', expanded: false });
      bindBool(tipCircleFolder, paramsRef.current[handKey].circle, 'show', 'Show', `${handKey}.circle.show`);
      bindNumber(tipCircleFolder, paramsRef.current[handKey].circle, 'radius',
        { label: 'Radius', min: 0.01, max: 0.5, step: 0.01 },
        `${handKey}.circle.radius`, handDefaults.circle.radius);
      bindBool(tipCircleFolder, paramsRef.current[handKey].circle, 'filled', 'Filled', `${handKey}.circle.filled`);
      bindNumber(tipCircleFolder, paramsRef.current[handKey].circle, 'strokeWidth',
        { label: 'Stroke Width', min: 0.01, max: 0.2, step: 0.01 },
        `${handKey}.circle.strokeWidth`, handDefaults.circle.strokeWidth);

      // Center Circle subgroup (new)
      const centerFolder = handFolder.addFolder({ title: 'Center Circle', expanded: false });
      bindBool(centerFolder, paramsRef.current[handKey].centerCircle, 'show', 'Show', `${handKey}.centerCircle.show`);
      bindNumber(centerFolder, paramsRef.current[handKey].centerCircle, 'radius',
        { label: 'Radius', min: 0.01, max: 1.0, step: 0.01 },
        `${handKey}.centerCircle.radius`, handDefaults.centerCircle.radius);
      bindBool(centerFolder, paramsRef.current[handKey].centerCircle, 'filled', 'Filled', `${handKey}.centerCircle.filled`);
      bindNumber(centerFolder, paramsRef.current[handKey].centerCircle, 'strokeWidth',
        { label: 'Stroke Width', min: 0.01, max: 0.2, step: 0.01 },
        `${handKey}.centerCircle.strokeWidth`, handDefaults.centerCircle.strokeWidth);
      bindColor(centerFolder, paramsRef.current[handKey].centerCircle, 'color', 'Color', `${handKey}.centerCircle.color`);

      // End Cap subgroup (new)
      const endCapFolder = handFolder.addFolder({ title: 'End Cap', expanded: false });
      endCapFolder.addBinding(paramsRef.current[handKey].endCap, 'shape', {
        label: 'Shape',
        options: { Flat: 'flat', Rounded: 'rounded', Pointed: 'pointed' },
      }).on('change', (ev) => {
        if (configManagerRef.current) {
          configManagerRef.current.updateConfig(`${handKey}.endCap.shape`, ev.value);
        }
      });
      bindNumber(endCapFolder, paramsRef.current[handKey].endCap, 'tipRadius',
        { label: 'Tip Radius', min: 0, max: 0.5, step: 0.01 },
        `${handKey}.endCap.tipRadius`, handDefaults.endCap.tipRadius);
      bindNumber(endCapFolder, paramsRef.current[handKey].endCap, 'tipAngle',
        { label: 'Tip Angle', min: 1, max: 179, step: 1 },
        `${handKey}.endCap.tipAngle`, handDefaults.endCap.tipAngle);
      bindNumber(endCapFolder, paramsRef.current[handKey].endCap, 'baseScale',
        { label: 'Base Scale', min: 0.1, max: 5, step: 0.05 },
        `${handKey}.endCap.baseScale`, handDefaults.endCap.baseScale);
      bindNumber(endCapFolder, paramsRef.current[handKey].endCap, 'tipScale',
        { label: 'Tip Scale', min: 0.05, max: 5, step: 0.05 },
        `${handKey}.endCap.tipScale`, handDefaults.endCap.tipScale);

      const slotFolder = endCapFolder.addFolder({ title: 'Slot', expanded: false });
      bindBool(slotFolder, paramsRef.current[handKey].endCap.slot, 'show', 'Show', `${handKey}.endCap.slot.show`);
      bindNumber(slotFolder, paramsRef.current[handKey].endCap.slot, 'length',
        { label: 'Length', min: 0.01, max: 5, step: 0.01 },
        `${handKey}.endCap.slot.length`, handDefaults.endCap.slot.length);
      bindNumber(slotFolder, paramsRef.current[handKey].endCap.slot, 'width',
        { label: 'Width', min: 0.005, max: 0.5, step: 0.005 },
        `${handKey}.endCap.slot.width`, handDefaults.endCap.slot.width);
      bindNumber(slotFolder, paramsRef.current[handKey].endCap.slot, 'inset',
        { label: 'Inset', min: 0, max: 5, step: 0.01 },
        `${handKey}.endCap.slot.inset`, handDefaults.endCap.slot.inset);
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

      const round = (value: number, places: number) => {
        const factor = Math.pow(10, places);
        return (Math.round(value * factor) / factor).toString();
      };

      // Add hand parameters
      hands.forEach(handKey => {
        const hand = configRef.current[handKey];
        const defaultHand = DEFAULT_CONFIG[handKey];

        if (hand.show !== defaultHand.show) {
          params.set(`${handKey}Show`, hand.show.toString());
        }

        if (hand.color !== defaultHand.color) {
          params.set(`${handKey}Color`, hand.color.replace('#', ''));
        }

        if (hand.length !== defaultHand.length) {
          params.set(`${handKey}Length`, round(hand.length, 1));
        }

        if (hand.thickness !== defaultHand.thickness) {
          params.set(`${handKey}Thickness`, round(hand.thickness, 2));
        }

        // Tip circle
        if (hand.circle.show !== defaultHand.circle.show) {
          params.set(`${handKey}CircleShow`, hand.circle.show.toString());
        }
        if (hand.circle.radius !== defaultHand.circle.radius) {
          params.set(`${handKey}CircleRadius`, round(hand.circle.radius, 2));
        }
        if (hand.circle.filled !== defaultHand.circle.filled) {
          params.set(`${handKey}CircleFilled`, hand.circle.filled.toString());
        }
        if (hand.circle.strokeWidth !== defaultHand.circle.strokeWidth) {
          params.set(`${handKey}CircleStrokeWidth`, round(hand.circle.strokeWidth, 2));
        }

        // Center circle
        if (hand.centerCircle.show !== defaultHand.centerCircle.show) {
          params.set(`${handKey}CenterShow`, hand.centerCircle.show.toString());
        }
        if (hand.centerCircle.radius !== defaultHand.centerCircle.radius) {
          params.set(`${handKey}CenterRadius`, round(hand.centerCircle.radius, 2));
        }
        if (hand.centerCircle.filled !== defaultHand.centerCircle.filled) {
          params.set(`${handKey}CenterFilled`, hand.centerCircle.filled.toString());
        }
        if (hand.centerCircle.strokeWidth !== defaultHand.centerCircle.strokeWidth) {
          params.set(`${handKey}CenterStroke`, round(hand.centerCircle.strokeWidth, 2));
        }
        if (hand.centerCircle.color !== defaultHand.centerCircle.color) {
          params.set(`${handKey}CenterColor`, hand.centerCircle.color.replace('#', ''));
        }

        // End cap
        if (hand.endCap.shape !== defaultHand.endCap.shape) {
          params.set(`${handKey}CapShape`, hand.endCap.shape);
        }
        if (hand.endCap.tipRadius !== defaultHand.endCap.tipRadius) {
          params.set(`${handKey}TipRadius`, round(hand.endCap.tipRadius, 2));
        }
        if (hand.endCap.tipAngle !== defaultHand.endCap.tipAngle) {
          params.set(`${handKey}TipAngle`, round(hand.endCap.tipAngle, 0));
        }
        if (hand.endCap.baseScale !== defaultHand.endCap.baseScale) {
          params.set(`${handKey}BaseScale`, round(hand.endCap.baseScale, 2));
        }
        if (hand.endCap.tipScale !== defaultHand.endCap.tipScale) {
          params.set(`${handKey}TipScale`, round(hand.endCap.tipScale, 2));
        }

        // Slot
        if (hand.endCap.slot.show !== defaultHand.endCap.slot.show) {
          params.set(`${handKey}SlotShow`, hand.endCap.slot.show.toString());
        }
        if (hand.endCap.slot.length !== defaultHand.endCap.slot.length) {
          params.set(`${handKey}SlotLength`, round(hand.endCap.slot.length, 2));
        }
        if (hand.endCap.slot.width !== defaultHand.endCap.slot.width) {
          params.set(`${handKey}SlotWidth`, round(hand.endCap.slot.width, 3));
        }
        if (hand.endCap.slot.inset !== defaultHand.endCap.slot.inset) {
          params.set(`${handKey}SlotInset`, round(hand.endCap.slot.inset, 2));
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
        ["--collapsed-pane-title-display" as string]: "none",
      }}
    />
  );
};
