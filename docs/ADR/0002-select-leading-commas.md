
# ADR-0002: Vircules en tête dans SELECT
Date: 2025-08-09
Status: Accepted

## Contexte
On veut améliorer la lisibilité des SELECT avec beaucoup de colonnes.
Après 4 colonnes, on veut passer à un affichage vertical avec virgules en tête.

## Décision
- Plus de 4 colonnes → une par ligne
- Indentation de 4 espaces + 2 sur la première, 4 sur les suivantes
- Virgules en début de ligne
- Espace après chaque virgule

## Conséquences
- Code plus homogène
- Peu compatible avec `pg_format` par défaut
- Impact minimal sur la performance du formatter
