import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export const useResponsiveCamera = () => {
  const { camera, size } = useThree();
  const [zoom, setZoom] = useState(95);

  useEffect(() => {
    const calculateZoom = () => {
      // Clock face has radius of 5, so total bounds are 10x10
      const clockSize = 10;
      
      // Use 90% of the smaller viewport dimension
      const targetSize = Math.min(size.width, size.height) * 0.95;
      
      // Calculate zoom to fit clock bounds within target size
      const newZoom = targetSize / clockSize;
      
      setZoom(newZoom);
      
      // Apply zoom to camera
      if (camera && 'zoom' in camera) {
        camera.zoom = newZoom;
        camera.updateProjectionMatrix();
      }
    };

    // Calculate initial zoom
    calculateZoom();

    // Add resize listener
    const handleResize = () => {
      calculateZoom();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [camera, size]);

  return zoom;
};