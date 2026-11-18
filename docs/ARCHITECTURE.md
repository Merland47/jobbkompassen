# Arkitektur: Jobbkompassen

## Dataflöde

1. Användaren skriver färdigheter, intressen och önskat arbetssätt i webbläsaren.
2. `public/app.js` delar upp listorna och skickar JSON till `POST /api/matches` på samma lokala server.
3. `src/server.ts` kontrollerar att datan har rätt form och storlek.
4. `src/matching/matcher.ts` jämför profilen med de fiktiva annonserna i `src/data/jobs.ts`.
5. Webbläsaren visar totalpoängen, delpoängen per kategori, skälen och kompetensluckorna. Profilen sparas inte.

## Poängmodell

| Del | Vikt |
| --- | ---: |
| Baskrav | 60 % |
| Meriterande färdigheter | 15 % |
| Intressen | 15 % |
| Önskat arbetssätt | 10 % |

Varje del ger sin fulla vikt om alla värden i annonsens kategori matchar, och en proportionell del annars. Om annonsen saknar värden i en kategori bidrar kategorin med noll poäng. Slutpoängen avrundas till ett heltal mellan 0 och 100.

Saknade baskrav visas separat som kompetensluckor. Varje lucka får ett allmänt förslag om en liten övning eller ett miniprojekt.

## Säkerhetsval i prototypen

- Servern lyssnar bara på `127.0.0.1` som standard.
- Profilens JSON är begränsad till 16 KB; varje lista kan innehålla högst 20 värden, och varje värde får vara högst 60 tecken.
- Resultat läggs in i sidan som text, inte som rå HTML.
- Formuläret har kopplade fälthjälper, synlig tangentbordsfokus och tydliga statusmeddelanden.
- HTTP-svar använder innehållstypsskydd och sidan får en enkel Content Security Policy.
- Ingen profil lagras och ingen API-nyckel används.

## AI senare

AI kan läggas till som ett valfritt lager efter den regelbaserade matchningen. Låt den befintliga motorn bestämma poäng och matchande data. En språkmodell kan då endast hjälpa till att formulera en sammanfattning av dessa resultat. Läs en eventuell nyckel från `AI_PROVIDER_API_KEY` vid serverstart och låt `.env` vara ignorerad av Git. Om tjänsten inte är konfigurerad eller tillgänglig ska appen visa de regelbaserade resultaten som vanligt.
