import { useRef, useEffect, useState, useCallback } from 'react';
import { BINAURAL_FREQ } from '../constants';
import debounce from 'lodash/debounce';

interface Props {
  solfeggioFreq: number;
  binauralFreqMin: number;
  binauralFreqMax: number;
  onFrequencyChange: (leftFreq: number, rightFreq: number) => void;
}

export function FrequencyCanvas({ solfeggioFreq, binauralFreqMin, binauralFreqMax, onFrequencyChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

  // Calculate frequency ranges
  const yMin = solfeggioFreq * 0.5;  // Half of base frequency
  const yMax = solfeggioFreq * 1.5;  // 1.5x base frequency
  const xMin = binauralFreqMin;  // Lowest binaural frequency
  const xMax = binauralFreqMax;  // Highest binaural frequency

  // Create a debounced version of onFrequencyChange
  const debouncedFrequencyChange = useCallback(
    debounce((leftFreq: number, rightFreq: number) => {
      onFrequencyChange(leftFreq, rightFreq);
    }, 100),
    [onFrequencyChange]
  );

  const calculateFrequencies = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas coordinates to frequency values
    const leftFreq = yMax - (y / canvas.height) * (yMax - yMin);
    const binauralFreq = (x / canvas.width) * (xMax - xMin) + xMin;
    const rightFreq = leftFreq + binauralFreq;

    return { leftFreq, rightFreq };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPosition({ x, y });

    if (isMouseDown) {
      const frequencies = calculateFrequencies(x, y);
      if (frequencies) {
        debouncedFrequencyChange(frequencies.leftFreq, frequencies.rightFreq);
      }
    }
  };

  const handleMouseDown = () => {
    setIsMouseDown(true);
    const frequencies = calculateFrequencies(currentPosition.x, currentPosition.y);
    if (frequencies) {
      debouncedFrequencyChange(frequencies.leftFreq, frequencies.rightFreq);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  // Clean up the debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedFrequencyChange.cancel();
    };
  }, [debouncedFrequencyChange]);

  useEffect(() => {
    // Draw canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#4a4a4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw current position
    if (isMouseDown) {
      ctx.beginPath();
      ctx.arc(currentPosition.x, currentPosition.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#00ff00';
      ctx.fill();
    }
  }, [currentPosition, isMouseDown]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      style={{
        border: '1px solid #333',
        borderRadius: '4px',
        background: '#2a2a2a',
        cursor: 'crosshair'
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
} 