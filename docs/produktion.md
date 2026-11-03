# Köra Hajk med pluginet i produktion (Docker)

Det här beskriver hur ett produktionsbygge av Hajk med pluginet provkördes på en liten server (4 GB minne som delas med
annat). Det är ett exempel: följ i första hand Hajks egen dokumentation för drift, och använd det här för det som rör
pluginet.

## Så provades det

Hajk 4.3.0, byggd på en dator och körd i en Node-behållare på servern. Inget byggdes på servern, som saknade Node och hade för
lite ledigt minne för att bygga klient och Admin.

1. Hämta Hajk: `git clone --depth 1 --branch v4.3.0 https://github.com/hajkmap/Hajk.git`
2. Kör `node installera.mjs <sökväg till Hajk>` i det här repot. Det lägger pluginet i klienten och Admin, och i **både**
   `appConfig.json` och `appConfig.docker.json`. Hajks Dockerbygge byter ut den första mot den andra, så verktyget måste finnas
   i båda.
3. Installera och bygg, en del i taget (som Hajks `Dockerfile`):
   - `apps/backend`: `npm ci`, `npm run compile` (ger mappen `dist`).
   - `apps/client`: `npm ci`, kopiera `public/appConfig.docker.json` till `public/appConfig.json`, `npm run build`.
   - `apps/admin`: `npm ci`, kopiera `public/config.docker.json` till `public/config.json`, `npm run build`.

   Kör inte flera `npm install` samtidigt i samma Hajk-mapp: det kan ge trasiga `node_modules`.
4. Lägg ihop en körbar mapp (samma upplägg som Hajks Docker-avbildning):
   - innehållet i `apps/backend/dist` i mappen `app/`, tillsammans med `package.json` och `package-lock.json`,
   - `npm ci --omit=dev` i `app/` (ger `node_modules`),
   - `apps/backend/static` till `app/static/`, klientens `build` till `app/static/client/` och Admins `build` till
     `app/static/admin/`,
   - `apps/backend/App_Data` till en egen mapp `App_Data/`. Ta bort `http://localhost:3002` ur `layers.json`, som i Hajks
     Dockerfile,
   - `app/.env` från `apps/backend/.env.example`, med `NODE_ENV=production`, en egen slumpad `SESSION_SECRET`, och
     `PROXY_GEOSERVER` satt till GeoServers adress.
5. Lägg detaljplanelagret och verktyget i `App_Data` (eller gör det i Admin efteråt): se [installera.md](installera.md). Med
   Hajks proxy blir adresserna `/api/v2/proxy/geoserver/planmosaik/wms` och `/api/v2/proxy/geoserver/planmosaik/ows`. De är
   relativa och fungerar på vilken adress Hajk än nås.
6. Skicka mappen till servern och starta den, till exempel med den här `docker-compose.yml`
   ([`exempel/docker-compose.yml`](../exempel/docker-compose.yml)):

```yaml
name: hajk
services:
  hajk:
    image: node:24-slim
    container_name: hajk
    restart: unless-stopped
    working_dir: /usr/app
    command: ["node", "index.js"]
    environment:
      PORT: "3002"
    volumes:
      - ./app:/usr/app:ro
      - ./App_Data:/usr/app/App_Data
      - ./logs:/usr/app/logs
    ports:
      - "127.0.0.1:8095:3002"
    mem_limit: 384m
    networks: [planmosaik_default]   # nätverket som GeoServer-behållaren ligger i
networks:
  planmosaik_default:
    external: true
```

Skapa mapparna `app/App_Data` och `app/logs` (tomma) på servern innan du startar. De är monteringspunkter: Docker kan inte
skapa en undermapp i en skrivskyddad mapp, och startar annars inte behållaren.

Med GeoServer i samma Dockernätverk sätter du `PROXY_GEOSERVER=http://<geoservers behållarnamn>:8080/geoserver` i
`app/.env`.

## Provat

Klick på plan, alla bestämmelser (WFS), markering, Hajks proxy mot GeoServer och Hajk Admin (`/admin/`, där verktyget
finns i listan) mot ett produktionsbygge på servern, nått via SSH-tunnel. Behållaren använde cirka 170 MB minne.

## Säkerhet

- **Hajk Admin har ingen inloggning som standard.** Lämna det inte öppet på nätet. Aktivera inloggning enligt Hajks
  dokumentation (`AD_*` och `RESTRICT_ADMIN_ACCESS_TO_AD_GROUPS` i `.env`), eller lägg inloggning i webbservern framför, eller nå
  Admin bara via SSH-tunnel.
- Låt Hajk lyssna bara på `127.0.0.1` och publicera genom din webbserver med HTTPS.
- Hajks proxy vidarebefordrar till de adresser som står i `.env` (`PROXY_GEOSERVER`, `PROXY_SCB`). Töm de du inte använder.
- Byt `SESSION_SECRET` till ett eget slumpat värde.
