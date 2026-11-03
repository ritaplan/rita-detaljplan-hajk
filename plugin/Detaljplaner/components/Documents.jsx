import { Box, Button, Link, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { formatDate, isHttpUrl, parseJson } from "../utils";

function extension(url) {
  return (/\.([a-z0-9]{2,4})(?:[?#]|$)/i.exec(url || "") ||
    [])[1]?.toUpperCase();
}

function meta(doc) {
  return [formatDate(doc.datum), extension(doc.lank)]
    .filter(Boolean)
    .join(" · ");
}

// Plankartan och planbeskrivningen är det man oftast söker: stora knappar.
function MainDocument({ doc }) {
  return (
    <Button
      fullWidth
      variant="outlined"
      href={doc.lank}
      target="_blank"
      rel="noopener noreferrer"
      startIcon={<DescriptionOutlinedIcon />}
      endIcon={<OpenInNewIcon fontSize="small" />}
      sx={{
        justifyContent: "flex-start",
        textAlign: "left",
        textTransform: "none",
        mb: 1,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" fontWeight={600} component="div">
          {doc.namn || "Handling"}
        </Typography>
        {meta(doc) && (
          <Typography variant="caption" color="text.secondary" component="div">
            {meta(doc)}
          </Typography>
        )}
      </Box>
    </Button>
  );
}

function Documents({ plan }) {
  const docs = parseJson(plan.handlingar, []).filter(
    (d) => d && isHttpUrl(d.lank)
  );
  const main = docs.filter(
    (d) => d.innehall === "plankarta" || d.roll === "planbeskrivning"
  );
  const rest = docs.filter((d) => !main.includes(d));

  return (
    <Box component="section" sx={{ mb: 2 }}>
      <Typography variant="subtitle2" component="h3" gutterBottom>
        Handlingar
      </Typography>
      {docs.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Inga handlingar är kopplade till planen.
        </Typography>
      )}
      {main.map((doc) => (
        <MainDocument key={doc.lank} doc={doc} />
      ))}
      {rest.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Övriga handlingar
          </Typography>
          {rest.map((doc) => (
            <Box key={doc.lank} sx={{ py: 0.25 }}>
              <Link
                href={doc.lank}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                {doc.namn || "Handling"}
              </Link>
              {meta(doc) && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {meta(doc)}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default Documents;
