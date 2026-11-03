import { Box, Chip, Paper, Typography } from "@mui/material";

import { PATTERN_NAMES } from "../constants";
import Swatch from "./Swatch";

// Texten kommer ur databasen och skrivs alltid som text (aldrig som HTML).
function Motiv({ motiv, collapsed }) {
  if (!motiv) {
    return (
      <Typography variant="caption" color="text.secondary">
        Inget motiv är angivet.
      </Typography>
    );
  }
  if (collapsed) {
    return (
      <Box component="details" sx={{ mt: 0.5 }}>
        <Typography
          component="summary"
          variant="caption"
          sx={{ cursor: "pointer" }}
        >
          Motiv
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {motiv}
        </Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        mt: 0.5,
        pl: 1,
        borderLeft: 3,
        borderColor: "divider",
        bgcolor: "action.hover",
        borderRadius: 0.5,
        py: 0.5,
      }}
    >
      <Typography variant="caption" fontWeight={600}>
        Motiv
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {motiv}
      </Typography>
    </Box>
  );
}

function RuleCard({ rule, here = false, collapsed = false, model }) {
  const label =
    rule.beteckning || (rule.monster ? PATTERN_NAMES[rule.monster] : "");
  return (
    <Paper
      variant="outlined"
      onMouseEnter={() => model.showHover(rule.egen_geojson)}
      onMouseLeave={() => model.hideHover()}
      sx={{
        display: "flex",
        gap: 1.5,
        p: 1.25,
        mb: 1,
        borderColor: here ? "primary.main" : "divider",
        borderWidth: here ? 2 : 1,
      }}
    >
      <Swatch rule={rule} />
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flexWrap: "wrap",
          }}
        >
          {label && (
            <Typography variant="body2" fontWeight={700}>
              {label}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {rule.kategori === "anvandning" ? "Användning" : "Egenskap"}
          </Typography>
          {here && <Chip size="small" color="primary" label="Gäller här" />}
        </Box>
        <Typography variant="body2" sx={{ mt: 0.25 }}>
          {rule.text}
        </Typography>
        <Motiv motiv={rule.motiv} collapsed={collapsed} />
      </Box>
    </Paper>
  );
}

export default RuleCard;
