export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'client';
  company?: string;
  is2FAEnabled: boolean;
  createdAt: string;
}

export interface MonthBudget {
  videosCount: number;
  videoCost: number;
  totalVideoCost: number;
  adsCount: number;
  adCost: number;
  totalAdCost: number;
  platforms?: string;
  platformCost?: number;
  targetPercent?: number;
  changePercent?: number;
  totalMonth1?: number;
  totalMonth2?: number;
  totalMonth3?: number;
  notes?: string;
}

export interface FinancialSummary {
  totalCost: number;
  expectedROI: string;
}

export interface MediaAttachment {
  id: string;
  type: 'video' | 'image';
  title: string;
  url: string;
  caption?: string;
}

export interface Project {
  id: string;
  name: string;
  company: string;
  clientName: string;
  domain?: string;
  analysisPageCount: number;
  analysisRefCode: string;
  analysisFilePath?: string;
  planFilePath?: string;
  analysisContent: string;
  planVideoUrl?: string;
  mediaAttachments?: MediaAttachment[];
  planContent: string;
  month1: MonthBudget;
  month2: MonthBudget;
  month3: MonthBudget;
  financialSummary: FinancialSummary;
  content: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  name: string;
  email: string;
  company: string;
  role?: string;
  details: string;
  ip?: string;
}

export interface TimelineNode {
  era: string;
  heading: string;
  desc: string;
}

export interface ExperienceCard {
  icon: string;
  title: string;
  desc: string;
  tag: string;
}

export interface CoachInfo {
  introText: string;
  statYears: string;
  statClients: string;
  statProjects: string;
  timeline: TimelineNode[];
  experiences: ExperienceCard[];
  updatedAt?: string;
}

export interface BackupMetadata {
  id: string;
  filename: string;
  timestamp: string;
  projectsCount: number;
  auditLogsCount: number;
  usersCount: number;
  sizeBytes: number;
}

export interface ApiEndpointParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ApiEndpointDoc {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  summary: string;
  description: string;
  protected: boolean;
  requires2FA?: boolean;
  rateLimit: string;
  params?: ApiEndpointParam[];
  requestBodyExample?: object;
  responseExample: object;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

export interface ClientLog {
  id: string;
  timestamp: string;
  category: 'NAVIGATION' | 'AUTH' | 'VALIDATION' | 'SEARCH' | 'ADMIN' | 'SYSTEM';
  action: string;
  details?: string;
  userEmail?: string;
}

