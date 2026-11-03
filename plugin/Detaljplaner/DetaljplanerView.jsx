import { Alert, Box, Skeleton, Typography } from "@mui/material";

import AllRules from "./components/AllRules";
import Documents from "./components/Documents";
import Facts from "./components/Facts";
import PlanHeader from "./components/PlanHeader";
import Rules from "./components/Rules";
import { groupAreas } from "./utils";

function Loading() {
  return (
    <Box aria-busy="true" aria-hidden="true">
      <Skeleton width="30%" />
      <Skeleton width="80%" height={36} />
      <Skeleton width="50%" />
      <Skeleton variant="rounded" height={64} sx={{ mt: 2 }} />
      <Skeleton variant="rounded" height={96} sx={{ mt: 1 }} />
    </Box>
  );
}

function DetaljplanerView({ state, model }) {
  switch (state.status) {
    case "loading":
      return <Loading />;
    case "none":
      return (
        <Alert severity="info">
          Det finns ingen detaljplan där du klickade.
        </Alert>
      );
    case "error":
      return (
        <Alert severity="error">
          Uppgifterna kunde inte hämtas. Kartservern svarade inte, försök igen
          om en stund.
        </Alert>
      );
    case "ready": {
      const areas = groupAreas(state.rows);
      return (
        <Box>
          <PlanHeader plan={state.plan} />
          <Documents plan={state.plan} />
          <Facts plan={state.plan} />
          {areas.length > 0 && (
            <Rules areas={areas} coordinate={state.coordinate} model={model} />
          )}
          {model.hasWfs && <AllRules plan={state.plan} model={model} />}
        </Box>
      );
    }
    default:
      return (
        <Typography color="text.secondary">
          Klicka på en detaljplan i kartan för att se planens uppgifter,
          handlingar och bestämmelser.
        </Typography>
      );
  }
}

export default DetaljplanerView;
