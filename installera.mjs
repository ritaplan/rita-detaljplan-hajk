#!/usr/bin/env node
// Lägger in pluginet Detaljplaner i en Hajk-klient (eller tar bort det igen).
//
//   node installera.mjs <sökväg till Hajk, mappen som innehåller apps/>
//   node installera.mjs <sökväg till Hajk> --ta-bort
//   node installera.mjs <sökväg till Hajk> --utan-admin    (hoppar över inställningssidan i Hajk Admin)
//
// Skriptet gör fyra saker, och kan köras om utan skada:
//   1. kopierar plugin/Detaljplaner till apps/client/src/plugins/Detaljplaner
//   2. lägger "Detaljplaner" i AVAILABLE_TOOLS i apps/client/src/constants.js
//   3. lägger "Detaljplaner" i availableTools i apps/client/public/appConfig.json (och appConfig.docker.json)
//   4. lägger inställningssidan admin/detaljplaner.jsx i Hajk Admin (apps/admin/src/views/tools) och registrerar
//      den i tooloptions.jsx
// Därefter bygger du om klienten (och Admin om du använder den). Se docs/installera.md.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NAME = "Detaljplaner";
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const remove = args.includes("--ta-bort");
const withoutAdmin = args.includes("--utan-admin");
const hajk = args.find((a) => !a.startsWith("--"));

function fail(message) {
  console.error(`Fel: ${message}`);
  process.exit(1);
}

if (!hajk) {
  fail("Ange sökvägen till din Hajk-mapp, till exempel: node installera.mjs C:/hajk");
}

const client = path.join(path.resolve(hajk), "apps", "client");
const pluginsDir = path.join(client, "src", "plugins");
const constantsFile = path.join(client, "src", "constants.js");
const appConfigFile = path.join(client, "public", "appConfig.json");
for (const required of [pluginsDir, constantsFile]) {
  if (!fs.existsSync(required)) {
    fail(`Hittar inte ${required}. Är det här en Hajk-mapp (version 4.x)?`);
  }
}

const target = path.join(pluginsDir, NAME);

// --- 1. pluginmappen ---------------------------------------------------------------------------------------------
if (remove) {
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`Tog bort ${target}`);
} else {
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(path.join(here, "plugin", NAME), target, { recursive: true });
  console.log(`Kopierade pluginet till ${target}`);
}

// --- 2. AVAILABLE_TOOLS ------------------------------------------------------------------------------------------
let constants = fs.readFileSync(constantsFile, "utf8");
const eol = constants.includes("\r\n") ? "\r\n" : "\n";
const entry = new RegExp(`^\\s*"${NAME}",\\s*$`, "m");
const list = /export const AVAILABLE_TOOLS = \[([\s\S]*?)\];/;
if (!list.test(constants)) {
  fail("Hittar inte listan AVAILABLE_TOOLS i constants.js. Lägg in \"Detaljplaner\" för hand.");
}
if (remove) {
  constants = constants.replace(new RegExp(`^\\s*"${NAME}",\\r?\\n`, "m"), "");
  console.log("Tog bort Detaljplaner ur AVAILABLE_TOOLS");
} else if (entry.test(constants)) {
  console.log("Detaljplaner finns redan i AVAILABLE_TOOLS");
} else {
  // Listan är i bokstavsordning: lägg in före första namnet som kommer efter (annars sist).
  constants = constants.replace(list, (whole, body) => {
    const names = body.split(/\r?\n/).filter((l) => l.trim());
    const after = names.findIndex((l) => l.trim().replace(/[",]/g, "") > NAME);
    const line = `  "${NAME}",`;
    if (after < 0) names.push(line);
    else names.splice(after, 0, line);
    return `export const AVAILABLE_TOOLS = [${eol}${names.join(eol)}${eol}];`;
  });
  console.log("Lade in Detaljplaner i AVAILABLE_TOOLS");
}
fs.writeFileSync(constantsFile, constants);

// --- 3. appConfig.json och appConfig.docker.json -----------------------------------------------------------------
// Hajks Docker-bygge ersätter appConfig.json med appConfig.docker.json, så verktyget ska finnas i båda.
// Texten ändras direkt (inte via JSON.parse), så att resten av filen får vara som den är.
function patchAppConfig(file) {
  const name = path.basename(file);
  let text = fs.readFileSync(file, "utf8");
  const nl = text.includes("\r\n") ? "\r\n" : "\n";
  const tools = /("availableTools"\s*:\s*\[)([\s\S]*?)(\])/;
  if (!tools.test(text)) {
    console.log(`${name} saknar availableTools: alla verktyg läses in, inget att ändra.`);
    return;
  }
  const present = new RegExp(`"${NAME}"`).test(tools.exec(text)[2]);
  if (remove && present) {
    text = text.replace(
      tools,
      (whole, open, body, close) => `${open}${body.replace(new RegExp(`\\s*"${NAME}",?`), "")}${close}`
    );
  } else if (!remove && !present) {
    text = text.replace(tools, (whole, open, body, close) => {
      const items = body.match(/"[^"]*"/g) || [];
      const indent = (/\r?\n([ \t]+)"/.exec(body) || [, "    "])[1];
      const after = items.findIndex((t) => t.replace(/"/g, "") > NAME);
      items.splice(after < 0 ? items.length : after, 0, `"${NAME}"`);
      return `${open}${nl}${items.map((t) => indent + t).join(`,${nl}`)}${nl}  ${close}`;
    });
  }
  fs.writeFileSync(file, text);
  console.log(`${name}: ${remove ? "Detaljplaner borttagen" : "Detaljplaner med i availableTools"}`);
}

const appConfigFiles = [appConfigFile, path.join(client, "public", "appConfig.docker.json")].filter((f) =>
  fs.existsSync(f)
);
if (appConfigFiles.length === 0) {
  console.log("Hittar ingen appConfig.json här: lägg in Detaljplaner i availableTools där du har den.");
}
appConfigFiles.forEach(patchAppConfig);

// --- 4. Hajk Admin -----------------------------------------------------------------------------------------------
// Sidan registreras i tooloptions.jsx med tre rader: en import, en case och en rubrik i listan över verktyg.
const adminDir = path.join(path.resolve(hajk), "apps", "admin", "src", "views");
const toolOptionsFile = path.join(adminDir, "tooloptions.jsx");
const adminTarget = path.join(adminDir, "tools", "detaljplaner.jsx");
let adminDone = false;

if (withoutAdmin) {
  console.log("Hajk Admin: hoppade över (--utan-admin).");
} else if (!fs.existsSync(toolOptionsFile)) {
  console.log("Hajk Admin: hittar inte apps/admin här, hoppar över inställningssidan.");
} else {
  let text = fs.readFileSync(toolOptionsFile, "utf8");
  const nl = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = {
    import: 'import Detaljplaner from "./tools/detaljplaner.jsx";',
    // [rad före vilken casen läggs, casen]
    caseAnchor: '      case "dummy":',
    caseText: [
      '      case "detaljplaner":',
      "        return <Detaljplaner parent={this} model={this.props.model} />;",
    ],
    importAnchor: 'import Dummy from "./tools/dummy.jsx";',
    typeAnchor: '      documenthandler: "Dokumenthanterare",',
    typeText: '      detaljplaner: "Detaljplaner",',
  };
  const missing = [lines.importAnchor, lines.caseAnchor, lines.typeAnchor].filter((a) => !text.includes(a));
  if (missing.length && !remove) {
    console.log("Hajk Admin: tooloptions.jsx ser annorlunda ut än väntat, hoppar över. Se docs/installera.md.");
  } else {
    if (remove) {
      text = text
        .replace(`${lines.import}${nl}`, "")
        .replace(`${lines.caseText.join(nl)}${nl}`, "")
        .replace(`${lines.typeText}${nl}`, "");
      fs.rmSync(adminTarget, { force: true });
    } else {
      const before = (anchor, add) => (text.includes(add) ? null : text.replace(anchor, `${add}${nl}${anchor}`));
      text = before(lines.importAnchor, lines.import) ?? text;
      text = before(lines.caseAnchor, lines.caseText.join(nl)) ?? text;
      text = before(lines.typeAnchor, lines.typeText) ?? text;
      fs.copyFileSync(path.join(here, "admin", "detaljplaner.jsx"), adminTarget);
    }
    fs.writeFileSync(toolOptionsFile, text);
    adminDone = true;
    console.log(`Hajk Admin: ${remove ? "inställningssidan borttagen" : "inställningssidan inlagd"}`);
  }
}

if (!remove) {
  console.log(
    `\nKlart. Nästa steg: bygg om klienten${adminDone ? " (och Admin)" : ""}. ` +
      "Ställ in verktyget i Admin, eller lägg det i kartans JSON-fil (docs/installera.md)."
  );
}
