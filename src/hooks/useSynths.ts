import { useRef, useCallback } from "react";
import * as Tone from "tone";

export function useSynths() {
  const synthLeft = useRef<Tone.Oscillator | null>(null);
  const synthRight = useRef<Tone.Oscillator | null>(null);
  const synthNoise = useRef<Tone.Noise | null>(null);
  const harmonic = useRef<Tone.Oscillator | null>(null);
  const harmonicLFO = useRef<Tone.LFO | null>(null);

  const initializeSynths = useCallback(async () => {
    // Only initialize if they haven't been created yet
    if (!synthLeft.current) {
      await Tone.start();

      synthLeft.current = new Tone.Oscillator({
        type: "sine",
        volume: -20,
      }).connect(new Tone.Panner(-1).toDestination());

      synthRight.current = new Tone.Oscillator({
        type: "sine",
        volume: -20,
      }).connect(new Tone.Panner(1).toDestination());

      synthNoise.current = new Tone.Noise({
        type: "white",
        volume: -20,
      }).connect(new Tone.Panner(0).toDestination());

      harmonic.current = new Tone.Oscillator({
        type: "sine",
        volume: -20,
      }).connect(new Tone.Panner(0).toDestination());

      harmonicLFO.current = new Tone.LFO({
        type: "sine",
        frequency: 0.1,
        min: -20,
        max: 20,
      }).connect(harmonic.current.frequency);
    }
  }, []);

  const updateFrequency = useCallback(
    (osc: Tone.Oscillator, newFreq: number) => {
      osc.frequency.exponentialRampTo(newFreq, 0.1);
    },
    [],
  );

  return {
    synthLeft,
    synthRight,
    synthNoise,
    harmonic,
    harmonicLFO,
    updateFrequency,
    initializeSynths,
  };
}
