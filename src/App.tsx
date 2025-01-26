import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import * as Tone from 'tone';
import { Button, ButtonGroup } from '@mui/material';

const solfeggio_FREQ = {
  foundation: 174,
  healing: 285,
  ut: 396,
  re: 417,
  mi: 528,
  fa: 639,
  sol: 741,
  la: 852,
  universe: 963,
}

const BINAURAL_FREQ = {
  delta: {
    min: 1,
    max: 4,
  },
  theta: {
    min: 4,
    max: 8,
  },
  alpha: {
    min: 8,
    max: 13,
  },
  beta: {
    min: 14,
    max: 30,
  },
  gamma: {
    min: 30,
    max: 100,
  },
}

const calcRandomBeat = (binaural: keyof typeof BINAURAL_FREQ) => {
  const binauralFreq = BINAURAL_FREQ[binaural];
  const min = binauralFreq.min;
  const max = binauralFreq.max;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const calcFreq = (side: 'left' | 'right', solfeggio: keyof typeof solfeggio_FREQ, binaural: keyof typeof BINAURAL_FREQ, beat?: number) => {
  const solfeggioFreq = solfeggio_FREQ[solfeggio];
  if (side === 'left') return solfeggioFreq;
  return (beat || calcRandomBeat(binaural)) + solfeggioFreq;
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [solfeggio, setsolfeggio] = useState<keyof typeof solfeggio_FREQ>('ut');
  const [binaural, setBinaural] = useState<keyof typeof BINAURAL_FREQ>('alpha');
  const [noiseType, setNoiseType] = useState<'white' | 'pink' | 'brown' | 'off'>('off');
  const [beat, setBeat] = useState(0);
  const [leftOptions, setLeftOptions] = useState({
    frequency: 0,
    pan: -1,
  });
  const [rightOptions, setRightOptions] = useState({
    frequency: 0,
    pan: 1,
  });


  useEffect(() => {
    console.log('solfeggio', solfeggio, 'binaural', binaural, 'noiseType', noiseType);
  }, [solfeggio, binaural, noiseType]);

  useEffect(() => {
    updateLeftFrequency();
  }, [solfeggio]);

  useEffect(() => {
    updateRightFrequency();
  }, [binaural, leftOptions.frequency]);

  useEffect(() => {
    updateNoise();
  }, [noiseType]);  

  const updateSynthFrequency = (synth: Tone.Synth, options: {frequency: number}) => {
    synth.frequency.exponentialRampTo(options.frequency, 1);
  }

  const updateHarmonicFrequency = (synth: Tone.Oscillator, options: {frequency: number}) => {
    synth.frequency.exponentialRampTo(options.frequency, 1);
  }

  const updateLeftFrequency = () => {
    const leftFreq = calcFreq('left', solfeggio, binaural);
    setLeftOptions({frequency: leftFreq, pan: -1});
    updateSynthFrequency(synthLeft.current, {frequency: leftFreq});
    
    updateHarmonicFrequency(harmonic.current, {frequency: leftFreq * 1.5});
  }

  const updateRightFrequency = () => {
    const rightFreq = calcFreq('right', solfeggio, binaural);
    setRightOptions({frequency: rightFreq, pan: 1});
    setBeat(rightFreq - leftOptions.frequency);
    updateSynthFrequency(synthRight.current, {frequency: rightFreq});
  }

  const updateNoise = () => {
    if (noiseType === 'off') {
      synthNoise.current.stop();
    } else {
      synthNoise.current.type = noiseType;
      synthNoise.current.volume.value = noiseType === 'white' ? -30 : -20;
      synthNoise.current.start();
    }
  }

  const synthLeft = useRef(new Tone.Synth({
    oscillator: {
      type: "sine",
      volume: -20,
    }
  }).connect(new Tone.Panner(leftOptions.pan).toDestination())
  );

  const synthRight = useRef(new Tone.Synth({
    oscillator: {
      type: "sine",
      volume: -20,
    },
    portamento: 10,
  }).connect(new Tone.Panner(rightOptions.pan).toDestination())
  );

  const synthNoise = useRef(new Tone.Noise({
    type: noiseType === 'off' ? 'white' : noiseType,
    volume: noiseType === 'white' ? -40 : -30,
  }).connect(new Tone.Panner(0).toDestination())
  );

  const harmonic = useRef(new Tone.Oscillator({
    type: "sine",
    volume: -20,
  }).connect(new Tone.Panner(0).toDestination())
  );

  const playTone = async () => {
    const { frequency: leftFrequency } = leftOptions;
    const { frequency: rightFrequency } = rightOptions;

    const newLeft = {
      ...leftOptions,
      frequency: calcFreq('left', solfeggio, binaural),
    };
    const newRight = {
      ...rightOptions,
      frequency: calcFreq('right', solfeggio, binaural),
    };

    setLeftOptions(newLeft);
    setRightOptions(newRight);
    setBeat(newRight.frequency - newLeft.frequency);

    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
    if (!isPlaying) {
      synthLeft.current.triggerAttack(leftFrequency);
      synthRight.current.triggerAttack(rightFrequency);
      harmonic.current.start('+0', leftFrequency + (newLeft.frequency * 1.5));
      if (noiseType !== 'off') synthNoise.current.start();
    } else {
      synthLeft.current.triggerRelease();
      synthRight.current.triggerRelease();
      harmonic.current.stop();
      synthNoise.current.stop();
    }
    setIsPlaying(!isPlaying);
  }

  const randomizeBeat = () => {
    updateRightFrequency();
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Solfeggio + Binaural</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <div>
            <h2>Base Frequency</h2>
            <ButtonGroup orientation="vertical" variant="contained">
              {Object.entries(solfeggio_FREQ).map(([key]) => (
                <Button
                  key={key}
                  onClick={() => setsolfeggio(key as keyof typeof solfeggio_FREQ)}
                  variant={solfeggio === key ? 'contained' : 'outlined'}
                  color={solfeggio === key ? 'primary' : 'inherit'}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </ButtonGroup>
          </div>

          <div>
            <h2>Binaural Frequency</h2>
            <ButtonGroup orientation="vertical" variant="contained">
              {Object.keys(BINAURAL_FREQ).map((key) => (
                <Button
                  key={key}
                  onClick={() => setBinaural(key as keyof typeof BINAURAL_FREQ)}
                  variant={binaural === key ? 'contained' : 'outlined'}
                  color={binaural === key ? 'primary' : 'inherit'}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </ButtonGroup>
          </div>

          <div>
            <h2>Noise Type</h2>
            <ButtonGroup orientation="vertical" variant="contained">
              {['off', 'white', 'pink', 'brown'].map((type) => (
                <Button
                  key={type}
                  onClick={() => setNoiseType(type as 'white' | 'pink' | 'brown' | 'off')}
                  variant={noiseType === type ? 'contained' : 'outlined'}
                  color={noiseType === type ? 'primary' : 'inherit'}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </div>
        <button onClick={() => playTone()}>
          {isPlaying ? 'stop' : 'play'}
        </button>
        <button disabled={!isPlaying} onClick={() => randomizeBeat()}>
          {isPlaying ? `${beat} Hz` : 'beat'}
        </button>
      </div>
    </>
  )
}

export default App
