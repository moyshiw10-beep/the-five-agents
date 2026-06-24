# gpt-image-gen — סקיל יצירת תמונות עם OpenAI

סקיל זה הוא מעטפת לקריאת OpenAI Images API ליצירת תמונות.

## מודל

**`gpt-image-2`** — המודל היחיד שיש להשתמש בו. אל תשנה אותו.
gpt-image-2 הוא מודל אמיתי של OpenAI שיצא ב-21 באפריל 2026.
אם יש שגיאה — הבעיה היא ב-API key או בפרמטרים, לא בשם המודל.

## דרישות

- משתנה סביבה: `OPENAI_API_KEY` (נטען מקובץ `.env`)
- `curl` מותקן
- `jq` מותקן (או python3 כ-fallback)

## שימוש

החלף את `<PROMPT>` בפרומפט הרצוי ואת `<OUTPUT_PATH>` בנתיב היעד (ללא סיומת .png).

### שיטה ראשית — jq

```bash
source .env
curl -s -X POST "https://api.openai.com/v1/images/generations" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"gpt-image-2\",
    \"prompt\": \"<PROMPT>\",
    \"size\": \"1024x1024\",
    \"quality\": \"medium\",
    \"output_format\": \"png\"
  }" \
  | jq -r '.data[0].b64_json' \
  | base64 --decode > "<OUTPUT_PATH>.png"
```

### Fallback — python3 (אם jq לא מותקן)

```bash
source .env
curl -s -X POST "https://api.openai.com/v1/images/generations" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"gpt-image-2\",
    \"prompt\": \"<PROMPT>\",
    \"size\": \"1024x1024\",
    \"quality\": \"medium\",
    \"output_format\": \"png\"
  }" \
  | python3 -c "
import sys, json, base64
data = json.load(sys.stdin)
img = base64.b64decode(data['data'][0]['b64_json'])
open('<OUTPUT_PATH>.png', 'wb').write(img)
"
```

## אימות

לאחר הקריאה, אמת שהקובץ נוצר ולא ריק:

```bash
[ -s "<OUTPUT_PATH>.png" ] && echo "SUCCESS: image created" || echo "FAILED: file missing or empty"
```

## שגיאות נפוצות

| שגיאה | סיבה | פתרון |
|-------|------|--------|
| `401 Unauthorized` | API key חסר או שגוי | בדוק `OPENAI_API_KEY` ב-`.env` |
| `400 Bad Request` | פרמטר שגוי | בדוק את ה-prompt ופרמטרי ה-request |
| קובץ ריק / 0 bytes | decode נכשל | נסה את ה-python fallback |

## פרמטרים

| פרמטר | ערך | הערה |
|--------|-----|------|
| model | `gpt-image-2` | קבוע — לא לשנות |
| size | `1024x1024` | ברירת מחדל |
| quality | `medium` | אפשרויות: low / medium / high |
| output_format | `png` | קבוע |
