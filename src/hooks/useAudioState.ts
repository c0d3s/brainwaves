import { useState, useEffect } from "react";
import * as Tone from "tone";
import { calcRandomBeat } from "../utils";
import { BINAURAL_FREQ, BASE_FREQ } from "../constants";

const DEFAULT_BASE: keyof typeof BASE_FREQ = "ut";
const DEFAULT_BINAURAL: keyof typeof BINAURAL_FREQ = "alpha";

interface SynthRefs {
  synthLeft: React.RefObject<Tone.Oscillator | null>;
  synthRight: React.RefObject<Tone.Oscillator | null>;
  synthNoise: React.RefObject<Tone.Noise | null>;
  harmonic: React.RefObject<Tone.Oscillator | null>;
  harmonicLFO: React.RefObject<Tone.LFO | null>;
  updateFrequency: (osc: Tone.Oscillator, newFreq: number) => void;
  initializeSynths: () => Promise<void>;
}

interface OscillatorOptions {
  left: {
    frequency: number;
    pan: number;
  };
  right: {
    frequency: number;
    pan: number;
  };
}

interface DriftOptions {
  isDrifting: boolean;
  driftDirection: "asc" | "desc";
  driftMin: number;
  driftMax: number;
  driftInterval: number;
  driftTime: number;
}

export function useAudioState({
  synthLeft,
  synthRight,
  synthNoise,
  harmonic,
  harmonicLFO,
  updateFrequency,
  initializeSynths,
}: SynthRefs) {
  // State declarations
  const [isPlaying, setIsPlaying] = useState(false);
  const [base, setBase] = useState<keyof typeof BASE_FREQ>("ut");
  const [binaural, setBinaural] = useState<keyof typeof BINAURAL_FREQ>("alpha");
  const [noiseType, setNoiseType] = useState<
    "white" | "pink" | "brown" | "off"
  >("off");
  const [beat, setBeat] = useState(0);
  const [oscillatorOptions, setOscillatorOptions] = useState<OscillatorOptions>(
    {
      left: { frequency: BASE_FREQ[DEFAULT_BASE], pan: -1 },
      right: {
        frequency:
          BASE_FREQ[DEFAULT_BASE] + BINAURAL_FREQ[DEFAULT_BINAURAL].min,
        pan: 1,
      },
    },
  );
  const [harmonicOptions, setHarmonicOptions] = useState({
    frequency: 0,
    pan: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [noiseVolume, setNoiseVolume] = useState(0.5);
  const [driftOptions, setDriftOptions] = useState<DriftOptions>({
    isDrifting: false,
    driftDirection: "desc",
    driftInterval: 1,
    driftTime: 1000,
    driftMin: BINAURAL_FREQ[binaural].min,
    driftMax: BINAURAL_FREQ[binaural].max,
  });

  const updateSynthFrequency = (
    synth: Tone.Synth,
    options: { frequency: number },
  ) => {
    synth.frequency.linearRampTo(options.frequency, 1);
  };

  const updateHarmonicFrequency = () => {
    const harmonicFreq = oscillatorOptions.left.frequency * 1.5;
    setHarmonicOptions({ frequency: harmonicFreq, pan: 0 });
    harmonic.current?.frequency.linearRampTo(harmonicFreq, 1);
  };

  const updateSynthFrequencies = (leftFreq: number, rightFreq: number) => {
    setOscillatorOptions({
      left: { ...oscillatorOptions.left, frequency: leftFreq },
      right: { ...oscillatorOptions.right, frequency: rightFreq },
    });

    if (synthLeft.current) {
      updateFrequency(synthLeft.current, leftFreq);
    }
    if (synthRight.current) {
      updateFrequency(synthRight.current, rightFreq);
    }
  };

  const updateNoise = () => {
    if (!synthNoise.current) return;

    try {
      // Always stop first to prevent overlapping
      synthNoise.current.stop();
      synthNoise.current.type = noiseType === "off" ? "white" : noiseType;
      synthNoise.current.volume.value = 20 * Math.log10(noiseVolume); // Convert linear to dB
      if (isPlaying && noiseType !== "off") {
        synthNoise.current.start();
      }
    } catch (error) {
      console.error("Error updating noise:", error);
    }
  };

  const randomizeBeat = () => {
    const newBeat = calcRandomBeat(binaural);
    setBeat(newBeat);
    const rightFreq = oscillatorOptions.left.frequency + newBeat;
    updateSynthFrequencies(oscillatorOptions.left.frequency, rightFreq);
  };

  const playTone = async () => {
    if (!isPlaying) {
      try {
        await initializeSynths();
        updateSynthFrequencies(
          oscillatorOptions.left.frequency,
          oscillatorOptions.right.frequency,
        );
        synthLeft.current?.start();
        synthRight.current?.start();
        console.log(
          synthLeft.current?.frequency.value,
          synthRight.current?.frequency.value,
        );
        harmonic.current?.start();
        harmonicLFO.current?.start();
        if (noiseType !== "off") synthNoise.current?.start();
      } catch (error) {
        console.error("Failed to start audio:", error);
        return;
      }
    } else {
      synthLeft.current?.stop();
      synthRight.current?.stop();
      harmonic.current?.stop();
      harmonicLFO.current?.stop();
      synthNoise.current?.stop();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    updateHarmonicFrequency();
  }, [oscillatorOptions.left.frequency]);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    updateNoise();
  }, [noiseType, isPlaying, noiseVolume]);

  useEffect(() => {
    if (oscillatorOptions.left.frequency < oscillatorOptions.right.frequency) {
      setBeat(
        oscillatorOptions.right.frequency - oscillatorOptions.left.frequency,
      );
    }
  }, [oscillatorOptions.left.frequency, oscillatorOptions.right.frequency]);

  useEffect(() => {
    let driftTimer: ReturnType<typeof setInterval>;

    if (driftOptions.isDrifting && isPlaying) {
      driftTimer = setInterval(() => {
        const currentBeat =
          oscillatorOptions.right.frequency - oscillatorOptions.left.frequency;
        let newBeat = currentBeat;

        if (driftOptions.driftDirection === "desc") {
          newBeat -= driftOptions.driftInterval;
          if (newBeat <= driftOptions.driftMin) {
            newBeat = driftOptions.driftMin;
            setDriftOptions((prev) => ({ ...prev, driftDirection: "asc" }));
          }
        } else {
          newBeat += driftOptions.driftInterval;
          if (newBeat >= driftOptions.driftMax) {
            newBeat = driftOptions.driftMax;
            setDriftOptions((prev) => ({ ...prev, driftDirection: "desc" }));
          }
        }

        setBeat(newBeat);
        const rightFreq = oscillatorOptions.left.frequency + newBeat;
        updateSynthFrequencies(oscillatorOptions.left.frequency, rightFreq);
      }, driftOptions.driftTime);
    }

    return () => {
      if (driftTimer) {
        clearInterval(driftTimer);
      }
    };
  }, [
    driftOptions.isDrifting,
    driftOptions.driftDirection,
    driftOptions.driftInterval,
    driftOptions.driftTime,
    driftOptions.driftMin,
    driftOptions.driftMax,
    isPlaying,
    oscillatorOptions.left.frequency,
    oscillatorOptions.right.frequency,
  ]);

  const toggleDrift = () => {
    setDriftOptions((prev) => ({
      ...prev,
      isDrifting: !prev.isDrifting,
      driftMin: BINAURAL_FREQ[binaural].min,
      driftMax: BINAURAL_FREQ[binaural].max,
    }));
  };

  return {
    isPlaying,
    base,
    binaural,
    noiseType,
    beat,
    oscillatorOptions,
    harmonicOptions,
    updateSynthFrequencies,
    updateNoise,
    playTone,
    randomizeBeat,
    setBase,
    setBinaural,
    setNoiseType,
    updateSynthFrequency,
    noiseVolume,
    setNoiseVolume,
    driftOptions,
    toggleDrift,
  };
}
