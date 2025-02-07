import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import { IconButton } from "@mui/material";
import { TuneOutlined } from "@mui/icons-material";
import { OscillatorOptions } from "../hooks/useAudioState";
interface Props {
  baseFreq: number;
  binauralFreqMin: number;
  binauralFreqMax: number;
  onFrequencyChange: (leftFreq: number, rightFreq: number) => void;
  oscillatorOptions: OscillatorOptions;
  beat: number;
}

export function FrequencyCanvas({
  baseFreq,
  binauralFreqMin,
  binauralFreqMax,
  onFrequencyChange,
  oscillatorOptions,
  beat,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: 200, y: 200 });
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  // Memoize frequency ranges since they only depend on props
  const frequencyRanges = useMemo(
    () => ({
      yMin: baseFreq * 0.75,
      yMax: baseFreq * 1.5,
      xMin: binauralFreqMin,
      xMax: binauralFreqMax,
    }),
    [baseFreq, binauralFreqMin, binauralFreqMax],
  );

  // Memoize the frequency calculation function
  const calculateFrequencies = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { yMin, yMax, xMin, xMax } = frequencyRanges;

      // Convert canvas coordinates to frequency values
      const leftFreq = yMax - (y / canvas.height) * (yMax - yMin);
      const binauralFreq = (x / canvas.width) * (xMax - xMin) + xMin;
      const rightFreq = leftFreq + binauralFreq;

      return { leftFreq, rightFreq };
    },
    [frequencyRanges],
  );

  // Debounce the frequency change callback
  const debouncedFrequencyChange = useCallback(
    debounce((leftFreq: number, rightFreq: number) => {
      onFrequencyChange(leftFreq, rightFreq);
    }, 50),
    [onFrequencyChange],
  );

  // Memoize event handlers
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    },
    [isMouseDown, calculateFrequencies, debouncedFrequencyChange],
  );

  const handleMouseDown = useCallback(() => {
    setIsMouseDown(true);
    const frequencies = calculateFrequencies(
      currentPosition.x,
      currentPosition.y,
    );
    if (frequencies) {
      debouncedFrequencyChange(frequencies.leftFreq, frequencies.rightFreq);
      setPoint(currentPosition);
    }
  }, [currentPosition, calculateFrequencies, debouncedFrequencyChange]);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  // Clean up debounced function
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

  // Reset Y position when base changes
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
  }, [baseFreq]);

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
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      gradient.addColorStop(0, "#1a1a1a");
      gradient.addColorStop(1, "#4a4a4a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw sine waves
      const drawSineWave = (
        frequency: number,
        color: string,
        yOffset: number,
        amplitude = 30,
      ) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = amplitude > 30 ? 8 : 2;

        // Enable anti-aliasing
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Calculate points for 1 second of time
        const steps = canvas.width * 2;
        const stepWidth = canvas.width / steps;
        let peakX = -1;
        let maxY = -Infinity;

        for (let i = 0; i <= steps; i++) {
          const x = i * stepWidth;
          // Convert x position to time (0 to 1 second)
          const time = x / canvas.width;
          // Calculate y using frequency in Hz (cycles per second)
          const y =
            Math.sin(2 * Math.PI * frequency * time + phase) * amplitude +
            yOffset;

          // Track the highest point
          if (y > maxY) {
            maxY = y;
            peakX = x;
          }

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = (i - 1) * stepWidth;
            const prevTime = prevX / canvas.width;
            const prevY =
              Math.sin(2 * Math.PI * frequency * prevTime + phase) * amplitude +
              yOffset;

            const cpX = (x + prevX) / 2;
            ctx.quadraticCurveTo(cpX, prevY, x, y);
          }
        }
        ctx.stroke();
        return peakX;
      };

      // Draw left and right frequency waves
      drawSineWave(
        oscillatorOptions.left.frequency,
        "rgba(200, 0, 200, 0.5)",
        canvas.height * 0.25,
      );
      drawSineWave(
        oscillatorOptions.right.frequency,
        "rgba(0, 255, 255, 0.5)",
        canvas.height * 0.75,
      );

      // Draw binaural beat wave
      drawSineWave(
        oscillatorOptions.right.frequency - oscillatorOptions.left.frequency,
        "rgba(255, 100, 100, 0.5)",
        canvas.height * 0.5,
        60,
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

      // Update phase for animation (adjust speed)
      phase += 0.05 * 2 * Math.PI; // This will determine how fast the waves appear to move
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    currentPosition,
    isMouseDown,
    point,
    oscillatorOptions.left.frequency,
    oscillatorOptions.right.frequency,
    beat,
  ]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <IconButton color="secondary">
        <TuneOutlined />
      </IconButton>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          Base Frequency
          <div style={{ marginTop: "8px", color: "#fff" }}>
            {oscillatorOptions.left.frequency.toFixed(2)} Hz
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{
            border: "4px solid #333",
            borderRadius: "12px",
            background: "#2a2a2a",
            cursor: "crosshair",
          }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        <div
          style={{
            writingMode: "vertical-rl",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          Binaural Frequency
          <div style={{ marginTop: "8px", color: "#fff" }}>
            {oscillatorOptions.right.frequency.toFixed(2)} Hz
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.7)",
          minHeight: "50px",
        }}
      >
        Binaural Beat
        <div style={{ marginTop: "4px", color: "#fff" }}>
          {beat.toFixed(2)} Hz
        </div>
      </div>
    </div>
  );
}
