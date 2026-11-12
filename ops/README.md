# תפעול: דיווחים מהסטודנטים

הזרימה:

1. סטודנט לוחץ "⚑ דיווח" על שאלה, כותב מה לא תקין, ואם הוא רוצה מוסיף שם, מייל ושנה.
2. הדיווח נשלח לשירות קטן ב־Google Apps Script (`relay.gs`), ששומר אותו כקובץ בריפו **פרטי** `EliorCh/ops-inbox` (`reports/<id>.json`). כך הפרטים של הסטודנטים לא חשופים לאף אחד.
3. בעמוד התפעול (`ops.html`) רואים את כל הדיווחים לפי שלבים: חדשים, בטיפול, אצל Claude, סגורים. משם אפשר:
   - **לערוך את השאלה** ישירות. השמירה מעדכנת את קובץ השאלות של האתר ב־GitHub, והדיווח נסגר עם הערה וקישור לשינוי.
   - **להעביר ל־Claude**, עם בקשה חופשית. משימה מתוזמנת של Claude עוברת על הדיווחים האלה, בודקת, מתקנת אם צריך, ומשאירה הערה בכרטיס.
   - לסמן "טופל" או "לא דורש שינוי", לפתוח מחדש, ולהשיב לסטודנט במייל (אם השאיר).

## הקמה (פעם אחת)

### 1. ריפו פרטי לדיווחים
ב־GitHub: New repository → שם `ops-inbox` → **Private** → לסמן "Add a README" → Create.

### 2. טוקן לשירות השליחה
GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token:
- Repository access: **Only select repositories** → `ops-inbox` בלבד
- Permissions → Contents: **Read and write**
- תוקף: הכי ארוך שאפשר (ולחדש כשפג)

### 3. שירות השליחה (Apps Script)
1. נכנסים ל־https://script.google.com → New project.
2. מוחקים את מה שיש ומדביקים את כל התוכן של `relay.gs`. שומרים.
3. Project Settings (גלגל שיניים) → Script properties → Add:
   - `GITHUB_TOKEN` = הטוקן משלב 2
   - `NOTIFY_EMAIL` = eliorchen@gmail.com (רשות: מייל על כל דיווח חדש)
4. Deploy → New deployment → סוג **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, מאשרים הרשאות, ומעתיקים את ה־Web app URL (נגמר ב־`/exec`).
5. את הכתובת הזו שמים במשתנה `RELAY` בראש `site-feedback.js` (או שולחים ל־Claude שיעשה את זה).

### 4. טוקן לעמוד התפעול
טוקן Fine-grained נוסף, רק לדפדפן שלך:
- Repositories: `ops-inbox`, `comque`, `mlque`, `osque`, `computque`
- Contents: **Read and write**

מדביקים אותו בעמוד התפעול. הוא נשמר רק בדפדפן הזה.

## איפה נמצאות השאלות
| אתר | קובץ |
|---|---|
| comque | `questions.js` (`window.QUESTIONS`) |
| mlque | `questions.js`, ושאלות פתוחות ב־`open_questions.js` |
| osque | `bank.js` (`window.BANK.questions`) |
| computque | `bank.js` (`window.BANK.questions`) |

הקבצים שמורים כ־JSON תקין אחרי ההשמה, כדי שהעורך יוכל לקרוא ולכתוב אותם בלי לשבור כלום.

## מבנה דיווח
```json
{ "id": "20261112-101500-ab12", "created": "…", "status": "new | working | claude | fixed | rejected",
  "site": "comque", "qid": "17", "qlabel": "…", "kind": "…", "url": "…",
  "problem": "…", "question": "…", "solution": "…",
  "reporter": { "name": "", "email": "", "year": "" },
  "notes": [ { "by": "me | claude", "at": "…", "text": "…", "commit": "…" } ] }
```
