
# ADR-0001 — Utiliser `libpg_query` comme parseur SQL/PLpgSQL

**Date** : 2025-08-09
**Status** : Accepted

## Contexte
  Le formatter doit être fiable sur **PostgreSQL** (SQL + **PL/pgSQL**). Les règles de style (indentation, casse, wraps) doivent s’appuyer sur une **structure syntaxique robuste** (AST), pas sur des regex fragiles. On veut aussi un linter qui comprenne les fonctions, `DECLARE`, `EXCEPTION`, etc.

## Décision
  Adopter **`libpg_query`** (parseur PostgreSQL officiel compilé en WebAssembly via le paquet npm) comme **source d’AST** unique pour :
  1) Valider le code (parse strict)  
  2) Alimenter le pretty-printer (AST → texte)  
  3) Supporter le linter (diagnostics structurés)

- **Portée**  
  - Toutes les fonctionnalités de formatage et de lint s’appuient sur l’AST `libpg_query`.  
  - Les traitements regex ne sont tolérés que pour des opérations **trivia** (ex. espace après virgule **à l’intérieur d’un token déjà identifié**), jamais pour reconnaître la grammaire.

- **Alternatives étudiées**  
  1) **Tree-sitter (SQL/PLpgSQL)** : rapide, incrémental, mais dialecte PG parfois incomplet et maintenance des grammaires à suivre.  
  2) **Parsers JS (ex. `pgsql-ast-parser`)** : simples en Node, mais couverture PL/pgSQL et coins obscurs de PG plus limités.  
  3) **Regex / heuristiques** : rapides à démarrer, **pas fiables** dès qu’on sort des cas simples (dollar-quotes, JSONB, sous-requêtes, CTE imbriquées).

- **Arguments clés**  
  - Fidélité **maximale** au dialecte PostgreSQL (même parseur que Postgres).  
  - **PL/pgSQL compris** (fonctions, blocs, `IF/LOOP/EXCEPTION`, etc.).  
  - Base solide pour un linter structurel (noms de params, `DECLARE`, CTE, etc.).  
  - Évite l’accumulation de cas particuliers regex.

## Conséquences
  - **Positif** : robustesse, moins de régressions, idempotence plus simple à garantir.  
  - **Négatif** : parse **strict** (pas d’error-recovery) → on ne formate pas le SQL invalide ; il faut gérer le fallback “no-op” proprement.  
  - **Perf** : WASM ok pour l’usage courant ; pour gros fichiers → préférer un **Language Server (LSP)** et le **range formatting**.

- **Risques & mitigations**  
  - *Risque* : changements de version Postgres → ajustements d’AST.  
    - *Mitigation* : tests goldens + parse/reparse en CI ; verrouillage de version.  
  - *Risque* : coût d’implémentation du pretty-printer AST.  
    - *Mitigation* : itérer par nœuds (SelectStmt → From/Join → Where → PL/pgSQL blocks).  
  - *Risque* : parse strict qui bloque sur code partiel.  
    - *Mitigation* : format-on-type via LSP limité au **range** (sélection) et messages clairs.

- **Plan d’implémentation**  
  1) Intégrer `libpg_query` (WASM) et exposer une API `parseAsync`.  
  2) Écrire un **printer modulaire** par nœud (SelectStmt, ResTarget, RangeVar, JoinExpr, A_Expr…).  
  3) Ajouter tests **goldens** (+ idempotence + reparse) en CI.  
  4) Étendre progressivement : JOIN/ON, WHERE wraps, blocs PL/pgSQL, etc.  
  5) Migrer en **LSP** pour perfs et diagnostics live.

- **Décisions connexes**  
  - Les règles de style (leading commas, seuils multilignes, casse des mots-clés) sont **configurables** et testées par goldens.
  - Le linter consomme le même AST.

