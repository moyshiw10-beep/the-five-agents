# Reuven Team Architecture

## Overview
ראובן הוא מנכ"ל צוות יצירת התוכן — ה-orchestrator שמקבל את כל הבקשות מהמשתמש ומנתב אותן לסוכן המתאים. הצוות כולל שלושה סוכנים (יעל, יובל, חן) ושלושה סקילים (gpt-image-gen, obsidian-bases, obsidian-markdown, obsidian-vault-workflow). הממשק מוגדר ב-`CLAUDE.md` בשורש הפרויקט. שני Workflow מרכזיים: תוכן מהאינטרנט (חן → יעל → יובל), ומאמר עם תמונות (יעל → יובל → ראובן משלב).

## Open Questions
- האם יתווספו סוכנים נוספים בעתיד? (שם הפרויקט "the five agents" מרמז על כך)
- ראובן עצמו לא מוגדר כסוכן ב-`.claude/agents/` — הוא פועל כ-`CLAUDE.md` ישירות על claude-sonnet-4-6

## Session Log

### 2026-06-24 — Initial project scan and vault creation [shipped]
- **What was done:** סרקנו את כל קבצי הפרויקט ויצרנו את הוולט. זיהינו את ארכיטקטורת ראובן כ-orchestrator ב-CLAUDE.md עם שלושה סוכנים תחתיו.
- **Decisions:** ראובן מנותב דרך CLAUDE.md ולא כסוכן — כי הוא הממשק הראשי ולא סוכן-ילד.
- **Notes / Caveats:** שם הפרויקט "the five agents" אך רק 3 סוכנים מוגדרים כרגע (יעל, יובל, חן). ראובן + ? עלולים להתווסף.
- **Related:** [[agent-definitions]], [[skills-setup]]
