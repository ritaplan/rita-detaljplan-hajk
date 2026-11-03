# Rita Detaljplan – Hajk-plugin

**Visa kommunens detaljplaner i Hajk, direkt ur plandatabasen.** Ett klick på en plan öppnar ett fönster med planens
uppgifter, plankartan och planbeskrivningen och alla bestämmelser i området med motiv. Det här är ett plugin för
[Hajk](https://github.com/hajkmap/Hajk) (4.x) som vilken kommun som helst kan använda.

Det är samma panel som i Origo-lösningen [rita-detaljplan-origomap](https://github.com/ritaplan/rita-detaljplan-origomap),
omskriven som ett Hajk-plugin (React och Material UI). Planerna ritas i QGIS-pluginet
[Rita Detaljplan](https://github.com/ritaplan/rita-detaljplan) och checkas in i PostGIS.

## Vad du får

| | |
|---|---|
| **Plankartan i Hajk** | Planerna visas som ett vanligt WMS-lager i Hajk, ritat av GeoServer i Boverkets färger och mönster. |
| **Informationsfönster vid klick** | Status i klartext, handlingar (plankarta och planbeskrivning som knappar), syfte, datum och genomförandetid. Bestämmelserna i området med motiv, där de som gäller exakt där man klickade är markerade. |
| **Markering i kartan** | Området man klickade i ramas in. När man pekar på en bestämmelse markeras dess yta. |
| **Alla bestämmelser i planen** | En knapp hämtar bestämmelserna i alla områden (WFS). |
| **Hajks eget utseende** | Fönstret följer Hajks tema (provat i mörkt läge) och fungerar på dator och telefon. |
| **Bara det som är offentligt** | Pluginet läser samma skrivskyddade vyer som Origo-lösningen. Du bestämmer vilka planstatusar som visas. |

## Så fungerar det

```
Rita Detaljplan ──checka in──▶ PostGIS ──vyer (schemat "publicering")──▶ GeoServer ──WMS / WFS──▶ Hajk + pluginet Detaljplaner
```

Pluginet har ingen egen serverdel. Databasvyerna och GeoServer sätter du upp med
[rita-detaljplan-origomap](https://github.com/ritaplan/rita-detaljplan-origomap) (steg 1–6 i dess
[Kom igång](https://github.com/ritaplan/rita-detaljplan-origomap/blob/main/docs/kom-igang.md)). Hajk läser sedan
lagret `planmosaik_karta` som ett vanligt WMS-lager, och pluginet frågar GeoServer om uppgifterna vid klick.

## Det här behöver du

- Hajk 4.x (provat med 4.3.0), byggd från källkod. Hajks plugin kompileras in i klienten, så det går inte att lägga till i
  en färdigbyggd Hajk.
- Node.js 22 eller senare (det kräver Hajk själv) för att bygga om klienten.
- GeoServer med planerna uppsatta enligt rita-detaljplan-origomap.

## Snabbstart

```sh
git clone https://github.com/ritaplan/rita-detaljplan-hajk.git
cd rita-detaljplan-hajk
node installera.mjs /sökväg/till/din/hajk          # mappen som innehåller apps/
```

Skriptet kopierar pluginet till Hajks klient och lägger `Detaljplaner` i listan över verktyg. Därefter lägger du
detaljplanelagret och verktyget i din karta och bygger om klienten. Steg för steg: **[docs/installera.md](docs/installera.md)**.

## Dokumentation

| Dokument | Innehåll |
|---|---|
| [docs/installera.md](docs/installera.md) | Installera pluginet, lägg in lagret och verktyget, bygg om. Uppgradera och ta bort. |
| [docs/konfiguration.md](docs/konfiguration.md) | Alla inställningar, hur klicket tolkas och hur du tillåter anrop mellan Hajk och GeoServer. |
| [docs/felsokning.md](docs/felsokning.md) | Vanliga problem och hur de rättas. |
| [SECURITY.md](SECURITY.md) | Hur säkerheten är tänkt och hur du rapporterar en säkerhetsbrist. |

## Innehållet i repot

| Mapp eller fil | Vad det är |
|---|---|
| `plugin/Detaljplaner/` | Själva pluginet (React och Material UI). Kopieras till `apps/client/src/plugins/`. |
| `installera.mjs` | Lägger in pluginet i en Hajk-mapp, eller tar bort det (`--ta-bort`). |
| `exempel/` | Exempel på lager och verktyg att lägga i Hajks kartfiler. |

## Provat med

Hajk 4.3.0 (klienten i utvecklingsläge, backend på Node 26), GeoServer 3.0.2 och Rita Detaljplans demoplaner. Provat: klick
på plan och på tom mark, fönstret på dator och mobil, handlingslänkar, alla bestämmelser (WFS), markering i kartan och
anrop genom Hajks egen proxy. Kartan gick i Web Mercator (EPSG:3857).

**Inte provat:** Hajks administrationsgränssnitt (pluginet saknar där en egen inställningssida, se nedan), kartor i andra
koordinatsystem än Web Mercator, Hajk med inloggning (Active Directory) och andra Hajk-versioner än 4.3.0.

## Begränsningar

- Verktyget ställs in genom att redigera kartans JSON-fil, inte i Hajks administrationsgränssnitt. En egen inställningssida
  i Admin är inte gjord.
- Vektorrutor (variant B i Origo-lösningen) stöds inte av Hajk 4.3. Använd lagret som bildlager (WMS).
- Lagret i Hajk ska vara markerat som inte frågbart i Hajks egen infoklick, annars visas två rutor. Pluginet sköter klicken.
- Texterna i fönstret är på svenska.

## Licens

GNU General Public License, version 2 eller senare, som Rita Detaljplan. Se [LICENSE](LICENSE). Hajk har egen licens (MIT).
Pluginet blir en del av Hajks klient när det byggs in, och den sammansatta klienten följer då GPL när den delas vidare.
