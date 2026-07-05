# Vault Initialization

## Overview
הוולט ב-`vault/` נוצר בסשן הראשון כזיכרון ארוך-טווח של הפרויקט. מבנה התיקיות: `Meeting Notes/` (ארכיטקטורה וקוד), `Brand Guidelines/` (סגנון ויזואל), `Publishing Log/` (פרסומים), `Content Briefs/` (ברייפים עריכתיים). כל תיקייה כוללת `_index.md` ורשימת קבצי נושא אחד-אחד. הסקיל `obsidian-vault-workflow` מופעל בכל תחילת סשן לפי הוראה ב-CLAUDE.md.

## Open Questions
- none

## Session Log

### 2026-06-24 — Create vault from scratch [shipped]
- **What was done:** סרקנו כל קבצי הפרויקט, קראנו את כל הגדרות הסוכנים והסקילים, יצרנו 4 תיקיות vault עם `_index.md` לכל אחת, ו-6 קבצי נושא המתעדים את כל מרכיבי הפרויקט. הוספנו הוראת חובה ב-CLAUDE.md להפעיל את הסקיל בכל סשן.
- **Decisions:** hooks ב-settings.json לא יכולים להפעיל סקילים — הפתרון הוא הוראה מפורשת ב-CLAUDE.md. זה מבטיח שראובן יפעיל את הסקיל כי כך נאמר לו.
- **Notes / Caveats:** `vault/Content Briefs/` ריקה כרגע — ברייפים יתווספו עם פרויקטי תוכן עתידיים.
- **Related:** [[reuven-team-architecture]], [[agent-definitions]], [[skills-setup]], [[yael-style-guide]], [[cmr-article]]
