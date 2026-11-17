// Náhrada za geokuk.cz/version.php ze starého hostingu.
//
// Volají ho GeoKuk 3.x až 5.2.0 při každém startu:
//   http://geokuk.cz/version.php?verze=5.2.0&msgnad=N
// Odpověď obsahuje <h1>[[poslední verze]]</h1> a zprávy uživatelům
// <h1>==číslo==</h1> s číslem větším než msgnad (číslo naposledy přečtené
// zprávy). Program okno se zprávami otevře, kdykoli přijde aspoň jedna,
// proto se musí posílat jen nepřečtené (statický soubor by nestačil).
//
// Verze zůstává 5.2.0: tlačítko „Stáhnout nejnovější verzi“ v 5.x stahuje
// z marvertin/geokuk, kde je 5.2.0 poslední. Na verzi 6 upozorňuje zpráva 7.
//
// Odpověď musí jít i přes http bez přesměrování: Java ve starých verzích
// přesměrování z http na https nenásleduje.

export const VERZE = "5.2.0";

// Zprávy 1–6 jsou beze změny převzaté ze starého version.php
// (marvertin/geokuk, větev master, distrib/version.php). Zpráva 5 neexistuje.
export const ZPRAVY = [
  [1, `<h1>==1==</h1>
Milí, uživatelé.
<p>
Od verze 3.3.0 máme novinku spočívající v možnosti
zobrazovat uživatelům zprávy při spuštění geokuku.
Zprávy si pomocí tlačítek vlevo a vpravo můžete prohlížet
a přečtení potvrdit tlačítkem "Přečteno".
Přečtené zprávy se už nebudou zobrazovat.

<h2>Vrácení zpět funkce "lovím" a oddělení od cest</h2>
Funkce "lovím", která označovala waypointy zeleně je nyní v původní podobě
a je nezávisla na vytváření cest. Obě funcionality můžete dle libosti využívat
na různé účely, například zeleně si označit keše, které vás zajímají z
dlouhodobého hlediska a cesty použít pro konkrétní výlet.
`],
  [2, `<h1>==2==</h1>
<h2>Nová služba pro vyhledávání adres a jiných názvů zeměpisných míst (Ctrl+M)</h2>
Od verze 3.5 je použita nová služba Google. Popis služby je zde:
<a href="https://developers.google.com/maps/documentation/geocoding">https://developers.google.com/maps/documentation/geocoding</a>.
Základním rozdílem oproti dříve používané službě je limit v počtu provedených dotazů na 2500 / 24 hodin. Zdá se to jako dost,
ale vzhledem k tomu, že vyhledávání probíhá při každém stisku znaku v okně Ctrl+M, může být limit vyčerpán.
Pokud se to ukáže jako problé, budu počty hledání optimalizovat.
`],
  [3, `<h1>==3==</h1>
<h2>Přechod z GoogleCode na GitHub</h2>
Google zrušil svoji službu pro vývoj programů google code. Z toho důvodu
bylo nutné přejít na <a href="https://github.com/marvertin/geokuk/releases/latest">GitHub</a> od verze 3.6.0, kde také
budeš nacházet nejnovější verze programu. Změna se týká
<ul>
<li>úložiště zdrojových kódů Geokuku</li>
<li>systému pro zprávu požadavků a chyb</li>
<li>místo pro stažení Geokuku</li>
</ul>

<p>Jako hlavní stránka stále zůstává <a href="http://geokuk.cz">http://geokuk.cz</a>
<br>
Stránka je upravena a obsahuje všechny důležité odkazy.
`],
  [4, `<h1>==4==</h1>
<h2>Sloučení s vezí danstahr/Geokuk</h2>
Zjistil jsem, že Geokuk hodně vyvinul Dan Stahr na GitHubu v roce
2014 a 2015, za což
mu patří velký dík. Jeho verze se stala základem verze 4.0.0.
Je zde hodně změn a oprav, časem snad popíšu jaké jsou.
<p>
Ve verzi 4 na chvíli zmizela podpora geospy. Pokuím se ji tam v dohledné
době opět dostat.

`],
  [6, `<h1>==6==</h1>
<h2>Geokuk zobrazuje mapy celého světa</h2>
<p>Od verze 5.0.0 Geokuk zobrazuje mapy z celého světa.
Je umožněno používat nejrůznější mapové podklady.
Blíže na stánkách http://geokuk.cz.
<p>Byl také přepracován systém stahování mapových dlaždic, takže je rychlejší a spolehlivější
i při použití ne zrovna spolehlivých mapových podkladů.
`],
  [7, `<h1>==7==</h1>
<h2>GeoKuk pokračuje jako GeoKuk community – verze 6</h2>
<p>Vývoj Geokuku pokračuje v projektu GeoKuk community. Verze 6 přináší
mimo jiné offline mapy bez internetu, mapy ČÚZK, načítání keší z GeoGetu,
GSAKu i OpenSAKu, rychlejší práci s velkým množstvím keší a automatické
aktualizace. Pro Windows je k dispozici verze i s Javou, nic dalšího
není potřeba instalovat.
<p>Tato verze (5.x) se už dál vyvíjet nebude.
<p>Novou verzi stáhnete na <a href="https://geokuk.cz">geokuk.cz</a>.
Verze 6 se instaluje do vlastní složky a starou verzi nepřepíše.
Jak převzít data a nastavení, popisuje stránka
<a href="https://github.com/geokuk-community/geokuk/wiki/P%C5%99echod-ze-star%C5%A1%C3%AD-verze">Přechod ze starší verze</a>.
<p>Martin Veverka
`],
];

// Stejné chování jako PHP: chybějící nebo nečíselné msgnad = 0 (všechny zprávy).
export function cisloZpravy(hodnota) {
  const n = Number.parseInt(hodnota ?? "", 10);
  return Number.isFinite(n) ? n : 0;
}

export function odpoved(msgnad) {
  const zpravy = ZPRAVY.filter(([cislo]) => msgnad < cislo).map(([, text]) => text);
  return `<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
<h1>[[${VERZE}]]</h1>

<hr/>
${zpravy.join("\n")}
</body>
</html>
`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== "/version.php") {
      return fetch(request); // vše ostatní obslouží GitHub Pages
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const telo = odpoved(cisloZpravy(url.searchParams.get("msgnad")));
    return new Response(request.method === "HEAD" ? null : telo, {
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "no-store",
      },
    });
  },
};
