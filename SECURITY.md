# Säkerhet

Det här är ett plugin som läser detaljplaner ur en karttjänst (GeoServer) och visar dem i Hajk. Pluginet har ingen egen
serverdel. Det som är åtkomligt avgörs därför av karttjänsten och databasvyerna, som sätts upp med
[rita-detaljplan-origomap](https://github.com/ritaplan/rita-detaljplan-origomap) (se dess
[SECURITY.md](https://github.com/ritaplan/rita-detaljplan-origomap/blob/main/SECURITY.md)).

I korthet:

- Pluginet läser bara de vyer som karttjänsten publicerar: planer som kommunen valt att göra offentliga.
- Allt som kommer ur databasen skrivs som text (aldrig som HTML). Det finns inget `dangerouslySetInnerHTML` i pluginet.
- Länkar till handlingar blir bara klickbara om de börjar med `http://` eller `https://`, och öppnas med
  `rel="noopener noreferrer"`.
- Pluginet lagrar inget i webbläsaren och skickar inga uppgifter någon annanstans än till adresserna `infoUrl` och `wfsUrl`
  som du själv anger.
- Pluginet innehåller inga lösenord eller nycklar.
- På GitHub körs automatisk kodanalys (CodeQL för JavaScript) och OpenSSF Scorecard, och Dependabot håller de fastlåsta
  versionerna av GitHub Actions uppdaterade. De ersätter inte en oberoende granskning.

Kontrollera själv, innan du publicerar, att listan över offentliga planstatusar (`PUBLIC_STATUSES` i
rita-detaljplan-origomap) är den du vill.

## Rapportera en säkerhetsbrist

Beskriv inte säkerhetsbrister i ett öppet ärende. Använd i stället GitHubs
[privata rapportering](https://github.com/ritaplan/rita-detaljplan-hajk/security/advisories/new) (fliken *Security* →
*Report a vulnerability*). Då syns rapporten bara för dig och underhållaren. Skriv gärna:

- vad du gjorde och i vilken version av repot (commit) och av Hajk,
- vad som hände och vad du hade väntat dig,
- om du har ett exempel som visar felet (ta bort uppgifter du inte får dela).

**Vad du kan vänta dig:** repot underhålls av en enskild person på fritiden. Målet är att bekräfta rapporten inom
**14 dagar** och att ha en rättning eller en plan inom 60 dagar för det som är allvarligt.

## Vad som räknas

Som säkerhetsbrist räknas till exempel att text ur databasen kan tolkas som HTML eller kod i fönstret, att en länk kan leda
till något annat än en webbadress, eller att pluginet skickar uppgifter till en adress du inte angett. Att Hajk, GeoServer
eller något beroende har en sårbarhet räknas inte hit: rapportera det till respektive projekt och uppdatera versionen.

## Stödda versioner

Bara den senaste versionen på `main` får rättningar.
