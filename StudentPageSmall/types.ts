
export type StudyMode = 'voice' | 'writing' | 'visual' | 'culture';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'jp', name: 'Japanese', flag: '🇯🇵' },
  { code: 'cn', name: 'Chinese', flag: '🇨🇳' },
];

export interface Feedback {
  original: string;
  corrected: string;
  explanation: string;
  translation: string;
  suggestions?: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        text: string;
      }[];
    };
  };
}
