
export type Language = 'zh' | 'en';
export type Orientation = 'landscape' | 'portrait';

export interface FinisherData {
  id: string;
  name: string;
  bibNumber: string;
  raceName: string;
  category: string; 
  finishTime: string; // HH:MM:SS
  netTime: string;
  genderRank: string;
  overallRank: string;
  date: string;
  inspirationalQuote?: string;
  badgeImageUrl?: string;
  logoUrl?: string; 
  themeImageUrl?: string; 
  runnerImageUrl?: string;
  signatureUrl?: string;
  styleJson?: string;
}

export interface VolunteerData {
  id: string;
  name: string;
  raceName: string;
  role: string; // e.g., "Medical Volunteer", "Course Marshal"
  serviceHours: string;
  date: string;
  certificateNumber: string;
  logoUrl?: string;
  signatureUrl?: string;
  badgeImageUrl?: string;
  themeImageUrl?: string;
  runnerImageUrl?: string;
  styleJson?: string;
}

export type CertificateType = 'finisher' | 'volunteer';

export interface CertificateStyle {
  type: CertificateType;
  template: 'classic' | 'modern' | 'minimal' | 'energetic' | 'pku';
  primaryColor: string;
  secondaryColor: string;
  backgroundImage?: string;
  language: Language;
  orientation: Orientation;
}

export type AppView = 'home' | 'login' | 'dashboard' | 'editor' | 'preview' | 'search_result' | 'batch_import' | 'volunteer_dashboard' | 'volunteer_editor';
