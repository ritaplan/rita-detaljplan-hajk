# Felsökning

| Du ser | Orsak och rättning |
|---|---|
| Verktyget finns inte i menyn | `Detaljplaner` saknas i `AVAILABLE_TOOLS` eller i `availableTools` i `appConfig.json`, eller så har klienten inte byggts om. Kör `node installera.mjs` igen och bygg om. Webbläsarens konsol varnar för "unavailable plugins" om verktygstypen i kartans JSON inte känns igen: den ska vara `detaljplaner` med små bokstäver. |
| Inget händer vid klick | Antingen är `infoUrl` inte ifylld, eller så är inget av lagren i `layerIds` synligt och fönstret är stängt. Öppna fönstret från menyn, eller lägg lagrets id i `layerIds`. Öppna webbläsarens nätverksflik: ett anrop med `GetFeatureInfo` ska gå iväg vid klick. |
| "Uppgifterna kunde inte hämtas" | Anropet till `infoUrl` misslyckades. Titta i nätverksfliken efter felkod. Vanligast är att Hajk inte får anropa GeoServer (CORS) eller att adressen är fel: se [konfiguration.md](konfiguration.md#anrop-mellan-hajk-och-geoserver). |
| "Det finns ingen detaljplan här" fast du klickar på en plan | Lagrets bild och frågan går mot olika adresser eller olika planer. Kontrollera att `infoUrl` pekar på samma GeoServer som lagret, och att planen har en status som är offentlig (`PUBLIC_STATUSES`). Zooma in: på långt håll träffar klicket flera kvarter. |
| Två rutor vid klick (Hajks och pluginets) | Lagret är frågbart i Hajk. Slå av `queryable` för lagret (steg 2 i [installera.md](installera.md)). |
| Knappen "Visa alla bestämmelser" saknas | `wfsUrl` är inte ifylld. |
| Knappen visar felet "Kunde inte hämta bestämmelserna" | `wfsUrl` går inte att nå, eller lagret `plan_bestammelser` är inte publicerat. Kör `python3 geoserver/konfigurera_geoserver.py` i rita-detaljplan-origomap. |
| Markeringen i kartan hamnar fel | Kartans koordinatsystem är inte registrerat i Hajk (`projections` i kartans JSON). Pluginet räknar om från Web Mercator med Hajks egna definitioner. |
| `npm run build` ger fel om `Detaljplaner` | Pluginets mapp heter fel. Den ska heta `Detaljplaner` (stor första bokstav): namnet i `AVAILABLE_TOOLS` måste stämma exakt med mappnamnet. |
| Fönstret är tomt på en telefon | Hajk visar fönstren över hela skärmen på små skärmar. Stäng med korset. |
