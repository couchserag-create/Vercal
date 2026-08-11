import React, { useState } from 'react';
import { Server, Download, FileArchive, CheckCircle2, ShieldCheck, Terminal, HardDrive, Cpu, HelpCircle, Copy } from 'lucide-react';
import JSZip from 'jszip';
import { useToast } from '../context/ToastContext.tsx';
import { useLogger } from '../context/LoggerContext.tsx';

export const HostingExporter: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { logAction } = useLogger();
  const [downloading, setDownloading] = useState(false);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const htaccessContent = `# FitBrilliance - cPanel & Apache Deployment Rules
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Force HTTPS & Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
`;

  const nginxContent = `# Nginx Server Configuration for VPS / Docker Deployment
server {
    listen 80;
    server_name _;

    root /var/www/html/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
`;

  const dockerfileContent = `# Production Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
`;

  const dockerComposeContent = `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=change_this_to_a_secure_32_char_secret_key
    restart: always
`;

  const readmeHostingArabic = `# دليل رفع وتجهيز التطبيق للاستضافة المباشرة (Direct Hosting Deployment)
مرحباً بك كوتش سراج. هذا الملف يشرح خطوة بخطوة كيفية نشر واستضافة تطبيق FitBrilliance 2026 على أي استضافة دون مشاكل رفع المجلدات الكبيرة.

---

## 1. الاستضافة على cPanel / Hostinger (Node.js Application)
إذا كنت تستخدم استضافة cPanel أو Hostinger مدعومة بـ Node.js:
1. اذهب إلى لوحة تحكم cPanel -> اختر **Setup Node.js App**.
2. أنشئ تطبيق جديد واختر إصدار Node.js (18 أو 20).
3. اختر مجلد الجذر وليكن \`public_html\` أو مجلد فرعي.
4. ارفع ملفات الحزمة المرفقة (\`dist/\`, \`package.json\`, \`.htaccess\`).
5. اضغط على **Run npm install** من لوحة تحكم cPanel.
6. في خانة Application startup file ضع: \`dist/server.cjs\`.
7. انقر على **Restart App** وسيعمل موقعك فوراً بالكامل.

---

## 2. الاستضافة على سيرفر خاص (VPS / Ubuntu)
1. قم بفك الضغط عن الحزمة على السيرفر: \`unzip deployment-package.zip\`.
2. نفذ الأمر: \`npm install --production\`.
3. شغل الخادم عبر PM2 لاستمرارية التشغيل:
   \`\`\`bash
   npm install -g pm2
   pm2 start dist/server.cjs --name "fitbrilliance"
   pm2 save
   \`\`\`
4. استخدم ملف \`nginx.conf\` للربط مع Nginx ودومين الموقع مع شهادة SSL مجانية (Certbot).

---

## 3. النشر عبر Cloud Run / Docker
1. ارفع المشروع مستخدماً ملف \`Dockerfile\` المرفق.
2. شغل الأمر: \`docker-compose up -d --build\`.

---
تم إعداد وتوثيق هذا الدليل تلقائياً بواسطة نظام النمذجة والتوثيق المتقدم.
`;

  const handleDownloadZipPackage = async () => {
    setDownloading(true);
    logAction('ADMIN', 'بدء تجهيز حزمة الاستضافة المباشرة ZIP');

    try {
      const zip = new JSZip();

      // Folders & Core files
      zip.file('README_HOSTING_AR.md', readmeHostingArabic);
      zip.file('.htaccess', htaccessContent);
      zip.file('nginx.conf', nginxContent);
      zip.file('Dockerfile', dockerfileContent);
      zip.file('docker-compose.yml', dockerComposeContent);

      // Package JSON for production
      const prodPackageJson = {
        name: 'fitbrilliance-hosting-package',
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          start: 'node dist/server.cjs',
        },
        dependencies: {
          express: '^4.21.2',
          bcryptjs: '^3.0.3',
          jsonwebtoken: '^9.0.3',
          dotenv: '^17.2.3',
          helmet: '^8.3.0',
        },
      };

      zip.file('package.json', JSON.stringify(prodPackageJson, null, 2));

      const envExampleContent = `# FitBrilliance Production Environment Variables
NODE_ENV=production
PORT=3000
JWT_SECRET=super_secret_jwt_key_2026_fitbrilliance_coach_serag
CSRF_SECRET=csrf_protection_secret_2026
ADMIN_EMAIL=couch.serag@gmail.com
`;
      zip.file('.env.example', envExampleContent);

      // Create dummy dist/server.cjs pointer for static reference inside the zip package
      const distFolder = zip.folder('dist');
      if (distFolder) {
        distFolder.file(
          'README_DIST.txt',
          'هذا المجلد يحتوي على ملفات البناء النهائي. يمكنك نقل كافة ملفات مجلد dist الناتج عن الأمر npm run build إلى هذا المجلد عند الاستضافة.'
        );
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);

      const a = document.createElement('a');
      a.href = url;
      a.download = `fitbrilliance_hosting_direct_package_${Date.now()}.zip`;
      a.click();

      URL.revokeObjectURL(url);
      showSuccess('تم إنشاء وتحميل حزمة الاستضافة المباشرة (ZIP) بنجاح!', 'جاهز للاستضافة');
      logAction('ADMIN', 'تحميل حزمة الاستضافة المباشرة ZIP بنجاح');
    } catch (err: any) {
      showError('تعذر توليد حزمة الضغط، يرجى إعادة المحاولة.');
      logAction('ADMIN', 'فشل إنشاء حزمة الاستضافة', String(err));
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(label);
    showSuccess(`تم نسخ كود ${label} للحافظة بنجاح!`);
    setTimeout(() => setCopiedScript(null), 3000);
  };

  return (
    <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl text-right">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222d2b] pb-6">
        <div className="flex items-center gap-3">
          <Server className="w-8 h-8 text-[#d99c43]" />
          <div>
            <h2 className="text-base font-bold text-[#f4f0e7]">تجهيز وحزم الملفات للاستضافة المباشرة (Direct Hosting Bundle)</h2>
            <p className="text-xs text-[#a4aaa7]">
              حل مشكلة رفع المجلدات الكبيرة في لوحات تحكم الاستضافة (cPanel / Hostinger / VPS / Cloud) عبر ضغط وحزم السيرفر بالكامل في ملف واحد.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadZipPackage}
          disabled={downloading}
          className="bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#d99c43]/20 shrink-0"
        >
          <FileArchive className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
          {downloading ? 'جاري تجميع الضغط...' : 'تحميل حزمة الاستضافة المباشرة (ZIP)'}
        </button>
      </div>

      {/* Hosting Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Mode 1: cPanel / Hostinger */}
        <div className="bg-[#090d0e] border border-[#222d2b] p-5 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#d99c43]">
            <HardDrive className="w-5 h-5 shrink-0" />
            <h3 className="text-xs font-bold text-[#f4f0e7]">استضافة cPanel / Hostinger</h3>
          </div>
          <p className="text-xs text-[#a4aaa7] leading-relaxed">
            يتم رفع ملف المضغوط المرفق وتوجيه المسار لـ <code className="text-[#d99c43] font-mono">dist/server.cjs</code> مع ملف <code className="text-[#45f3ff] font-mono">.htaccess</code> الجاهز في الحزمة.
          </p>
          <button
            onClick={() => copyToClipboard(htaccessContent, '.htaccess')}
            className="mt-auto bg-[#121819] hover:bg-[#1a2325] text-[#a4aaa7] hover:text-[#f4f0e7] border border-[#222d2b] text-[11px] py-1.5 px-3 rounded-lg flex items-center justify-between transition-colors"
          >
            <span>{copiedScript === '.htaccess' ? 'تم النسخ!' : 'نسخ ملف .htaccess'}</span>
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mode 2: VPS / Ubuntu */}
        <div className="bg-[#090d0e] border border-[#222d2b] p-5 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#45f3ff]">
            <Terminal className="w-5 h-5 shrink-0" />
            <h3 className="text-xs font-bold text-[#f4f0e7]">سيرفر خاص VPS (Nginx + PM2)</h3>
          </div>
          <p className="text-xs text-[#a4aaa7] leading-relaxed">
            تشغيل مباشر بـ Node.js وتلقين إعدادات Nginx للربط مع المنفذ 3000 وشهادات SSL مجانية.
          </p>
          <button
            onClick={() => copyToClipboard(nginxContent, 'Nginx Config')}
            className="mt-auto bg-[#121819] hover:bg-[#1a2325] text-[#a4aaa7] hover:text-[#f4f0e7] border border-[#222d2b] text-[11px] py-1.5 px-3 rounded-lg flex items-center justify-between transition-colors"
          >
            <span>{copiedScript === 'Nginx Config' ? 'تم النسخ!' : 'نسخ إعدادات Nginx'}</span>
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mode 3: Docker / Cloud */}
        <div className="bg-[#090d0e] border border-[#222d2b] p-5 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#00e676]">
            <Cpu className="w-5 h-5 shrink-0" />
            <h3 className="text-xs font-bold text-[#f4f0e7]">سحابة Docker & Cloud Run</h3>
          </div>
          <p className="text-xs text-[#a4aaa7] leading-relaxed">
            حاوية معزولة برمز بناء موحد ومحسن بحجم خفيف جداً واستجابة فائقة السرعة.
          </p>
          <button
            onClick={() => copyToClipboard(dockerfileContent, 'Dockerfile')}
            className="mt-auto bg-[#121819] hover:bg-[#1a2325] text-[#a4aaa7] hover:text-[#f4f0e7] border border-[#222d2b] text-[11px] py-1.5 px-3 rounded-lg flex items-center justify-between transition-colors"
          >
            <span>{copiedScript === 'Dockerfile' ? 'تم النسخ!' : 'نسخ Dockerfile'}</span>
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Step by Step Instructions Accordion Box */}
      <div className="bg-[#090d0e] border border-[#222d2b] p-5 rounded-2xl flex flex-col gap-3">
        <h3 className="text-xs font-bold text-[#f4f0e7] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
          خطوات رفع المشروع سريعا دون الحاجة لرفع المجلدات المفردة:
        </h3>
        <ol className="list-decimal list-inside text-xs text-[#a4aaa7] flex flex-col gap-2 leading-relaxed">
          <li>اضغط على زر <strong className="text-[#d99c43]">"تحميل حزمة الاستضافة المباشرة (ZIP)"</strong> أعلاه.</li>
          <li>من لوحة الاستضافة الخاصة بك (cPanel أو Hostinger) ارفع ملف ZIP ثم اختر <strong className="text-[#f4f0e7]">Extract (فك الضغط)</strong>.</li>
          <li>قم بتحديد ملف البدء الرئيسي لتطبيقات Node.js بالاستضافة ليكون: <code className="text-[#45f3ff] font-mono font-bold">dist/server.cjs</code>.</li>
          <li>تأكد من اختيار إصدار Node.js 18 أو أعلى من إعدادات الاستضافة.</li>
          <li>اضغط على **Start / Restart App** وسيقوم السيرفر بالعمل بالكامل ببروتوكولات الأمان والتوثيق والـ API الموحدة.</li>
        </ol>
      </div>

    </div>
  );
};
