import { useEffect, useMemo, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import type { ClockConfig, PrintSettings } from "../types/clock";
import {
  createPrintModel,
  disposeObject,
  loadPrintFont,
  type PrintModel,
} from "../utils/printModel";

interface PrintPreviewProps {
  config: ClockConfig;
  settings: PrintSettings;
  explodeMm: number;
  onWarningsChange: (warnings: string[]) => void;
}

export const PrintPreview = ({
  config,
  settings,
  explodeMm,
  onWarningsChange,
}: PrintPreviewProps) => {
  const [font, setFont] = useState<Font | null>(null);

  useEffect(() => {
    let mounted = true;
    loadPrintFont().then((loadedFont) => {
      if (mounted) {
        setFont(loadedFont);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const model = useMemo<PrintModel | null>(() => {
    if (!font) return null;
    return createPrintModel(config, settings, font, explodeMm);
  }, [config, settings, font, explodeMm]);

  useEffect(() => {
    onWarningsChange(model?.warnings ?? []);
    return () => {
      if (model) {
        model.layers.forEach((layer) => disposeObject(layer.object));
        disposeObject(model.combined);
      }
    };
  }, [model, onWarningsChange]);

  if (!model) {
    return null;
  }

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[80, -60, 140]} intensity={1.4} />
      <directionalLight position={[-120, 80, 80]} intensity={0.35} />
      <group rotation={[0, 0, 0]} scale={0.035}>
        {model.layers.map((layer) => (
          <primitive
            key={layer.id}
            object={layer.object}
          />
        ))}
      </group>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </>
  );
};
