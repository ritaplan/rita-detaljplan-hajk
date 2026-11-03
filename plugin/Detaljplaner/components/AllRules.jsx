import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { areaTitle, orderRules, plural, uniqueRules } from "../utils";
import RuleCard from "./RuleCard";

// Knappen "Visa alla bestämmelser i planen": hämtar bestämmelserna i alla områden med WFS.
function AllRules({ plan, model }) {
  const [state, setState] = React.useState({ status: "idle" });

  // Ett nytt klick på en annan plan nollställer listan.
  React.useEffect(() => setState({ status: "idle" }), [plan.plan]);

  const load = async () => {
    setState({ status: "loading" });
    try {
      setState({
        status: "ready",
        areas: await model.fetchAllRules(plan.plan),
      });
    } catch {
      setState({ status: "error" });
    }
  };

  return (
    <Box component="section" sx={{ mt: 1 }}>
      {state.status !== "ready" && (
        <Button
          variant="outlined"
          fullWidth
          onClick={load}
          disabled={state.status === "loading"}
          startIcon={
            state.status === "loading" ? <CircularProgress size={16} /> : null
          }
        >
          {state.status === "loading"
            ? "Hämtar…"
            : "Visa alla bestämmelser i planen"}
        </Button>
      )}
      {state.status === "error" && (
        <Alert severity="error" sx={{ mt: 1 }}>
          Kunde inte hämta bestämmelserna. Försök igen.
        </Alert>
      )}
      {state.status === "ready" &&
        state.areas.map((area) => {
          const rules = orderRules(
            area.rows.filter((r) => r.kategori === "anvandning")
          ).concat(
            orderRules(
              uniqueRules(area.rows.filter((r) => r.kategori === "egenskap"))
            )
          );
          return (
            <Accordion key={area.id} disableGutters variant="outlined">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2">
                  {areaTitle(area) || "Område"} (
                  {plural(rules.length, "bestämmelse", "bestämmelser")})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {rules.map((rule, i) => (
                  <RuleCard key={i} rule={rule} collapsed model={model} />
                ))}
              </AccordionDetails>
            </Accordion>
          );
        })}
    </Box>
  );
}

export default AllRules;
