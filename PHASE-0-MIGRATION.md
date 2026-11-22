# 🏛️ Phase 0: Foundation & Migration Guide

Welcome to the new era of the Bandwar Archive. Phase 0 was all about re-architecting our data layer to support **Provenance, Verification, and Graph Connections**, without breaking a single UI component.

## 📊 What Changed?
1. **Schema v8:** We added `provenance`, `confidence`, `edges`, and `stewardship` structures. `infobox` now supports nested metadata.
2. **Data Layer:** `data.ts` now has dedicated loaders (`getEdges`, `getStewardshipLog`) and media resolvers.
3. **Validation:** `validate.ts` now strictly checks the `queue`, `edges`, and `stewardship` files. The `z.any()` loophole for contributors is closed.
4. **New Data Files:**
   - `data/edges.json`: Defines the relationships between articles.
   - `data/stewardship.json`: Logs *who* verified *what* and *when*.
   - `data/absences.json`: Memorializes what is missing from the archive.
5. **Master Config:** `master.json` now contains `provenanceTiers`, `sourceRegistry`, and field-level sources for village stats.

## 🏃‍♂️ How to Run the Migration
If you have existing articles that need their default `confidence: "unverified"` tags, run:
```bash
npx tsx scripts/backfill.ts