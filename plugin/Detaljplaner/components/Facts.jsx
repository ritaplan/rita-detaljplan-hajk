import React from "react";
import { Box, Typography } from "@mui/material";

import { formatDate, plural } from "../utils";

function genomforandetid(plan) {
  if (!plan.genomforandetid_manader) return "";
  const years = plan.genomforandetid_manader / 12;
  const length =
    years % 1 === 0
      ? plural(years, "år", "år")
      : plural(plan.genomforandetid_manader, "månad", "månader");
  const until = formatDate(plan.genomforandetid_utgar);
  return until ? `${length} (till ${until})` : length;
}

function Facts({ plan }) {
  const facts = [
    ["Antagen", formatDate(plan.datum_antagande)],
    ["Laga kraft", formatDate(plan.datum_laga_kraft)],
    ["Genomförandetid", genomforandetid(plan)],
  ].filter(([, value]) => value);

  return (
    <Box component="section" sx={{ mb: 2 }}>
      <Typography variant="subtitle2" component="h3" gutterBottom>
        Om planen
      </Typography>
      {plan.syfte && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {plan.syfte}
        </Typography>
      )}
      <Box
        component="dl"
        sx={{
          m: 0,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 0.5,
          columnGap: 2,
        }}
      >
        {facts.map(([label, value]) => (
          <React.Fragment key={label}>
            <Typography component="dt" variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0 }}>
              {value}
            </Typography>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

export default Facts;
