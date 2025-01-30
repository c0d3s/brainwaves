import { ButtonGroup, Button, IconButton } from '@mui/material';
import { WaterOutlined } from '@mui/icons-material';
import { solfeggio_FREQ } from '../constants';

interface Props {
  solfeggio: keyof typeof solfeggio_FREQ;
  setSolfeggio: (value: keyof typeof solfeggio_FREQ) => void;
}

export function SolfeggioControls({ solfeggio, setSolfeggio }: Props) {
  return (
    <div>
      <div>
        <IconButton color="secondary">
          <WaterOutlined />
        </IconButton>
      </div>
      <ButtonGroup 
        orientation="vertical" 
        variant="contained"
        sx={{ '& .MuiButton-root': { marginBottom: '8px' } }}
      >
        {Object.entries(solfeggio_FREQ).map(([key]) => (
          <Button
            key={key}
            onClick={() => setSolfeggio(key as keyof typeof solfeggio_FREQ)}
            variant={solfeggio === key ? 'contained' : 'outlined'}
            color="primary"
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
} 