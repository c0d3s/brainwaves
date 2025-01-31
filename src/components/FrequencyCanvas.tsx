import { useRef, useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";
import { IconButton } from '@mui/material';
import { TuneOutlined } from '@mui/icons-material';

interface Props {
  solfeggioFreq: number;
  binauralFreqMin: number;
  binauralFreqMax: number;
  onFrequencyChange: (leftFreq: number, rightFreq: number) => void;
  oscillatorOptions: OscillatorOptions;
  beat: number;
}

export function FrequencyCanvas({
  solfeggioFreq,
  binauralFreqMin,
  binauralFreqMax,
  onFrequencyChange,
  oscillatorOptions,
  beat,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: 200, y: 200 }); // Center of 400x400 canvas
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  // Calculate frequency ranges
  const yMin = solfeggioFreq * 0.75;
  const yMax = solfeggioFreq * 1.5; 
  const xMin = binauralFreqMin; // Lowest binaural frequency
  const xMax = binauralFreqMax; // Highest binaural frequency

  // Create a debounced version of onFrequencyChange
  const debouncedFrequencyChange = useCallback(
    debounce((leftFreq: number, rightFreq: number) => {
      onFrequencyChange(leftFreq, rightFreq);
    }, 100),
    [onFrequencyChange],
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
    const frequencies = calculateFrequencies(
      currentPosition.x,
      currentPosition.y,
    );
    if (frequencies) {
      debouncedFrequencyChange(frequencies.leftFreq, frequencies.rightFreq);
      setPoint(currentPosition);
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

  // Initialize point in center
  useEffect(() => {
    if (!point && canvasRef.current) {
      const centerPoint = {
        x: canvasRef.current.width / 2,
        y: canvasRef.current.height / 2,
      };
      setPoint(centerPoint);
      const frequencies = calculateFrequencies(centerPoint.x, centerPoint.y);
      if (frequencies) {
        debouncedFrequencyChange(frequencies.leftFreq, frequencies.rightFreq);
      }
    }
  }, []);

  // Reset Y position when solfeggio changes
  useEffect(() => {
    if (point && canvasRef.current) {
      const newPoint = {
        x: point.x,
        y: canvasRef.current.height / 2,
      };
      setPoint(newPoint);
      const frequencies = calculateFrequencies(newPoint.x, newPoint.y);
      if (frequencies) {
        debouncedFrequencyChange(frequencies.leftFreq, frequencies.rightFreq);
      }
    }
  }, [solfeggioFreq]);

  // Reset X position when binaural range changes
  useEffect(() => {
    if (point && canvasRef.current) {
      const newPoint = {
        x: canvasRef.current.width / 2,
        y: point.y,
      };
      setPoint(newPoint);
      const frequencies = calculateFrequencies(newPoint.x, newPoint.y);
      if (frequencies) {
        debouncedFrequencyChange(frequencies.leftFreq, frequencies.rightFreq);
      }
    }
  }, [binauralFreqMin, binauralFreqMax]);

  useEffect(() => {
    // Draw canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#1a1a1a");
      gradient.addColorStop(1, "#4a4a4a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw sine waves
      const drawSineWave = (frequency: number, color: string, yOffset: number, amplitude = 30) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        // Enable anti-aliasing
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Increase resolution by using smaller steps
        const steps = canvas.width * 2;
        const dx = canvas.width / steps;

        for (let i = 0; i <= steps; i++) {
          const x = i * dx;
          const y = Math.sin(
            (x * frequency * 0.01) + phase
          ) * amplitude + yOffset;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = (i - 1) * dx;
            const prevY = Math.sin(
              (prevX * frequency * 0.01) + phase
            ) * amplitude + yOffset;
            
            const cpX = (x + prevX) / 2;
            ctx.quadraticCurveTo(cpX, prevY, x, y);
          }
        }
        ctx.stroke();
      };

      // Draw left and right frequency waves
      drawSineWave(
        oscillatorOptions.left.frequency,
        'rgba(0, 255, 0, 0.5)',
        canvas.height * 0.3
      );
      drawSineWave(
        oscillatorOptions.right.frequency,
        'rgba(0, 255, 255, 0.5)',
        canvas.height * 0.5
      );

      // Draw binaural beat wave
      drawSineWave(
        beat,
        'rgba(255, 100, 100, 0.5)',
        canvas.height * 0.7,
        45  // Slightly larger amplitude for better visibility
      );

      // Draw current position
      if (isMouseDown) {
        ctx.beginPath();
        ctx.arc(currentPosition.x, currentPosition.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#00ff00";
        ctx.fill();
      }

      // Draw stored point
      if (point) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#00ff00";
        ctx.fill();
      }

      // Update phase for animation
      phase += 0.05;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentPosition, isMouseDown, point, oscillatorOptions.left.frequency, oscillatorOptions.right.frequency, beat]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <IconButton color="secondary">
        <TuneOutlined />
      </IconButton>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          writingMode: 'vertical-rl', 
          transform: 'rotate(180deg)', 
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
        }}>
          Base Frequency
          <div style={{ marginTop: '8px', color: '#fff' }}>
            {oscillatorOptions.left.frequency.toFixed(2)} Hz
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{
            border: '4px solid #333',
            borderRadius: '12px',
            background: '#2a2a2a',
            cursor: 'crosshair'
          }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        <div style={{ 
          writingMode: 'vertical-rl', 
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
        }}>
          Binaural Frequency
          <div style={{ marginTop: '8px', color: '#fff' }}>
            {oscillatorOptions.right.frequency.toFixed(2)} Hz
          </div>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        minHeight: '50px'
      }}>
        Binaural Beat
        <div style={{ marginTop: '4px', color: '#fff' }}>
          {beat.toFixed(2)} Hz
        </div>
      </div>
    </div>
  );
}
