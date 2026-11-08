# Ändringslogg

Formatet följer [Keep a Changelog](https://keepachangelog.com/sv/1.1.0/), versionsnumren [Semantic Versioning](https://semver.org/lang/sv/).

## Ej utgivet

- **Dokumentation: CORS för publika lager.** `docs/konfiguration.md` förklarar att CORS också är vad som låter andra
  webbappar läsa planerna som data (WFS/GeoJSON), rekommenderar det för de publika lagren och hänvisar till beskrivningen i
  integrationen för Origo. Förslag från Martin Wiss, som prövat planerna i Dataspatium.
- **Provat i SWEREF 99 TM (EPSG:3006):** pluginet fungerar i en Hajk-karta i EPSG:3006 utan kodändring. README och
  inställningsdokumentet säger nu det.
- **Texter:** README kallar pluginet *integrationen för Hajk*, som [ritaplan.xyz](https://ritaplan.xyz) och organisationens
  profil. Märket, banderollerna och förhandsbilden är borttagna.
- **Standardfiler och kontroller:** CONTRIBUTING, CHANGELOG och NOTICE, ärendemallar, Dependabot för GitHub Actions och
  automatiska kontroller på GitHub (kodanalys med CodeQL för JavaScript och OpenSSF Scorecard).
- **Installationsskriptet** `installera.mjs` läser Hajk Admins `tooloptions.jsx` direkt i stället för att först fråga om
  filen finns (ett fynd från den nya kodanalysen: en möjlig kapplöpning i filsystemet). Skriptet gör samma sak som förut, och
  fyra fall är provade mot en påhittad Hajk-mapp: utan Admin, med Admin, upprepad installation och `--ta-bort`. Det rörde inte
  pluginet som körs i webbläsaren.

## [0.1.0] – 2026-11-03 – första versionen

- **Informationsfönster vid klick:** planens uppgifter (namn, beteckning, diarienummer, status i klartext, syfte, datum för
  antagande och laga kraft, genomförandetid), handlingarna (plankartan och planbeskrivningen som knappar), och bestämmelserna i
  området med motiv. De som gäller exakt där man klickade är markerade *Gäller här*, och en knapp hämtar alla bestämmelser i
  planen (WFS). Området ramas in i kartan och en bestämmelses yta markeras när man pekar på den. Fungerar på dator och
  telefon och följer Hajks tema.
- **Inställningssida i Hajk Admin** (*Kartor, Verktyg, Detaljplaner*): adresser till karttjänsten, vilka lager som visar planerna
  och fönstrets utseende. Det går också att ställa in i kartans JSON-fil.
- **Installationsskriptet** `installera.mjs` kopierar pluginet till Hajks klient, lägger det i listan över verktyg och lägger
  inställningssidan i Admin. `--utan-admin` hoppar över inställningssidan och `--ta-bort` tar bort allt igen.
- **Säkert som standard:** pluginet har ingen egen serverdel, läser samma skrivskyddade databasvyer som integrationen för Origo
  (via GeoServer), skriver texter ur databasen som text och släpper bara igenom länkar som börjar med `http://` eller
  `https://`.
- Dokumentation för installation, inställningar, felsökning och produktionsbygge i Docker.
- Provat med Hajk 4.3.0 (utvecklingsläge och produktionsbygge), GeoServer 3.0.2 och Rita Detaljplans demoplaner.
