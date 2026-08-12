# إعداد الأمان قبل النشر على Vercel

لا تضع أي سر داخل Git أو `.env.example`. أضف القيم التالية من **Project Settings → Environment Variables** في Vercel، لكل من Preview وProduction:

- `JWT_SECRET`
- `CSRF_SECRET`
- `DB_ENCRYPTION_KEY`
- `PROJECT_ACCESS_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

لإنشاء كل قيمة سرية، شغّل محلياً ثم انسخ الناتج إلى Vercel:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

استخدم قيمة مختلفة لكل متغير. `PROJECT_ACCESS_SECRET` هو رمز الدخول الذي ترسله يدوياً لمن تسمح له بعرض التقارير؛ لا يظهر أبداً في ملفات الموقع أو استجابات API. رمز التقرير المؤقت ينتهي بعد 20 دقيقة ولا يُحفظ في المتصفح.

بعد إضافة المتغيرات، أعد النشر. سيرفض التطبيق الإقلاع في بيئة الإنتاج إذا نقص سر أو كان أقصر من 32 حرفاً.
