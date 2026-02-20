export type AppTab = 'dashboard' | 'live' | 'pronunciation' | 'writing' | 'scan' | 'culture' | 'help';

export type Language = 'Português Brasil' | 'Italiano' | 'Francês' | 'Alemão' | 'Japonês' | 'Chinês' | 'Espanhol' | 'Inglês';

export interface LanguageOption {
  name: Language;
  code: string;
  flag: string;
  region: string;
}

export const LANGUAGES: LanguageOption[] = [
  { name: 'Português Brasil', code: 'pt-br', flag: '🇧🇷', region: 'Brasil' },
  { name: 'Inglês', code: 'en', flag: '🇺🇸', region: 'USA/UK' },
  { name: 'Espanhol', code: 'es', flag: '🇪🇸', region: 'Espanha/América Latina' },
  { name: 'Italiano', code: 'it', flag: '🇮🇹', region: 'Itália' },
  { name: 'Francês', code: 'fr', flag: '🇫🇷', region: 'França' },
  { name: 'Alemão', code: 'de', flag: '🇩🇪', region: 'Alemanha' },
  { name: 'Japonês', code: 'ja', flag: '🇯🇵', region: 'Japão' },
  { name: 'Chinês', code: 'zh', flag: '🇨🇳', region: 'China' },
];

export type AspectRatio = '16:9' | '9:16';

export interface VideoResult {
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
}

export interface GenerationStatus {
  step: 'idle' | 'processing' | 'downloading' | 'complete' | 'error';
  message: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
    process: any;
  }
}