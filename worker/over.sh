#!/bin/sh
# Ověří version.php tak, jak ho volají GeoKuk 3.x až 5.2.0.
# Použití: worker/over.sh http://geokuk.cz
#          worker/over.sh https://geokuk-version.<účet>.workers.dev
set -u
ZAKLAD=${1:?zadej adresu, třeba http://geokuk.cz}
OCEKAVANA_VERZE=$(sed -n 's/^export const VERZE = "\(.*\)";$/\1/p' "$(dirname "$0")/version.js")
CHYB=0

zkus() { # popis, msgnad, očekávané zprávy (čísla oddělená mezerou, nebo prázdné)
  ODPOVED=$(curl -s -m 20 -A "Geokuk/5.2.0 (http://geokuk.cz/)" -w '\n%{http_code}' \
    "$ZAKLAD/version.php?verze=5.2.0&msgnad=$2" | tr -d '\r')
  KOD=$(printf '%s\n' "$ODPOVED" | tail -n 1)
  VERZE=$(printf '%s\n' "$ODPOVED" | sed -n 's#^<h1>\[\[\(.*\)\]\]</h1>$#\1#p')
  ZPRAVY=$(printf '%s\n' "$ODPOVED" | sed -n 's#^<h1>==\([0-9]*\)==</h1>$#\1#p' | tr '\n' ' ' | sed 's/ $//')
  if [ "$KOD" = 200 ] && [ "$VERZE" = "$OCEKAVANA_VERZE" ] && [ "$ZPRAVY" = "$3" ]; then
    echo "OK     $1: verze $VERZE, zprávy [$ZPRAVY]"
  else
    echo "CHYBA  $1: HTTP $KOD, verze '$VERZE' (čekáno '$OCEKAVANA_VERZE'), zprávy [$ZPRAVY], čekáno [$3]"
    CHYB=1
  fi
}

zkus "nová instalace (msgnad=0)" 0 "1 2 3 4 6 7"
zkus "přečtená zpráva 4"        4 "6 7"
zkus "přečtená zpráva 6"        6 "7"
zkus "vše přečteno (msgnad=7)"  7 ""

# Staré verze nenásledují přesměrování z http na https.
case "$ZAKLAD" in
  http://*)
    KOD=$(curl -s -m 20 -o /dev/null -w '%{http_code}' "$ZAKLAD/version.php?msgnad=7")
    if [ "$KOD" = 200 ]; then echo "OK     http bez přesměrování"; else echo "CHYBA  http vrací $KOD (přesměrování?)"; CHYB=1; fi
    ;;
esac

exit $CHYB
