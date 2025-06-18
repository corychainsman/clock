import type { ClockConfig } from '../types/clock';

export const generateFavicon = (config: ClockConfig): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  const size = 32;
  canvas.width = size;
  canvas.height = size;
  
  const centerX = size / 2;
  const centerY = size / 2;
  const clockRadius = size * 0.4;
  
  // Get current time
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  
  // Calculate angles (starting from 12 o'clock, clockwise)
  const hourAngle = ((hours + minutes / 60) * Math.PI * 2) / 12 - Math.PI / 2;
  const minuteAngle = (minutes * Math.PI * 2) / 60 - Math.PI / 2;
  const secondAngle = (seconds * Math.PI * 2) / 60 - Math.PI / 2;
  
  // Clear canvas
  ctx.clearRect(0, 0, size, size);
  
  // Draw clock face
  ctx.fillStyle = config.face.background;
  ctx.beginPath();
  ctx.arc(centerX, centerY, clockRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw tick marks
  ctx.strokeStyle = config.face.numbers;
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
    const tickStart = clockRadius * 0.85;
    const tickEnd = clockRadius * 0.95;
    
    const x1 = centerX + Math.cos(angle) * tickStart;
    const y1 = centerY + Math.sin(angle) * tickStart;
    const x2 = centerX + Math.cos(angle) * tickEnd;
    const y2 = centerY + Math.sin(angle) * tickEnd;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  
  // Draw hour hand
  const hourLength = clockRadius * (config.hourHand.length / 5); // Scale to fit
  ctx.strokeStyle = config.hourHand.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(hourAngle) * hourLength,
    centerY + Math.sin(hourAngle) * hourLength
  );
  ctx.stroke();
  
  // Draw hour hand circle if enabled
  if (config.hourHand.circle.show) {
    const circleX = centerX + Math.cos(hourAngle) * (hourLength + config.hourHand.circle.radius * 5);
    const circleY = centerY + Math.sin(hourAngle) * (hourLength + config.hourHand.circle.radius * 5);
    const circleRadius = config.hourHand.circle.radius * 10;
    
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    
    if (config.hourHand.circle.filled) {
      ctx.fillStyle = config.hourHand.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = config.hourHand.color;
      ctx.lineWidth = config.hourHand.circle.strokeWidth * 20;
      ctx.stroke();
    }
  }
  
  // Draw minute hand
  const minuteLength = clockRadius * (config.minuteHand.length / 5); // Scale to fit
  ctx.strokeStyle = config.minuteHand.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(minuteAngle) * minuteLength,
    centerY + Math.sin(minuteAngle) * minuteLength
  );
  ctx.stroke();
  
  // Draw minute hand circle if enabled
  if (config.minuteHand.circle.show) {
    const circleX = centerX + Math.cos(minuteAngle) * (minuteLength + config.minuteHand.circle.radius * 5);
    const circleY = centerY + Math.sin(minuteAngle) * (minuteLength + config.minuteHand.circle.radius * 5);
    const circleRadius = config.minuteHand.circle.radius * 10;
    
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    
    if (config.minuteHand.circle.filled) {
      ctx.fillStyle = config.minuteHand.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = config.minuteHand.color;
      ctx.lineWidth = config.minuteHand.circle.strokeWidth * 20;
      ctx.stroke();
    }
  }
  
  // Draw second hand
  const secondLength = clockRadius * (config.secondHand.length / 5); // Scale to fit
  ctx.strokeStyle = config.secondHand.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(secondAngle) * secondLength,
    centerY + Math.sin(secondAngle) * secondLength
  );
  ctx.stroke();
  
  // Draw second hand circle if enabled
  if (config.secondHand.circle.show) {
    const circleX = centerX + Math.cos(secondAngle) * (secondLength + config.secondHand.circle.radius * 5);
    const circleY = centerY + Math.sin(secondAngle) * (secondLength + config.secondHand.circle.radius * 5);
    const circleRadius = config.secondHand.circle.radius * 10;
    
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    
    if (config.secondHand.circle.filled) {
      ctx.fillStyle = config.secondHand.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = config.secondHand.color;
      ctx.lineWidth = config.secondHand.circle.strokeWidth * 20;
      ctx.stroke();
    }
  }
  
  // Draw center dot
  ctx.fillStyle = config.face.numbers;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 1, 0, Math.PI * 2);
  ctx.fill();
  
  return canvas.toDataURL('image/png');
};

export const updateFavicon = (config: ClockConfig): void => {
  const faviconUrl = generateFavicon(config);
  
  // Remove existing favicon
  const existingFavicon = document.querySelector('link[rel="icon"]');
  if (existingFavicon) {
    existingFavicon.remove();
  }
  
  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = faviconUrl;
  document.head.appendChild(link);
};