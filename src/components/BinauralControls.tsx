import { ButtonGroup, Button, IconButton } from "@mui/material";
import { GraphicEqOutlined } from "@mui/icons-material";
import { BINAURAL_FREQ } from "../constants";

interface Props {
  binaural: keyof typeof BINAURAL_FREQ;
  setBinaural: (value: keyof typeof BINAURAL_FREQ) => void;
}

export function BinauralControls({ binaural, setBinaural }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <IconButton disabled>
        <GraphicEqOutlined />
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
        {Object.keys(BINAURAL_FREQ).map((key) => (
          <Button
            key={key}
            onClick={() => setBinaural(key as keyof typeof BINAURAL_FREQ)}
            variant={binaural === key ? "contained" : "outlined"}
            color={binaural === key ? "primary" : "secondary"}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}
