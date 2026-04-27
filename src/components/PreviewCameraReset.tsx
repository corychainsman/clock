import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { OrthographicCamera } from "three";

interface PreviewCameraResetProps {
  previewMode: "clock" | "print";
}

export const PreviewCameraReset = ({ previewMode }: PreviewCameraResetProps) => {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (previewMode !== "clock") return;

    const orthographicCamera = camera as OrthographicCamera;
    orthographicCamera.position.set(0, 0, 10);
    orthographicCamera.rotation.set(0, 0, 0);
    orthographicCamera.up.set(0, 1, 0);
    orthographicCamera.lookAt(0, 0, 0);
    orthographicCamera.updateProjectionMatrix();

    if (controls && "target" in controls && "update" in controls) {
      const orbitControls = controls as OrbitControlsImpl;
      orbitControls.target.set(0, 0, 0);
      orbitControls.update();
    }
  }, [camera, controls, previewMode]);

  return null;
};
