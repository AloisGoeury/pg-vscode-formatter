---

kanban-plugin: list

---

## 🎯 Backlog

- [ ] Étudier libpg_query et AST (lecture + mini-exemples) ⏳ 0.5j
- [ ] ADR-0001 — Choix libpg_query (rédaction) ⏳ 0.25j
- [ ] Installer Obsidian Git + config du vault `docs/` ⏳ 0.25j
- [ ] CI GitHub Actions avec tests goldens ⏳ 0.5j
- [ ] ADR-0002 — Stratégie de formatage SELECT (leading comma) ⏳ 0.5j


## 🚀 Phase 1 — Base formatter

- [ ] Parser et re-formatter un SELECT simple ⏳ 1j
- [ ] Implémenter seuil >4 colonnes → multilignes ⏳ 1j
- [ ] Implémenter indentation 4 + virgule en tête ⏳ 0.5j
- [ ] Gérer FROM + WHERE basiques ⏳ 1j
- [ ] Goldens tests pour SELECT / FROM / WHERE ⏳ 0.5j


## 🛠 Phase 2 — Features avancées

- [ ] Support JOINS + ON multilignes ⏳ 1j
- [ ] Support CTE (WITH) ⏳ 1j
- [ ] Support fonctions PL/pgSQL simples (DECLARE, BEGIN, END) ⏳ 1.5j
- [ ] Linter : préfixe `p*` pour params ⏳ 0.5j
- [ ] Linter : préfixe `v*` pour variables DECLARE ⏳ 0.5j
- [ ] Linter : warning CTE `source` ⏳ 0.25j
- [ ] Config utilisateur (JSON) pour règles ⏳ 1j


## ⚡ Phase 3 — Optimisation & LSP

- [ ] Implémentation LSP pour perfs + format-on-type ⏳ 2j
- [ ] Formatage sur plage sélectionnée (range formatting) ⏳ 0.5j
- [ ] Diagnostics en temps réel (lint) ⏳ 1j
- [ ] Optimisation AST printer pour gros fichiers ⏳ 1j
- [ ] ADR-0003 — Passage complet en LSP ⏳ 0.25j


## 📚 Documentation

- [ ] STYLE.md — règles de formatage détaillées ⏳ 0.5j
- [ ] TESTS.md — comment écrire un golden ⏳ 0.25j
- [ ] LINTER_RULES.md — liste des règles et exemples ⏳ 0.5j
- [ ] ARCHITECTURE.md — parse → AST → printer → output ⏳ 0.5j
- [ ] Exemple d’usage (README) ⏳ 0.25j




%% kanban:settings
```
{"kanban-plugin":"list"}
```
%%