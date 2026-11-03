import { Box, Typography } from "@mui/material";

import { areaTitle, splitArea } from "../utils";
import RuleCard from "./RuleCard";

function Heading({ children, color }) {
  return (
    <Typography
      variant="caption"
      color={color || "text.secondary"}
      fontWeight={600}
      component="h4"
      sx={{ display: "block", mt: 1.5, mb: 0.5 }}
    >
      {children}
    </Typography>
  );
}

function Area({ area, coordinate, model }) {
  const { use, here, other } = splitArea(area, coordinate);
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary" component="div">
          Området du klickade i
        </Typography>
        <Typography variant="body1" fontWeight={600}>
          {areaTitle(area) || "Område"}
        </Typography>
      </Box>
      {use.length > 0 && (
        <>
          <Heading>Användning</Heading>
          {use.map((rule, i) => (
            <RuleCard key={`use-${i}`} rule={rule} model={model} />
          ))}
        </>
      )}
      {here.length > 0 && (
        <>
          <Heading color="primary">Egenskaper där du klickade</Heading>
          {here.map((rule, i) => (
            <RuleCard key={`here-${i}`} rule={rule} here model={model} />
          ))}
        </>
      )}
      {other.length > 0 && (
        <Box component="details" sx={{ mt: 1 }}>
          <Typography
            component="summary"
            variant="body2"
            sx={{ cursor: "pointer", mb: 1 }}
          >
            Övriga egenskaper i området ({other.length})
          </Typography>
          {other.map((rule, i) => (
            <RuleCard key={`other-${i}`} rule={rule} collapsed model={model} />
          ))}
        </Box>
      )}
      {use.length + here.length + other.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Området har inga bestämmelser.
        </Typography>
      )}
    </Box>
  );
}

function Rules({ areas, coordinate, model }) {
  return (
    <Box component="section">
      <Typography variant="subtitle2" component="h3" gutterBottom>
        Bestämmelser här
      </Typography>
      {areas.map((area) => (
        <Area key={area.id} area={area} coordinate={coordinate} model={model} />
      ))}
    </Box>
  );
}

export default Rules;
