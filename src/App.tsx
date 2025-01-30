import { useState, useRef } from 'react'
import './App.css'
import * as Tone from 'tone';
import { IconButton } from '@mui/material';
import { SolfeggioControls } from './components/SolfeggioControls';
import { BinauralControls } from './components/BinauralControls';
import { NoiseControls } from './components/NoiseControls';
import { PlayControls } from './components/PlayControls';
import { useSynths } from './hooks/useSynths';
import { useAudioState } from './hooks/useAudioState';
import brainwavesLogo from './assets/brainwaves.svg'
import { SOLFEGGIO_FREQ, BINAURAL_FREQ } from './constants';
import { FrequencyCanvas } from './components/FrequencyCanvas';
declare global {
  interface Window { synthLeft: any; synthRight: any; synthNoise: any; harmonic: any; harmonicLFO: any; }
}

const calcRandomBeat = (binaural: keyof typeof BINAURAL_FREQ) => {
  const binauralFreq = BINAURAL_FREQ[binaural];
  const min = binauralFreq.min;
  const max = binauralFreq.max;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const calcFreq = (side: 'left' | 'right', solfeggio: keyof typeof SOLFEGGIO_FREQ, binaural: keyof typeof BINAURAL_FREQ, beat?: number) => {
  const solfeggioFreq = SOLFEGGIO_FREQ[solfeggio];
  if (side === 'left') return solfeggioFreq;
  return (beat || calcRandomBeat(binaural)) + solfeggioFreq;
}

function App() {
  const {
    synthLeft,
    synthRight,
    synthNoise,
    harmonic,
    harmonicLFO,
    initializeSynths
  } = useSynths();

  const {
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
    setNoiseType,
    setLeftOptions,
    setRightOptions,
    updateSynthFrequency,
    isInitialized
  } = useAudioState({ 
    synthLeft, 
    synthRight, 
    synthNoise, 
    harmonic, 
    harmonicLFO,
    initializeSynths 
  });

  const handleFrequencyChange = (leftFreq: number, rightFreq: number) => {
    if (!synthLeft.current || !synthRight.current ) return;
    
    console.log('handleFrequencyChange', leftFreq, rightFreq);
    setLeftOptions({ frequency: leftFreq, pan: -1 });
    setRightOptions({ frequency: rightFreq, pan: 1 });
    updateSynthFrequency(synthLeft.current, { frequency: leftFreq });
    updateSynthFrequency(synthRight.current, { frequency: rightFreq });
  };

  return (
    <>
      <div>
        <IconButton color="primary">
          <img src={brainwavesLogo} className="logo" alt="Brainwaves logo" />
        </IconButton>
      </div>
      <div className="card">
        <FrequencyCanvas 
          solfeggioFreq={SOLFEGGIO_FREQ[solfeggio]}
          binauralFreqMin={BINAURAL_FREQ[binaural].min}
          binauralFreqMax={BINAURAL_FREQ[binaural].max}
          onFrequencyChange={handleFrequencyChange}
        />
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <SolfeggioControls 
            solfeggio={solfeggio} 
            setSolfeggio={setSolfeggio} 
          />
          <BinauralControls 
            binaural={binaural} 
            setBinaural={setBinaural} 
          />
          <NoiseControls 
            noiseType={noiseType} 
            setNoiseType={setNoiseType} 
          />
        </div>
        <PlayControls 
          isPlaying={isPlaying}
          beat={beat}
          onPlay={playTone}
          onRandomize={randomizeBeat}
        />
      </div>
    </>
  )
}

export default App
