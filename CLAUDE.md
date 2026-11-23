# CLAUDE.md - אתר Aidlin Design (studio_wabsite)

אתר הסטודיו של Aidlin Design (הדפסת תלת-ממד בחומר קרמי), מתפרסם ב-GitHub Pages.
כתובת האתר: https://amitaidlin.github.io/studio_wabsite/ | ריפו: AmitAidlin/studio_wabsite

## איך לעבוד איתי
- לדבר בעברית ולפנות בלשון נקבה (כמו ב-CLAUDE.md הגלובלי).
- אני מעלה לבד דרך GitHub Desktop. אחרי כל שינוי באתר להזכיר: Commit ואז Push. שום דבר לא חי עד שאני עושה Push.
- לא לעשות commit/push בלי שביקשתי.
- טקסט האתר באנגלית (הלקוחות והאתר באנגלית), מחירים ב-₪.

## מבנה התיקייה
- שורש הריפו = **האתר הבנוי** ש-GitHub Pages מציג: `index.html`, `assets/`, `products/`, `lovable-uploads/`, `.nojekyll`. לא לערוך ידנית, הקבצים נוצרים מחדש בכל בנייה.
- `site-source/` = קוד המקור (Vite + React + TypeScript + Tailwind + shadcn).
- `shop/` = ניהול החנות: `products.xlsx`, `photos/` (תיקיית התמונות היחידה), `product manage.md` (היסטוריית מכירות).
- `archive/` = קבצים ישנים לעיון בלבד.
- `.claude/skills/` = `product-manage` (פרסום מוצרים) ו-`sold-products` (מכירות ומלאי).

## פקודות (מתוך `site-source`)
Node נמצא ב-`C:\Program Files\nodejs` ולפעמים לא ב-PATH. להריץ קודם: `$env:Path = "C:\Program Files\nodejs;" + $env:Path`
- `npm run dev` - פיתוח מקומי (פורט 8080).
- `npm run build` - בנייה ל-`site-source/dist` בלבד.
- `npm run update-shop` - קורא את האקסל, מכין תמונות, בונה ומעתיק את הבנייה לשורש הריפו. זו הדרך לפרסם שינויים (גם שינויי קוד), לא `build` לבד.
- בדיקת טיפוסים: `node node_modules\typescript\bin\tsc -p tsconfig.app.json --noEmit`

## החנות
- `shop/products.xlsx`, גיליון ראשון. עמודות: A שם קובץ תמונה, B שם, C תיאור, D מחיר ₪, E יחיד מסוגו (yes/no), F להציג באתר (yes/no), G כמות מלאי, H נמכרו, I אזל מהמלאי באתר (yes/no).
- **עמודה G (מלאי) היא רק שלי.** לעולם לא לנחש או לשנות אותה.
- **תיאורים:** כשעמודה C ריקה, אני כותבת את התיאור (באנגלית, באותו טון של הקיימים), בלי לשאול.
- לסמן באתר "אזל זמנית" (עמודה I = yes) רק אחרי שאישרתי.
- התאמת תמונה למוצר לפי השם בעמודה A (עם סיומת או בלי). קובץ `<שם> (edited).jpg` ליד המקור משמש אוטומטית.
- לא לכתוב לאקסל כשהוא פתוח (קיים `shop/~$products.xlsx`): לבקש ממני לשמור ולסגור.
- אין תשלום באתר: העגלה שולחת הזמנה במייל ל-Aidlin427@gmail.com (נושא "New order"). הנתונים נשמרים בדפדפן של הלקוח בלבד.

## פרויקטים ותערוכות
- `Projects & Exhibitions/projects.xlsx` (תמונות אופציונליות ב-`Projects & Exhibitions/photos`). עמודות: A סוג (Exhibition/Project/Award), B כותרת, C שנה, D מיקום, E תיאור, F תמונה, G קישור, H **מאושר להעלאה (yes/no)**.
- מתפרסמות רק שורות עם H = yes. לפני פרסום להציג לי את הרשימה ולקבל אישור. לא לאשר שורות בעצמי.
- קובץ קורות החיים נמצא באותה תיקייה אבל מכיל פרטים אישיים: לא לפרסם אותו ולא להעתיק ממנו פרטים אישיים (ת.ז., טלפון, כתובת). הוא ב-`.gitignore`.
- `npm run update-shop` מעדכן גם את הדף הזה.

## הערות טכניות
- האתר סטטי. ניווט עם `HashRouter` (כתובות כמו `#/products`), נתיבי קבצים יחסיים (`base: "./"`). אין להחזיר `BrowserRouter` או נתיבים שמתחילים ב-`/`.
- הקטלוג נוצר ל-`site-source/src/data/products.json` מהאקסל. לא לערוך אותו ידנית.
- דפי Admin/Auth/Supabase קיימים בקוד אבל לא בשימוש כרגע (אין שרת).
- התוכנית: מעבר עתידי לשרת אמיתי וחיבור Claude אליו לקריאת מכירות אוטומטית.
- שינוי נראה לעין: לוודא בצילום מסך (Edge headless או preview) לפני שמדווחים שזה עובד.
