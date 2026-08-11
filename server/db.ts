import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, Project, AuditLog, CoachInfo, BackupMetadata } from '../src/types.ts';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const BACKUP_DIR = path.join(DB_DIR, 'backups');

const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'fitbrilliance_db_ssl_enc_key_32bytes!';
const ALGORITHM = 'aes-256-cbc';

// Helper to encrypt strings at rest
export function encryptData(text: string): string {
  try {
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (e) {
    return text;
  }
}

// Helper to decrypt strings
export function decryptData(text: string): string {
  try {
    if (!text.includes(':')) return text;
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = parts.join(':');
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return text;
  }
}

interface StoredUser extends Omit<User, 'twoFactorSecret'> {
  passwordHash: string;
  twoFactorSecret?: string;
  tempTwoFactorSecret?: string;
}

interface DBData {
  users: StoredUser[];
  projects: Project[];
  auditLogs: AuditLog[];
  coachInfo: CoachInfo;
  backups: BackupMetadata[];
}

// Initial Seeds
const DEFAULT_PROJECTS: Project[] = [
  {
    id: "PRJ-101",
    name: "مشروع النمذجة التشغيلية والتحول الاستراتيجي",
    company: "FitBrilliance",
    clientName: "أ.د / رئيس مجلس الإدارة",
    domain: "fitbrilliance.com",
    analysisPageCount: 14,
    analysisRefCode: "ANL-101-9842-ONLY",
    analysisFilePath: "work/docs/analysis.pdf",
    planFilePath: "work/docs/plan.pdf",
    analysisContent: `## 📊 كتاب التحليل الشامل المستقل\nتشخيص المسار الميداني وتقييم وضع الهوية والمنافسة في السوق قبل بدء مرحلة التنفيذ.\n- تحليل الفجوة التشغيلية ونقاط القوة الحصرية.\n- صياغة المنظومة المعتمدة وتجاوز محاولات الهواة.`,
    planVideoUrl: "",
    mediaAttachments: [
      {
        id: "media_v1",
        type: "video",
        title: "الفيديو التعريفي بخطة التحول الاستراتيجي 90 يوم",
        url: "/media/intro-plan.mp4",
        caption: "ملف فيديو تشغيلي يشرح تفاصيل الخطة الميدانية (يمكن رفع الفيديوهات المباشرة وتغيير الرابط من لوحة التحكم)."
      },
      {
        id: "media_img1",
        type: "image",
        title: "مخطط الهيكل التشغيلي ورسم خريطة الطريق",
        url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
        caption: "تخطيط استراتيجي لمراحل النمو والتحويل المالي المعتمد."
      }
    ],
    planContent: `## 📜 الخطة الترويجية 90 يوم\nالجدول الميداني اليومي للنشر، نوع الفيديو، استراتيجية التفاعل المباشر، والجدولة دقيقة بدقيقة.\n- الشهر 1: مرحلة التأسيس وتثبيت الهوية.\n- الشهر 2: نمو الأداء والتحويل المتقدم.\n- الشهر 3: الختام واستدامة العوائد.`,
    month1: {
      videosCount: 8, videoCost: 2500, totalVideoCost: 20000,
      adsCount: 4, adCost: 3000, totalAdCost: 12000,
      platforms: "فيس بوك · انستغرام · تيك توك", platformCost: 5000,
      totalMonth1: 37000,
      notes: "بناء الوعي الكامل بالعلامة التجارية وتثبيت الهوية الرقمية.\nتجهيز الأصول الرقمية وضمان جهوزية المنصات للاستقبال."
    },
    month2: {
      videosCount: 6, videoCost: 2500, totalVideoCost: 15000,
      adsCount: 4, adCost: 3500, totalAdCost: 14000,
      targetPercent: 75,
      totalMonth2: 29000,
      notes: "الانتقال إلى الاستهداف المتقدم والوصول للجمهور المهتم فعلياً."
    },
    month3: {
      videosCount: 4, videoCost: 2500, totalVideoCost: 10000,
      adsCount: 3, adCost: 3000, totalAdCost: 9000,
      changePercent: 85,
      totalMonth3: 19000,
      notes: "ختام الحملة الترويجية الشاملة وحصر الأرقام التفصيلية."
    },
    financialSummary: {
      totalCost: 85000,
      expectedROI: "320% خلال 6 أشهر"
    },
    content: `قسم 01: التشخيص وتفكيك المعتقد الإخفاقي\nالأفكار متاحة للجميع، لكن الريادة تكمن في عبقرية الهندسة والتنفيذ.\n\nقسم 02: الهندسة الثلاثية للتحول 90 يوم\n01. إعادة رسم الرؤية الذاتية ككوتش ورائد أعمال.\n02. صياغة المنظومة المعتمدة.\n03. تفعيل الحماية والاستحقاق الكامل.`,
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_COACH_INFO: CoachInfo = {
  introText: "وُلدت فضولياً، وكبرت متمرداً على كل ما لا يُعقل. منذ الطفولة كان السؤال هو سلاحي... رحلة لم تسر في خط مستقيم، لكنها بنت شيئاً واحداً لا يُزعزع: القدرة على الرؤية حيث لا يرى الآخرون، وصناعة ما يعجز عنه الآخرون.",
  statYears: "+15",
  statClients: "+200",
  statProjects: "+50",
  timeline: [
    { era: "البداية — الطفولة والشرارة", heading: "الفضول الذي لم يُطفئه أحد", desc: "منذ الصغر كان الفضول أكبر من الكتب المدرسية. سؤال خلف سؤال، وإدراك مبكر بأن العالم يمكن رؤيته بعيون مختلفة تماماً." },
    { era: "مرحلة البناء — الأسس والتكوين", heading: "بناء الأسس — علم ورياضة وتجربة", desc: "الدراسة الأكاديمية والتجربة الميدانية في آنٍ معاً. الجسد والعقل كمنظومة واحدة." },
    { era: "مرحلة الميدان — الخبرة الحقيقية", heading: "السوق الحقيقي — أول اختبار للنظرية", desc: "الانتقال من الأكاديميا إلى الميدان الحقيقي مع كل ما يحمله من صدمات وإعادة حساب." },
    { era: "مرحلة الريادة — الانفصال والتأسيس", heading: "الانفصال عن القطيع — ريادة بلا وصاية", desc: "قرار الانفصال عن المألوف وبناء منظومة مستقلة بمعايير وقيم وأسلوب خاص: FitBrilliance ToDo4U." }
  ],
  experiences: [
    { icon: "🧠", title: "هندسة التحول الذاتي", desc: "سنوات من العمل مع أفراد يبحثون عن مخرج من التشتت إلى الوضوح.", tag: "تطوير الذات · Coaching" },
    { icon: "📊", title: "الاستراتيجية المؤسسية", desc: "تحليل عميق وهندسة استراتيجية للشركات والمشاريع الناشئة وصولاً للتوسع.", tag: "Business Strategy · ROI" },
    { icon: "🏆", title: "الأداء الرياضي الاحترافي", desc: "خلفية عميقة في علوم الجسد والأداء والتغذية والتأهيل النفسي للرياضيين.", tag: "Sports Performance" }
  ],
  updatedAt: new Date().toISOString()
};

let dbCache: DBData | null = null;

function ensureDirs() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function loadDB(): DBData {
  if (dbCache) return dbCache;
  ensureDirs();

  if (!fs.existsSync(DB_FILE)) {
    const defaultPasswordHash = bcrypt.hashSync("0020303", 10);
    const initialData: DBData = {
      users: [
        {
          id: "usr_admin_1",
          name: "Coach Serag",
          email: "couch.serag@gmail.com",
          role: "admin",
          company: "FitBrilliance",
          passwordHash: defaultPasswordHash,
          is2FAEnabled: false,
          createdAt: new Date().toISOString()
        }
      ],
      projects: DEFAULT_PROJECTS,
      auditLogs: [
        {
          id: "log_1",
          timestamp: new Date().toLocaleString('ar-EG'),
          eventType: "⚡ بدء نظام الحماية والتشغيل",
          name: "النظام الإداري",
          email: "couch.serag@gmail.com",
          company: "FitBrilliance",
          role: "المدير النظامي",
          details: "تم إقلاع خادم Node.js المشفر بنجاح مع تفعيل الهيكل والأمن."
        }
      ],
      coachInfo: DEFAULT_COACH_INFO,
      backups: []
    };
    saveDB(initialData);
    dbCache = initialData;
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    dbCache = JSON.parse(raw);
    return dbCache!;
  } catch (err) {
    console.error("Failed to parse db.json, creating clean DB", err);
    const defaultPasswordHash = bcrypt.hashSync("0020303", 10);
    const fallback: DBData = {
      users: [{ id: "usr_admin_1", name: "Coach Serag", email: "couch.serag@gmail.com", role: "admin", company: "FitBrilliance", passwordHash: defaultPasswordHash, is2FAEnabled: false, createdAt: new Date().toISOString() }],
      projects: DEFAULT_PROJECTS,
      auditLogs: [],
      coachInfo: DEFAULT_COACH_INFO,
      backups: []
    };
    saveDB(fallback);
    dbCache = fallback;
    return fallback;
  }
}

export function saveDB(data: DBData) {
  ensureDirs();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  dbCache = data;
}

// User DAO Operations
export function getUsers(): StoredUser[] {
  return loadDB().users;
}

export function getUserByEmail(email: string): StoredUser | undefined {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): StoredUser | undefined {
  return getUsers().find(u => u.id === id);
}

export function saveUser(user: StoredUser) {
  const db = loadDB();
  const idx = db.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (idx >= 0) {
    db.users[idx] = { ...db.users[idx], ...user };
  } else {
    db.users.push(user);
  }
  saveDB(db);
}

// Project DAO Operations
export function getProjects(): Project[] {
  return loadDB().projects;
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find(p => p.id.toLowerCase() === id.toLowerCase());
}

export function saveProject(project: Project): Project {
  const db = loadDB();
  const idx = db.projects.findIndex(p => p.id.toLowerCase() === project.id.toLowerCase());
  const updatedProject = { ...project, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    db.projects[idx] = updatedProject;
  } else {
    db.projects.unshift(updatedProject);
  }
  saveDB(db);
  return updatedProject;
}

export function deleteProject(id: string): boolean {
  const db = loadDB();
  const initialLen = db.projects.length;
  db.projects = db.projects.filter(p => p.id.toLowerCase() !== id.toLowerCase());
  saveDB(db);
  return db.projects.length < initialLen;
}

// Audit Log DAO Operations
export function getAuditLogs(): AuditLog[] {
  return loadDB().auditLogs;
}

export function addAuditLog(log: Omit<AuditLog, 'id'>): AuditLog {
  const db = loadDB();
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    timestamp: log.timestamp || new Date().toLocaleString('ar-EG'),
    eventType: log.eventType,
    name: log.name || 'زائر',
    email: log.email || '-',
    company: log.company || '-',
    role: log.role || '-',
    details: log.details || '',
    ip: log.ip
  };
  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 500) db.auditLogs = db.auditLogs.slice(0, 500);
  saveDB(db);
  return newLog;
}

// Coach Info DAO Operations
export function getCoachInfo(): CoachInfo {
  return loadDB().coachInfo;
}

export function saveCoachInfo(info: CoachInfo): CoachInfo {
  const db = loadDB();
  db.coachInfo = { ...info, updatedAt: new Date().toISOString() };
  saveDB(db);
  return db.coachInfo;
}

// Automated Periodic Database Backup Manager
export function createBackup(reason = 'manual'): BackupMetadata {
  ensureDirs();
  const db = loadDB();
  const backupId = `backup_${Date.now()}`;
  const filename = `${backupId}.json`;
  const filePath = path.join(BACKUP_DIR, filename);

  const backupData = {
    backupId,
    reason,
    timestamp: new Date().toISOString(),
    data: db
  };

  const encryptedContent = encryptData(JSON.stringify(backupData));
  fs.writeFileSync(filePath, encryptedContent, 'utf-8');

  const meta: BackupMetadata = {
    id: backupId,
    filename,
    timestamp: new Date().toISOString(),
    projectsCount: db.projects.length,
    auditLogsCount: db.auditLogs.length,
    usersCount: db.users.length,
    sizeBytes: Buffer.byteLength(encryptedContent)
  };

  db.backups.unshift(meta);
  if (db.backups.length > 20) {
    const oldest = db.backups.pop();
    if (oldest) {
      const oldPath = path.join(BACKUP_DIR, oldest.filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }
  saveDB(db);
  return meta;
}

export function getBackups(): BackupMetadata[] {
  return loadDB().backups;
}

export function restoreBackup(backupId: string): boolean {
  const db = loadDB();
  const meta = db.backups.find(b => b.id === backupId);
  if (!meta) return false;

  const filePath = path.join(BACKUP_DIR, meta.filename);
  if (!fs.existsSync(filePath)) return false;

  try {
    const encryptedContent = fs.readFileSync(filePath, 'utf-8');
    const decryptedJson = decryptData(encryptedContent);
    const parsed = JSON.parse(decryptedJson);
    if (parsed && parsed.data) {
      saveDB(parsed.data);
      return true;
    }
  } catch (err) {
    console.error("Backup restore failed", err);
  }
  return false;
}

// Schedule automated backups every 6 hours
setInterval(() => {
  try {
    createBackup('scheduled');
  } catch (e) {
    console.error('Scheduled backup error', e);
  }
}, 6 * 60 * 60 * 1000);
