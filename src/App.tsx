import { Canvas } from "@react-three/fiber";
import { Clock } from "./components/Clock";
import { ClockControls } from "./components/ClockControls";
import { PreviewCameraReset } from "./components/PreviewCameraReset";
import { PrintPreview } from "./components/PrintPreview";
import { useState, useEffect, useCallback } from "react";
import type { ClockConfig, PrintSettings } from "./types/clock";
import { DEFAULT_CONFIG, DEFAULT_PRINT_SETTINGS } from "./types/clock";
import { updateFavicon } from "./utils/faviconGenerator";
import { downloadBlob, exportPrintModelZip, PRINT_FONT_URL } from "./utils/printModel";
import "./App.css";

const HEX_RE = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/;

const parseNumberInRange = (
  raw: string | null,
  min: number,
  max: number,
): number | undefined => {
  if (raw === null) return undefined;
  const num = parseFloat(raw);
  if (isNaN(num) || num < min || num > max) return undefined;
  return num;
};

const parseBool = (raw: string | null): boolean | undefined => {
  if (raw === null) return undefined;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return undefined;
};

const parseHexColor = (raw: string | null): string | undefined => {
  if (raw === null || !HEX_RE.test(raw)) return undefined;
  return `#${raw}`;
};

const getConfigFromURL = (): ClockConfig => {
  const params = new URLSearchParams(window.location.search);
  const config: ClockConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); // Deep copy

  const hands = ['hourHand', 'minuteHand', 'secondHand'] as const;

  // Parse hand parameters
  hands.forEach(handKey => {
    const hand = config[handKey];

    const showValue = parseBool(params.get(`${handKey}Show`));
    if (showValue !== undefined) hand.show = showValue;

    const colorValue = parseHexColor(params.get(`${handKey}Color`));
    if (colorValue) hand.color = colorValue;

    const lengthValue = parseNumberInRange(params.get(`${handKey}Length`), 0.1, 10);
    if (lengthValue !== undefined) hand.length = lengthValue;

    const thicknessValue = parseNumberInRange(params.get(`${handKey}Thickness`), 0.005, 1);
    if (thicknessValue !== undefined) hand.thickness = thicknessValue;

    // Tip circle
    const circleShow = parseBool(params.get(`${handKey}CircleShow`));
    if (circleShow !== undefined) hand.circle.show = circleShow;
    const circleRadius = parseNumberInRange(params.get(`${handKey}CircleRadius`), 0.01, 1);
    if (circleRadius !== undefined) hand.circle.radius = circleRadius;
    const circleFilled = parseBool(params.get(`${handKey}CircleFilled`));
    if (circleFilled !== undefined) hand.circle.filled = circleFilled;
    const circleStroke = parseNumberInRange(params.get(`${handKey}CircleStrokeWidth`), 0.01, 0.5);
    if (circleStroke !== undefined) hand.circle.strokeWidth = circleStroke;

    // Center circle
    const centerShow = parseBool(params.get(`${handKey}CenterShow`));
    if (centerShow !== undefined) hand.centerCircle.show = centerShow;
    const centerRadius = parseNumberInRange(params.get(`${handKey}CenterRadius`), 0.01, 2);
    if (centerRadius !== undefined) hand.centerCircle.radius = centerRadius;
    const centerFilled = parseBool(params.get(`${handKey}CenterFilled`));
    if (centerFilled !== undefined) hand.centerCircle.filled = centerFilled;
    const centerStroke = parseNumberInRange(params.get(`${handKey}CenterStroke`), 0.01, 0.5);
    if (centerStroke !== undefined) hand.centerCircle.strokeWidth = centerStroke;
    const centerColor = parseHexColor(params.get(`${handKey}CenterColor`));
    if (centerColor) hand.centerCircle.color = centerColor;

    // End cap
    const capShape = params.get(`${handKey}CapShape`);
    if (capShape === 'flat' || capShape === 'rounded' || capShape === 'pointed') {
      hand.endCap.shape = capShape;
    }
    const tipRadius = parseNumberInRange(params.get(`${handKey}TipRadius`), 0, 1);
    if (tipRadius !== undefined) hand.endCap.tipRadius = tipRadius;
    const tipAngle = parseNumberInRange(params.get(`${handKey}TipAngle`), 1, 179);
    if (tipAngle !== undefined) hand.endCap.tipAngle = tipAngle;
    const baseScale = parseNumberInRange(params.get(`${handKey}BaseScale`), 0.1, 10);
    if (baseScale !== undefined) hand.endCap.baseScale = baseScale;
    const tipScale = parseNumberInRange(params.get(`${handKey}TipScale`), 0.05, 10);
    if (tipScale !== undefined) hand.endCap.tipScale = tipScale;

    // Slot
    const slotShow = parseBool(params.get(`${handKey}SlotShow`));
    if (slotShow !== undefined) hand.endCap.slot.show = slotShow;
    const slotLength = parseNumberInRange(params.get(`${handKey}SlotLength`), 0.01, 10);
    if (slotLength !== undefined) hand.endCap.slot.length = slotLength;
    const slotWidth = parseNumberInRange(params.get(`${handKey}SlotWidth`), 0.001, 1);
    if (slotWidth !== undefined) hand.endCap.slot.width = slotWidth;
    const slotInset = parseNumberInRange(params.get(`${handKey}SlotInset`), 0, 10);
    if (slotInset !== undefined) hand.endCap.slot.inset = slotInset;
  });
  
  // Parse face parameters
  const faceBackgroundValue = params.get('faceBackground');
  if (faceBackgroundValue && /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(faceBackgroundValue)) {
    config.face.background = `#${faceBackgroundValue}`;
  }
  
  const faceNumbersValue = params.get('faceNumbers');
  if (faceNumbersValue && /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(faceNumbersValue)) {
    config.face.numbers = `#${faceNumbersValue}`;
  }
  
  const faceHourNumbersValue = params.get('faceHourNumbers');
  if (faceHourNumbersValue) {
    const numValue = parseFloat(faceHourNumbersValue);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
      config.face.hourNumbers = numValue;
    }
  }
  
  const faceMinuteNumbersValue = params.get('faceMinuteNumbers');
  if (faceMinuteNumbersValue) {
    const numValue = parseFloat(faceMinuteNumbersValue);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
      config.face.minuteNumbers = numValue;
    }
  }
  
  const faceTickMarksValue = params.get('faceTickMarks');
  if (faceTickMarksValue) {
    const numValue = parseFloat(faceTickMarksValue);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
      config.face.tickMarks = numValue;
    }
  }
  
  return config;
};

const getPrintSettingsFromURL = (): PrintSettings => {
  const params = new URLSearchParams(window.location.search);
  const settings: PrintSettings = { ...DEFAULT_PRINT_SETTINGS };
  const numericParams: Array<[keyof PrintSettings, string, number, number]> = [
    ["diameterMm", "printDiameterMm", 50, 500],
    ["centerHoleMm", "printCenterHoleMm", 0, 60],
    ["baseThicknessMm", "printBaseThicknessMm", 0.4, 10],
    ["markingHeightMm", "printMarkingHeightMm", 0.1, 5],
    ["layerHeightMm", "printLayerHeightMm", 0.05, 1],
    ["nozzleDiameterMm", "printNozzleDiameterMm", 0.1, 2],
  ];

  numericParams.forEach(([key, param, min, max]) => {
    const value = params.get(param);
    if (!value) return;
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      settings[key] = parsed;
    }
  });

  return settings;
};

function App() {
  const [config, setConfig] = useState<ClockConfig>(() => {
    // Initialize with URL parameters if available
    return getConfigFromURL();
  });
  const [printSettings, setPrintSettings] = useState<PrintSettings>(() => getPrintSettingsFromURL());
  const [previewMode, setPreviewMode] = useState<"clock" | "print">("clock");
  const [explodeMm, setExplodeMm] = useState(0);
  const [printWarnings, setPrintWarnings] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Update favicon every second with current config and time
  useEffect(() => {
    // Initial favicon update
    updateFavicon(config);
    
    // Set up interval to update favicon every second
    const faviconInterval = setInterval(() => {
      updateFavicon(config);
    }, 1000);
    
    return () => clearInterval(faviconInterval);
  }, [config]);

  const handleExportSTL = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await exportPrintModelZip(config, printSettings);
      downloadBlob(blob, "clock-face-stl.zip");
    } finally {
      setIsExporting(false);
    }
  }, [config, printSettings]);

  return (
    <div className="app">
      <a 
        href="https://github.com/corychainsman/clock" 
        className="github-corner" 
        aria-label="View source on GitHub"
      >
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 250 250" 
          style={{
            fill: '#fff', 
            color: '#151513', 
            position: 'absolute', 
            top: 0, 
            border: 0, 
            left: 0, 
            transform: 'scale(-1, 1)',
            zIndex: 1001
          }} 
          aria-hidden="true"
        >
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"/>
          <path 
            d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" 
            fill="currentColor" 
            style={{transformOrigin: '130px 106px'}} 
            className="octo-arm"
          />
          <path 
            d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" 
            fill="currentColor" 
            className="octo-body"
          />
        </svg>
      </a>
      <ClockControls
        config={config}
        onChange={setConfig}
        printSettings={printSettings}
        onPrintSettingsChange={setPrintSettings}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        explodeMm={explodeMm}
        onExplodeMmChange={setExplodeMm}
        printWarnings={printWarnings}
        isExporting={isExporting}
        onExportSTL={handleExportSTL}
      />
      <Canvas
        orthographic
        camera={{
          position: previewMode === "print" ? [0, -4, 8] : [0, 0, 10],
          zoom: previewMode === "print" ? 70 : undefined,
        }}
      >
        <PreviewCameraReset previewMode={previewMode} />
        {previewMode === "print" ? (
          <PrintPreview
            config={config}
            settings={printSettings}
            explodeMm={explodeMm}
            onWarningsChange={setPrintWarnings}
          />
        ) : (
          <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Clock config={config} fontUrl={PRINT_FONT_URL} />
          </>
        )}
      </Canvas>
    </div>
  );
}

export default App;
