import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { calcFreq, calcRandomBeat } from '../utils';
import { BINAURAL_FREQ, solfeggio_FREQ } from '../constants';

interface SynthRefs {
  synthLeft: React.RefObject<Tone.Synth>;
  synthRight: React.RefObject<Tone.Synth>;
  synthNoise: React.RefObject<Tone.Noise>;
  harmonic: React.RefObject<Tone.Oscillator>;
  harmonicLFO: React.RefObject<Tone.LFO>;
}

export function useAudioState({ synthLeft, synthRight, synthNoise, harmonic, harmonicLFO }: SynthRefs) {
  // State declarations
  const [isPlaying, setIsPlaying] = useState(false);
  const [solfeggio, setSolfeggio] = useState<keyof typeof solfeggio_FREQ>('ut');
  const [binaural, setBinaural] = useState<keyof typeof BINAURAL_FREQ>('alpha');
  const [noiseType, setNoiseType] = useState<'white' | 'pink' | 'brown' | 'off'>('off');
  const [beat, setBeat] = useState(0);
  const [leftOptions, setLeftOptions] = useState({ frequency: 0, pan: -1 });
  const [rightOptions, setRightOptions] = useState({ frequency: 0, pan: 1 });
  const [harmonicOptions, setHarmonicOptions] = useState({ frequency: 0, pan: 0 });

  const updateSynthFrequency = (synth: Tone.Synth, options: { frequency: number }) => {
    synth.frequency.linearRampTo(options.frequency, 1);
  };

  const updateHarmonicFrequency = () => {
    const harmonicFreq = leftOptions.frequency * 1.5;
    setHarmonicOptions({ frequency: harmonicFreq, pan: 0 });
    harmonic.current?.frequency.linearRampTo(harmonicFreq, 1);
  };

  const updateLeftFrequency = () => {
    const leftFreq = calcFreq('left', solfeggio, binaural);
    setLeftOptions({ frequency: leftFreq, pan: -1 });
    updateSynthFrequency(synthLeft.current!, { frequency: leftFreq });
    updateHarmonicFrequency();
  };

  const updateRightFrequency = () => {
    const rightFreq = calcFreq('right', solfeggio, binaural);
    setRightOptions({ frequency: rightFreq, pan: 1 });
    updateSynthFrequency(synthRight.current!, { frequency: rightFreq });
  };

  const updateNoise = () => {
    if (synthNoise.current) {
      synthNoise.current.type = noiseType === 'off' ? 'white' : noiseType;
    }
  };

  const randomizeBeat = () => {
    const newBeat = calcRandomBeat();
    setBeat(newBeat);
    const rightFreq = leftOptions.frequency + newBeat;
    setRightOptions({ frequency: rightFreq, pan: 1 });
    updateSynthFrequency(synthRight.current!, { frequency: rightFreq });
  };

  const playTone = async () => {
    if (!isPlaying) {
      synthLeft.current?.triggerAttack(leftOptions.frequency);
      synthRight.current?.triggerAttack(rightOptions.frequency);
      harmonic.current?.start('+0', harmonicOptions.frequency);
      harmonicLFO.current?.start();
      if (noiseType !== 'off') synthNoise.current?.start();
    } else {
      synthLeft.current?.triggerRelease();
      synthRight.current?.triggerRelease();
      harmonic.current?.stop();
      harmonicLFO.current?.stop();
      synthNoise.current?.stop();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    updateLeftFrequency();
    updateRightFrequency();
  }, [solfeggio, binaural]);

  useEffect(() => {
    updateNoise();
  }, [noiseType]);

  useEffect(() => {
    updateHarmonicFrequency();
  }, [leftOptions.frequency]);

  return {
    isPlaying,
    solfeggio,
    binaural,
    noiseType,
    beat,
    leftOptions,
    rightOptions,
    harmonicOptions,
    updateLeftFrequency,
    updateRightFrequency,
    updateNoise,
    playTone,
    randomizeBeat,
    setSolfeggio,
    setBinaural,
    setNoiseType
  };
} 