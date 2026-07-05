# Skills Setup

## Overview
ארבעה סקילים מותקנים ב-`.claude/skills/`: `gpt-image-gen` (יצירת תמונות דרך OpenAI gpt-image-2), `obsidian-bases` (יצירת קבצי .base לתצוגות ב-Obsidian), `obsidian-markdown` (כתיבת Obsidian Flavored Markdown), `obsidian-vault-workflow` (ניהול ה-vault כזיכרון ארוך-טווח). שלושת הסקילים האחרונים הותקנו מהריפו https://github.com/ZeremItay/the-5-agents-obsidian.

## Open Questions
- none

## Session Log

### 2026-06-24 — Install Obsidian skills from external repo [shipped]
- **What was done:** הורדנו 3 סקילים מ-github.com/ZeremItay/the-5-agents-obsidian והתקנו ב-`.claude/skills/`. `gpt-image-gen` היה קיים כבר מקודם.
- **Decisions:** כל סקיל נשמר בתיקייה משלו עם `SKILL.md` — תואם לפורמט הסטנדרטי של Claude Code skills.
- **Notes / Caveats:** obsidian-vault-workflow מפנה ל-`vault/` שלא היה קיים — יצרנו אותו בסשן זה.
- **Related:** [[reuven-team-architecture]]

### 2026-06-24 — Promote Obsidian skills to global [shipped]
- **What was done:** העתקנו את 3 סקילי ה-Obsidian (obsidian-bases, obsidian-markdown, obsidian-vault-workflow) מ-`.claude/skills/` הפרויקטי ל-`C:\Users\moysh\.claude\skills\` הגלובלי. הסקילים זמינים עכשיו בכל פרויקט.
- **Decisions:** הסקילים נשמרו גם בפרויקט וגם גלובלית — הגלובלי גובר בפרויקטים אחרים, הפרויקטי משמש כbackup ותיעוד מקומי.
- **Notes / Caveats:** תיקיית `~/.claude/skills/` לא הייתה קיימת — נוצרה אוטומטית ע"י Write.
- **Related:** [[reuven-team-architecture]], [[vault-initialization]]
