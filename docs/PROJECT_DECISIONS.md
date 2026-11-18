# Projektbeslut

## Målgrupp och syfte

Jobbkompassen är ett portfolioarbete för att visa grundläggande webbutveckling, problemlösning och ansvarsfull produktutformning. Den är främst avsedd för den som bygger projektet och personer som vill förstå hur det fungerar.

## Avgränsningar

- Jobbannonserna är fiktiva och matchningen är en demonstration.
- Profiluppgifter skickas till den lokala servern för beräkning men sparas inte.
- Ingen AI-tjänst, databas, användarinloggning eller extern jobbkälla ingår.
- Poängen ska förklaras öppet och får inte användas för verkliga rekryteringsbeslut.

## Tekniska val

- Node.js inbyggda HTTP-server håller backend liten och utan extra serverramverk.
- TypeScript används för servern, matchningslogiken och datatyperna.
- Vanlig HTML, CSS och JavaScript gör gränssnittet lätt att läsa utan frontendramverk.
- Matchningsreglerna är deterministiska och visar kategoriers poängbidrag så att resultatet går att följa.
- Node.js inbyggda testverktyg täcker matchningsregler utan extra testpaket.

## Princip för framtida ändringar

Bygg vidare stegvis. Om AI övervägs ska den vara valfri och inte ersätta den regelbaserade poängberäkningen. Beskriv bara funktioner som faktiskt är implementerade.
