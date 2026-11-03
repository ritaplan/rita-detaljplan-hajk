import { Box, Chip, Typography } from "@mui/material";

import { STATUS } from "../constants";
import { formatDate } from "../utils";

function statusNote(plan, status) {
  const until = formatDate(plan.genomforandetid_utgar);
  if (plan.visningsstatus === "gällande, genomförandetiden pågår" && until) {
    return `Genomförandetiden pågår till och med ${until}.`;
  }
  if (
    plan.visningsstatus === "gällande, genomförandetiden har gått ut" &&
    until
  ) {
    return `Genomförandetiden gick ut ${until}.`;
  }
  return status.note;
}

function PlanHeader({ plan }) {
  const status = STATUS[plan.visningsstatus] || {
    label: plan.status || "",
    tone: "default",
    note: "",
  };
  const note = statusNote(plan, status);
  const meta = [
    plan.beteckning,
    plan.diarienummer ? `Dnr ${plan.diarienummer}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box component="header" sx={{ mb: 2 }}>
      <Typography variant="overline" color="text.secondary">
        {["Detaljplan", plan.kommun].filter(Boolean).join(" · ")}
      </Typography>
      <Typography variant="h6" component="h2" sx={{ lineHeight: 1.25 }}>
        {plan.namn || plan.beteckning || "Detaljplan"}
      </Typography>
      {meta && (
        <Typography variant="body2" color="text.secondary">
          {meta}
        </Typography>
      )}
      <Box
        sx={{
          mt: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {status.label && (
          <Chip size="small" color={status.tone} label={status.label} />
        )}
        {note && (
          <Typography variant="body2" color="text.secondary">
            {note}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default PlanHeader;
