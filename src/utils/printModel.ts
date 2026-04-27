import {
  BoxGeometry,
  BufferGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Shape,
} from "three";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import JSZip from "jszip";
import type { ClockConfig, PrintSettings } from "../types/clock";

export const PRINT_FONT_URL = `${import.meta.env.BASE_URL}fonts/NotoSans-Regular.ttf`;

const FACE_RADIUS_UNITS = 5;
const TICK_WIDTH_UNITS = 0.05;
const HOUR_FONT_SIZE_UNITS = 0.5;
const MINUTE_FONT_SIZE_UNITS = 0.3;

export interface PrintLayer {
  id: string;
  label: string;
  color: string;
  object: Group;
  zMinMm: number;
  zMaxMm: number;
}

export interface PrintModel {
  layers: PrintLayer[];
  combined: Group;
  warnings: string[];
  unitScale: number;
}

export interface ExportManifest {
  generatedAt: string;
  units: "millimeters";
  settings: PrintSettings;
  colors: Array<{
    id: string;
    label: string;
    color: string;
    file: string;
    zMinMm: number;
    zMaxMm: number;
  }>;
  combinedFile: string;
  warnings: string[];
}

let fontPromise: Promise<Font> | null = null;

export const loadPrintFont = async (): Promise<Font> => {
  if (!fontPromise) {
    const loader = new TTFLoader();
    fontPromise = loader.loadAsync(PRINT_FONT_URL).then((json) => new Font(json));
  }
  return fontPromise;
};

export const createPrintModel = (
  config: ClockConfig,
  settings: PrintSettings,
  font: Font,
  explodeMm = 0,
  materialType: "standard" | "basic" = "standard"
): PrintModel => {
  const unitScale = settings.diameterMm / (FACE_RADIUS_UNITS * 2);
  const faceRadiusMm = settings.diameterMm / 2;
  const centerHoleRadiusMm = Math.max(settings.centerHoleMm / 2, 0);
  const baseColor = config.face.background;
  const markingColor = config.face.numbers;
  const baseMaterial = createMaterial(baseColor, materialType);
  const markingMaterial = createMaterial(markingColor, materialType);
  const baseLayer = new Group();
  baseLayer.name = "clock-face-background";
  const markingLayer = new Group();
  markingLayer.name = "clock-face-markings";

  baseLayer.add(createBaseDisk(faceRadiusMm, centerHoleRadiusMm, settings.baseThicknessMm, baseMaterial));
  addTickMarks(markingLayer, config, settings, markingMaterial, unitScale);
  addNumbers(markingLayer, config, settings, font, markingMaterial, unitScale);

  baseLayer.position.z = -explodeMm / 2;
  markingLayer.position.z = explodeMm / 2;

  const layers: PrintLayer[] = [
    {
      id: `background-${hexId(baseColor)}`,
      label: "Background",
      color: baseColor,
      object: baseLayer,
      zMinMm: 0,
      zMaxMm: settings.baseThicknessMm,
    },
    {
      id: `markings-${hexId(markingColor)}`,
      label: "Numbers and tick marks",
      color: markingColor,
      object: markingLayer,
      zMinMm: settings.baseThicknessMm,
      zMaxMm: settings.baseThicknessMm + settings.markingHeightMm,
    },
  ];

  const combined = new Group();
  combined.name = "clock-face-combined";
  layers.forEach((layer) => {
    const clone = layer.object.clone(true);
    clone.position.z = 0;
    combined.add(clone);
  });

  return {
    layers: mergeSameColorLayers(layers),
    combined,
    warnings: getPrintWarnings(config, settings, unitScale),
    unitScale,
  };
};

export const exportPrintModelZip = async (
  config: ClockConfig,
  settings: PrintSettings
): Promise<Blob> => {
  const font = await loadPrintFont();
  const model = createPrintModel(config, settings, font, 0, "basic");
  const exporter = new STLExporter();
  const zip = new JSZip();
  const colors: ExportManifest["colors"] = [];

  model.layers.forEach((layer) => {
    const file = `clock-face-${layer.id}.stl`;
    zip.file(file, toArrayBuffer(exporter.parse(layer.object, { binary: true })));
    colors.push({
      id: layer.id,
      label: layer.label,
      color: layer.color,
      file,
      zMinMm: layer.zMinMm,
      zMaxMm: layer.zMaxMm,
    });
  });

  const combinedFile = "clock-face-combined.stl";
  zip.file(combinedFile, toArrayBuffer(exporter.parse(model.combined, { binary: true })));

  const manifest: ExportManifest = {
    generatedAt: new Date().toISOString(),
    units: "millimeters",
    settings,
    colors,
    combinedFile,
    warnings: model.warnings,
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  return zip.generateAsync({ type: "blob" });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const createMaterial = (color: string, materialType: "standard" | "basic") => {
  if (materialType === "basic") {
    return new MeshBasicMaterial({ color });
  }
  return new MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.02 });
};

const createBaseDisk = (
  radiusMm: number,
  holeRadiusMm: number,
  thicknessMm: number,
  material: MeshBasicMaterial | MeshStandardMaterial
): Mesh => {
  const shape = new Shape();
  shape.absarc(0, 0, radiusMm, 0, Math.PI * 2, false);

  if (holeRadiusMm > 0) {
    const hole = new Shape();
    hole.absarc(0, 0, holeRadiusMm, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }

  const geometry = new ExtrudeGeometry(shape, {
    depth: thicknessMm,
    bevelEnabled: false,
    curveSegments: 160,
  });
  return new Mesh(geometry, material);
};

const addTickMarks = (
  group: Group,
  config: ClockConfig,
  settings: PrintSettings,
  material: MeshBasicMaterial | MeshStandardMaterial,
  unitScale: number
): void => {
  const tickRadiusMm = safeNumber(config.face.tickMarks, 4.25) * unitScale;
  for (let tick = 0; tick < 60; tick += 1) {
    const angle = ((tick - 15) * Math.PI * 2) / 60;
    const isMajorTick = tick % 5 === 0;
    const lengthMm = (isMajorTick ? 0.3 : 0.15) * unitScale;
    const startRadius = tickRadiusMm;
    const endRadius = tickRadiusMm + lengthMm;
    const centerRadius = (startRadius + endRadius) / 2;
    const tickLength = endRadius - startRadius;
    const widthMm = TICK_WIDTH_UNITS * unitScale;
    const mesh = new Mesh(
      new BoxGeometry(widthMm, tickLength, settings.markingHeightMm),
      material
    );
    mesh.position.set(
      Math.cos(angle) * centerRadius,
      Math.sin(angle) * centerRadius,
      settings.baseThicknessMm + settings.markingHeightMm / 2
    );
    mesh.rotation.z = angle + Math.PI / 2;
    group.add(mesh);
  }
};

const addNumbers = (
  group: Group,
  config: ClockConfig,
  settings: PrintSettings,
  font: Font,
  material: MeshBasicMaterial | MeshStandardMaterial,
  unitScale: number
): void => {
  addNumberRing(group, {
    values: Array.from({ length: 12 }, (_, i) => String(i + 1)),
    radiusMm: safeNumber(config.face.hourNumbers, 3) * unitScale,
    fontSizeMm: HOUR_FONT_SIZE_UNITS * unitScale,
    getAngle: (index) => ((index + 1 - 3) * Math.PI * 2) / -12,
    settings,
    font,
    material,
  });

  addNumberRing(group, {
    values: Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")),
    radiusMm: safeNumber(config.face.minuteNumbers, 3.75) * unitScale,
    fontSizeMm: MINUTE_FONT_SIZE_UNITS * unitScale,
    getAngle: (index) => (((index * 5) / 5 - 3) * Math.PI * 2) / -12,
    settings,
    font,
    material,
  });
};

const addNumberRing = (
  group: Group,
  options: {
    values: string[];
    radiusMm: number;
    fontSizeMm: number;
    getAngle: (index: number) => number;
    settings: PrintSettings;
    font: Font;
    material: MeshBasicMaterial | MeshStandardMaterial;
  }
): void => {
  options.values.forEach((value, index) => {
    const angle = options.getAngle(index);
    const geometry = new TextGeometry(value, {
      font: options.font,
      size: options.fontSizeMm,
      depth: options.settings.markingHeightMm,
      curveSegments: 6,
      bevelEnabled: false,
    });
    centerGeometryXY(geometry);
    const mesh = new Mesh(geometry, options.material);
    mesh.position.set(
      Math.cos(angle) * options.radiusMm,
      Math.sin(angle) * options.radiusMm,
      options.settings.baseThicknessMm
    );
    group.add(mesh);
  });
};

const centerGeometryXY = (geometry: BufferGeometry): void => {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return;
  const xOffset = -((box.min.x + box.max.x) / 2);
  const yOffset = -((box.min.y + box.max.y) / 2);
  geometry.translate(xOffset, yOffset, 0);
};

const getPrintWarnings = (
  config: ClockConfig,
  settings: PrintSettings,
  unitScale: number
): string[] => {
  const warnings: string[] = [];
  const minFeatureMm = settings.nozzleDiameterMm * 2;
  const tickWidthMm = TICK_WIDTH_UNITS * unitScale;
  const faceRadiusMm = settings.diameterMm / 2;
  const maxMarkRadiusMm =
    (Math.max(
      safeNumber(config.face.tickMarks, 4.25) + 0.3,
      safeNumber(config.face.hourNumbers, 3) + HOUR_FONT_SIZE_UNITS / 2,
      safeNumber(config.face.minuteNumbers, 3.75) + MINUTE_FONT_SIZE_UNITS / 2
    ) *
      unitScale);

  if (tickWidthMm < minFeatureMm) {
    warnings.push(
      `Tick mark width is ${round(tickWidthMm)} mm, below the recommended ${round(minFeatureMm)} mm for a ${round(settings.nozzleDiameterMm)} mm nozzle.`
    );
  }
  if (!isLayerMultiple(settings.baseThicknessMm, settings.layerHeightMm)) {
    warnings.push(
      `Base thickness ${round(settings.baseThicknessMm)} mm is not an even multiple of layer height ${round(settings.layerHeightMm)} mm.`
    );
  }
  if (!isLayerMultiple(settings.markingHeightMm, settings.layerHeightMm)) {
    warnings.push(
      `Marking height ${round(settings.markingHeightMm)} mm is not an even multiple of layer height ${round(settings.layerHeightMm)} mm.`
    );
  }
  if (settings.centerHoleMm <= 0) {
    warnings.push("Center hole diameter is zero; the exported dial will need drilling before mounting.");
  }
  if (settings.centerHoleMm >= settings.diameterMm * 0.25) {
    warnings.push("Center hole is large relative to the dial diameter.");
  }
  if (maxMarkRadiusMm > faceRadiusMm) {
    warnings.push("Some markings extend beyond the outside edge of the clock face.");
  }

  return warnings;
};

const mergeSameColorLayers = (layers: PrintLayer[]): PrintLayer[] => {
  const firstLayer = layers[0];
  const secondLayer = layers[1];
  if (!firstLayer || !secondLayer || layers.length !== 2 || hexId(firstLayer.color) !== hexId(secondLayer.color)) {
    return layers;
  }

  const merged = new Group();
  merged.name = `clock-face-${hexId(firstLayer.color)}`;
  layers.forEach((layer) => {
    const clone = layer.object.clone(true);
    clone.position.z = 0;
    merged.add(clone);
  });

  return [
    {
      id: `single-color-${hexId(firstLayer.color)}`,
      label: "Single color dial",
      color: firstLayer.color,
      object: merged,
      zMinMm: 0,
      zMaxMm: Math.max(...layers.map((layer) => layer.zMaxMm)),
    },
  ];
};

const safeNumber = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

const isLayerMultiple = (value: number, layerHeight: number): boolean => {
  if (layerHeight <= 0) return false;
  const layers = value / layerHeight;
  return Math.abs(layers - Math.round(layers)) < 0.0001;
};

const hexId = (color: string): string => color.replace("#", "").toLowerCase();

const round = (value: number): string => String(Math.round(value * 100) / 100);

const toArrayBuffer = (data: string | DataView): ArrayBuffer => {
  if (typeof data === "string") {
    return new TextEncoder().encode(data).buffer;
  }
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
};

export const disposeObject = (object: Object3D): void => {
  object.traverse((child) => {
    const mesh = child as Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
  });
};
