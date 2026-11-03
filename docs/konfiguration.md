# Inställningar

Pluginet ställs in i Hajk Admin (Kartor, Verktyg, Detaljplaner) eller direkt i kartans JSON-fil
(`apps/backend/App_Data/<karta>.json`), i verktygets `options`. Namnen nedan är JSON-namnen. Ett färdigt exempel finns i
[`exempel/verktyg.json`](../exempel/verktyg.json). I Admin heter fälten: WMS-adress (`infoUrl`), WFS-adress (`wfsUrl`), Lager som
frågas (`layers`), kryssrutorna för kartlager (`layerIds`), Rubrik (`title`), Beskrivning (`description`), Sorteringsordning
(`index`), Verktygsplacering (`target`), Fönsterplacering (`position`), Fönsterbredd (`width`), Fönsterhöjd (`height`) och
Synlig vid start (`visibleAtStart`, `visibleAtStartMobile`). Tomma fält sparas inte, så pluginets standardvärden gäller.

## Pluginets inställningar

| Inställning | Standard | Betydelse |
|---|---|---|
| `infoUrl` | – | **Krävs.** GeoServers WMS i arbetsytan `planmosaik`. Pluginet frågar den vid klick. |
| `wfsUrl` | – | Valfri. GeoServers `ows`-adress i samma arbetsyta. Ger knappen "Visa alla bestämmelser i planen". |
| `layerIds` | `[]` | Id:na på de Hajk-lager som visar detaljplanerna. Fönstret öppnas vid klick när något av dem är synligt. |
| `layers` | `plan_bestammelser,planmosaik` | Lagren som frågas. Ändra bara om du har döpt om dem i GeoServer. |
| `title` | `Detaljplaner` | Fönstrets rubrik och knappens text. |
| `description` | (en kort text) | Texten på knappen i verktygsmenyn. |
| `target` | – | Var knappen ligger, som för Hajks övriga verktyg: `toolbar` (menyn), `left`, `right`, `control` eller `hidden`. |
| `position` | `left` | Vilken sida fönstret öppnas på. |
| `width` | `440` | Fönstrets bredd i pixlar. |
| `height` | `auto` | Fönstrets höjd. `auto` använder hela höjden, `dynamic` anpassar sig efter innehållet. |
| `visibleAtStart` | `false` | Fönstret är öppet när kartan startar. |
| `visibleAtStartMobile` | `false` | Samma, på telefon. |

## Hur klicket tolkas

Pluginet lyssnar själv på kartklick. Det reagerar när:

- fönstret är öppet, eller
- något av lagren i `layerIds` är synligt (då öppnas fönstret av klicket, om där finns en plan).

Det reagerar inte när ett annat verktyg har kartklicken (mätning, ritning och så vidare). Klickar man utanför planerna visas
en kort ruta ("Det finns ingen detaljplan här") och fönstret öppnas inte.

Uppgifterna hämtas med ett enda GetFeatureInfo-anrop till `infoUrl` (lagren `planmosaik` och `plan_bestammelser`). Kartan kan
gå i det koordinatsystem du vill: bestämmelsernas ytor levereras i Web Mercator och räknas om i kartan. Provat är Web Mercator
(EPSG:3857) och SWEREF 99 TM (EPSG:3006). Kartans koordinatsystem måste vara definierat i kartans `projections` (som Hajks
standardkarta har för 3006).

## Anrop mellan Hajk och GeoServer

Webbläsaren gör anropen, så Hajk och GeoServer måste vara åtkomliga för varandra. Tre sätt:

1. **Samma adress (enklast).** Din webbserver skickar `/geoserver/` till GeoServer, så att kartan och tjänsten ligger på
   samma webbplats. Använd då relativa eller samma-ursprungs-adresser i `infoUrl` och `wfsUrl`. Hur den regeln ser ut finns
   i [rita-detaljplan-origomap](https://github.com/ritaplan/rita-detaljplan-origomap/blob/main/docs/kom-igang.md#9-publicera-på-nätet).
2. **Hajks egen proxy.** Hajks backend kan vidarebefordra anrop till GeoServer. Ange GeoServers adress som
   `PROXY_GEOSERVER` i backendens `.env` och använd `<backend>/api/v2/proxy/geoserver/planmosaik/wms` som `infoUrl` (och
   som lagrets `url`). Så är pluginet provat.
3. **CORS i GeoServer.** Tillåt Hajks adress i GeoServer (`CORS_ENABLED=true` i behållarens inställningar). Då kan
   `infoUrl` peka direkt på GeoServer.

Pluginet använder Hajks egen anropsfunktion (`hfetch`), så Hajks inställningar för inloggningsuppgifter (`hfetch` i
`appConfig.json`) gäller även här.

## Utseende

Fönstret använder Hajks tema (färger, ljust och mörkt läge) och Material UI:s komponenter. Statusfärgerna, texterna och
markeringsfärgerna i kartan står överst i [`plugin/Detaljplaner/constants.js`](../plugin/Detaljplaner/constants.js). Ändra där
och kör `node installera.mjs` igen.

## Vad som visas ur databasen

Samma uppgifter som i Origo-lösningen: se
[data.md](https://github.com/ritaplan/rita-detaljplan-origomap/blob/main/docs/data.md). Vilka planstatusar som är offentliga
bestäms i databasvyn `planmosaik` (`PUBLIC_STATUSES`), inte i pluginet.
