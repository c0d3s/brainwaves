import { ButtonGroup, Button, IconButton } from '@mui/material';
import { WaterOutlined } from '@mui/icons-material';
import { SOLFEGGIO_FREQ } from '../constants';

interface Props {
  solfeggio: keyof typeof SOLFEGGIO_FREQ;
  setSolfeggio: (value: keyof typeof SOLFEGGIO_FREQ) => void;
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
        {Object.entries(SOLFEGGIO_FREQ).map(([key]) => (
          <Button
            key={key}
            onClick={() => setSolfeggio(key as keyof typeof SOLFEGGIO_FREQ)}
            variant={solfeggio === key ? 'contained' : 'outlined'}
            color={solfeggio === key ? "primary" : "secondary"}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
} 