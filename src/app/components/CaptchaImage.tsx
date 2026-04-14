import { useEffect, useRef } from 'react';

interface CaptchaImageProps {
  text: string;
}

export default function CaptchaImage({ text }: CaptchaImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions
    const width = 200;
    const height = 60;
    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = '#fefefe';
    ctx.fillRect(0, 0, width, height);

    // Add noise (lots of dots)
    for (let i = 0; i < 400; i++) {
        ctx.fillStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255}, 0.5)`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add noise lines
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255}, 0.3)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }

    // Draw text
    const textLength = text.length;
    for (let i = 0; i < textLength; i++) {
        const char = text[i];
        
        // Random styling for each character
        const fontSize = Math.floor(Math.random() * 15) + 35; // 35px to 50px
        const fonts = ['Georgia', 'Times New Roman', 'Arial', 'Courier New', 'Verdana'];
        const font = fonts[Math.floor(Math.random() * fonts.length)];
        ctx.font = `bold ${fontSize}px ${font}`;
        
        // Random colors (darker shades for readability)
        const r = Math.floor(Math.random() * 100);
        const g = Math.floor(Math.random() * 100);
        const b = Math.floor(Math.random() * 100);
        ctx.fillStyle = `rgb(${r},${g},${b})`;

        // Transformations
        ctx.save();
        // Positioning
        const xMode = width / (textLength + 1);
        const xOffset = xMode * (i + 1) - 15;
        const yOffset = height / 2 + (Math.random() * 10 - 5) + 10;
        
        ctx.translate(xOffset, yOffset);
        
        // Rotation (-30 to +30 degrees approx)
        const angle = (Math.random() - 0.5) * 0.8;
        ctx.rotate(angle);

        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

  }, [text]);

  return <canvas ref={canvasRef} className="border border-gray-300 rounded" style={{ width: '100%', height: 'auto', maxWidth: '200px' }} />;
}
