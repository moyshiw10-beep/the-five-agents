# Agent Definitions

## Overview
שלושה סוכנים מוגדרים ב-`.claude/agents/`: יעל (כותבת תוכן), יובל (מעצב תמונות), חן (חוקרת רשת). כל סוכן מוגדר בקובץ `.md` עם frontmatter (name, description, tools) וגוף המסביר את ה-flow שלו. הסוכנים מדווחים לראובן ולא מפעילים אחד את השני ישירות.

## Open Questions
- none

## Session Log

### 2026-06-24 — Document all three agents [shipped]
- **What was done:** קראנו את הגדרות יעל, יובל וחן. תיעדנו כלים, flow, ומגבלות כל אחד.
- **Decisions:** כל סוכן מוגבל לכלים ספציפיים — יעל רק Read/Write/Edit/Glob/Grep; יובל מוסיף Bash (לקריאת API); חן מוסיפה WebSearch/WebFetch.
- **Notes / Caveats:** חן שומרת זיכרון ב-`chen/Memory/searches.md` — כל חיפוש מתועד. יובל שומר prompt לצד כל תמונה ב-`yuval/outputs/`.
- **Related:** [[reuven-team-architecture]], [[skills-setup]]
