# geokuk.cz

Web [geokuk.cz](https://geokuk.cz) a náhrada za `version.php` ze starého hostingu.

| Složka | Co v ní je | Kde běží |
|---|---|---|
| `docs/` | statický web: úvodní stránka, přesměrování starých stránek (`popis.html`, `spust.html`, `changelog.html`…), stránka 404 | GitHub Pages (větev `main`, složka `/docs`) |
| `worker/` | `version.js` pro `geokuk.cz/version.php`, konfigurace `wrangler.toml` a ověřovací skript `over.sh` | Cloudflare Workers |

Program GeoKuk ve verzi 6 na geokuk.cz nezávisí, novou verzi hledá na GitHub Releases.

## version.php

GeoKuk 3.x až 5.2.0 volá při každém startu
`http://geokuk.cz/version.php?verze=…&msgnad=N` a z odpovědi čte:

- `<h1>[[6.4.3]]</h1>` – poslední verzi; když se liší od jeho vlastní, ukáže při každém startu dialog Spuštění nové verze,
- `<h1>==číslo==</h1>` – zprávy uživatelům s číslem větším než `msgnad`; když přijde aspoň jedna, otevře okno Zprávy uživatelům.

Proto to nejde jako statický soubor na GitHub Pages: posílal by pořád všechny zprávy a okno by se otevíralo při každém startu. Worker dělá totéž co dřív PHP.

Pravidla:

- **Verze je poslední stabilní verze 6** (`VERZE` ve `version.js`). Dialog nové verze ve starých verzích nic nestahuje, jen otevře prohlížeč: Zobrazit web vede na geokuk.cz, Stáhnout nejnovější verzi na `marvertin/geokuk/releases/latest`, tedy vydání 5.2.0, které odkazuje na verzi 6. Číslo nemusí sledovat každé vydání, stačí, že je novější než 5.2.0. Zpráva 7 navíc jednou vysvětlí přechod.
- **Nová zpráva = nové vyšší číslo** na konci pole `ZPRAVY`. Starou zprávu neměňte ani nemažte, kdo ji četl, už ji znovu neuvidí.
- **`version.php` musí odpovídat i přes `http://` bez přesměrování.** Java ve starých verzích přesměrování z http na https nenásleduje a ohlásí „poslední verze je null“.
- **Výpadek je horší než stará odpověď:** bez odpovědi ukážou staré verze při každém startu nabídku verze „null“.

Ověření (adresa Workeru nebo geokuk.cz):

```sh
worker/over.sh https://geokuk-version.<účet>.workers.dev
worker/over.sh http://geokuk.cz
```

## Přechod ze starého hostingu

Pořadí je důležité: `version.php` nesmí ani na chvíli přestat odpovídat.

1. **GitHub Pages** (repozitář > Settings > Pages): zdroj větev `main`, složka `/docs`. Náhled je na
   `https://geokuk-community.github.io/geokuk.cz/`.
2. **Ověření domény pro organizaci** (organizace > Settings > Pages > Add a domain > `geokuk.cz`):
   GitHub vypíše TXT záznam `_github-pages-challenge-geokuk-community`, ten přidat v Cloudflare do DNS
   a dokončit ověření. Bez toho by si doménu mohl na GitHub Pages zabrat někdo jiný.
3. **Worker** v Cloudflare (Workers & Pages > Create > Worker): jméno `geokuk-version`, obsah `worker/version.js`
   (nebo `npx wrangler deploy` ve složce `worker`). Zatím bez trasy, jen na adrese `*.workers.dev`.
   Ověřit `worker/over.sh https://geokuk-version.<účet>.workers.dev`.
4. **Přepnutí** (vše najednou):
   - do repozitáře přidat `docs/CNAME` s obsahem `geokuk.cz` (tím se nastaví vlastní doména Pages),
   - v Cloudflare DNS nahradit záznamy `geokuk.cz` a `www`:

     | Typ | Název | Obsah | Proxy |
     |---|---|---|---|
     | A | `geokuk.cz` | `185.199.108.153` | zapnutá |
     | A | `geokuk.cz` | `185.199.109.153` | zapnutá |
     | A | `geokuk.cz` | `185.199.110.153` | zapnutá |
     | A | `geokuk.cz` | `185.199.111.153` | zapnutá |
     | AAAA | `geokuk.cz` | `2606:50c0:8000::153` … `2606:50c0:8003::153` (4 záznamy) | zapnutá |
     | CNAME | `www` | `geokuk-community.github.io` | zapnutá |

   - Worker `geokuk-version` > Settings > Domains & Routes: přidat trasu `geokuk.cz/version.php*`
     (vzor bez `http://` platí pro http i https),
   - SSL/TLS > Overview: režim **Full** (ne Full strict: certifikát GitHubu za proxy Cloudflare často nejde vydat),
   - SSL/TLS > Edge Certificates: **Always Use HTTPS vypnout** a místo něj pravidlo
     Rules > Redirect Rules: když `http.request.uri.path ne "/version.php"` a `not ssl`,
     přesměrovat 301 na `https://` + stejná cesta a dotaz (dynamic: `concat("https://", http.host, http.request.uri)`),
   - na GitHubu nechat **Enforce HTTPS vypnuté** (HTTPS zajišťuje Cloudflare).
5. **Ověření:** `worker/over.sh http://geokuk.cz`, v prohlížeči `https://geokuk.cz`, `http://geokuk.cz` (má přesměrovat
   na https) a `https://geokuk.cz/popis.html` (přesměrování na wiki). Spustit GeoKuk 5.2.0 a zkontrolovat,
   že nabídne verzi 6.4.3 a ukáže zprávu 7, po Přečteno už jen nabídku verze.
6. Starý hosting zrušit až po několika dnech bez potíží.
