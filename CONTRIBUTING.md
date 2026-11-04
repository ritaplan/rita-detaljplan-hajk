# Bidra till integrationen för Hajk

Tack för att du vill hjälpa till! Pluginet är ungt och all återkoppling är värdefull, särskilt från dig som kör Hajk i en
kommun och har en annan miljö än den jag har provat med.

## Rapportera fel eller önska något

Öppna ett ärende under [Issues](https://github.com/ritaplan/rita-detaljplan-hajk/issues) och välj mall. Ange gärna
Hajk-version, hur Hajk körs (utvecklingsläge, produktionsbygge eller Docker), kartans koordinatsystem och vad som syns i
webbläsarens konsol. **Klistra inte in lösenord, nycklar eller adresser till interna system, och bifoga aldrig en plan med
uppgifter du inte får dela.** Skärmbilder hjälper mycket.

Frågor om Hajk i sig hör hemma i [Hajks eget repo](https://github.com/hajkmap/Hajk), och frågor om hur planerna ritas och
checkas in i QGIS hör till [Rita Detaljplan](https://github.com/ritaplan/rita-detaljplan).

## Köra och prova koden

Ett Hajk-plugin kompileras in i Hajks klient, så koden provas i en Hajk (4.x, byggd från källkod):

1. Installera pluginet med `node installera.mjs <sökväg till Hajk>` (se [docs/installera.md](docs/installera.md)).
2. Starta klienten med `npm run dev` i `apps/client`, och Admin i `apps/admin` om du ändrat inställningssidan.
3. Prova mot en GeoServer med planerna uppsatta enligt
   [rita-detaljplan-origomap](https://github.com/ritaplan/rita-detaljplan-origomap/blob/main/docs/kom-igang.md).
   Rita Detaljplans demoplaner duger.

Repot har **inga automatiska tester än**: en ändring provas för hand, och *Provat med* i [README](README.md) säger vad som har
provats och inte. Bidrag med tester är mycket välkomna.

## Kodstil

- **Texterna i fönstret är på svenska, koden på engelska** (namn på funktioner och variabler). Kommentarer får vara på
  svenska där de förklarar varför.
- Följ stilen i omgivande kod och i Hajk (React-komponenter och Material UI). Liten och tydlig kod före smart kod.
- Pluginet ska **inte lägga till egna beroenden**: det använder det Hajk redan har (React, MUI, notistack och OpenLayers).
- Allt som kommer ur databasen skrivs som text, aldrig som HTML, och länkar till handlingar måste börja med `http://` eller
  `https://`. Se [SECURITY.md](SECURITY.md).
- Innan en ändring lämnas in ska klienten gå att bygga (`npm run build` i `apps/client`) och passera Hajks egna
  kodkontroller (prettier och eslint).

## Pull requests

1. Forka repot och skapa en gren.
2. Prova ändringen enligt ovan. På GitHub körs också kodanalys (CodeQL för JavaScript) och OpenSSF Scorecard; de ska vara
   gröna. Hittar du en säkerhetsbrist: öppna inte ett ärende eller en pull request, utan följ [SECURITY.md](SECURITY.md).
3. Beskriv vad ändringen gör och varför, och lägg en rad i [CHANGELOG.md](CHANGELOG.md) under *Ej utgivet*.
4. Öppna en pull request.

Genom att bidra godkänner du att ditt bidrag licensieras under samma licens som projektet (GPL-2.0-or-later).
