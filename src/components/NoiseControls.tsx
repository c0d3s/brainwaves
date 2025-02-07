import { ButtonGroup, Button, IconButton, Slider } from "@mui/material";
import { AirOutlined } from "@mui/icons-material";

type NoiseType = "white" | "pink" | "brown" | "off";

interface Props {
  noiseType: NoiseType;
  setNoiseType: (value: NoiseType) => void;
  noiseVolume: number;
  setNoiseVolume: (value: number) => void;
}

export function NoiseControls({
  noiseType,
  setNoiseType,
  noiseVolume,
  setNoiseVolume,
}: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <IconButton color="secondary">
        <AirOutlined />
      </IconButton>
      <ButtonGroup
        orientation="horizontal"
        variant="contained"
        sx={{
          "& .MuiButton-root": {
            marginRight: "8px",
            borderColor: "primary.main",
            "&:last-child": {
              marginRight: 0,
              borderColor: "primary.main",
            },
          },
        }}
      >
        {["off", "white", "pink", "brown"].map((type) => (
          <Button
            key={type}
            onClick={() => setNoiseType(type as NoiseType)}
            variant={noiseType === type ? "contained" : "outlined"}
            color={noiseType === type ? "primary" : "secondary"}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </ButtonGroup>
      <Slider
        orientation="horizontal"
        min={0}
        max={1}
        step={0.01}
        value={noiseVolume ?? 0.5}
        onChange={(_, newValue) => setNoiseVolume(newValue as number)}
        sx={{
          width: 75,
          ml: 2,
          "& .MuiSlider-thumb": {
            color: noiseType === "off" ? "secondary.main" : "primary.main",
          },
          "& .MuiSlider-track": {
            color: noiseType === "off" ? "secondary.main" : "primary.main",
          },
        }}
      />
    </div>
  );
}
