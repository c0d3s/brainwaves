import {
  PlayArrowOutlined,
  ShuffleOutlined,
  StopOutlined,
  SpeedOutlined,
} from "@mui/icons-material";
import { Button } from "@mui/material";

interface Props {
  isPlaying: boolean;
  beat: number;
  onPlay: () => Promise<void>;
  onRandomize: () => void;
  onDrift: () => void;
  isDrifting: boolean;
}

export function PlayControls({
  isPlaying,
  onPlay,
  onRandomize,
  onDrift,
  beat,
  isDrifting,
}: Props) {
  return (
    <div>
      <Button
        size="large"
        variant={isPlaying ? "contained" : "outlined"}
        color={isPlaying ? "primary" : "secondary"}
        onClick={onPlay}
        sx={{ margin: "1rem" }}
      >
        {isPlaying ? <StopOutlined /> : <PlayArrowOutlined />}
      </Button>
      <Button
        size="small"
        variant="outlined"
        disabled={!isPlaying}
        onClick={onRandomize}
        sx={{ margin: "1rem" }}
        color="secondary"
      >
        <ShuffleOutlined /> {beat.toFixed(1)}
      </Button>
      <Button
        size="large"
        variant={isDrifting ? "contained" : "outlined"}
        color={isDrifting ? "primary" : "secondary"}
        disabled={!isPlaying}
        onClick={onDrift}
        sx={{ margin: "1rem" }}
      >
        <SpeedOutlined />
      </Button>
    </div>
  );
}
