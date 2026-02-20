
export const getGeminiKey = (): string | null => {
    const env = (import.meta as any).env || {};
    const processEnv = (typeof process !== 'undefined' ? process.env : {}) as any;

    const envKey = env.VITE_API_KEY || processEnv.VITE_API_KEY || processEnv.API_KEY || processEnv.GEMINI_API_KEY;
    if (envKey && envKey !== 'undefined' && envKey !== '') return envKey;

    if (typeof window !== 'undefined') {
        return localStorage.getItem('gemini_api_key') || localStorage.getItem('GEMINI_API_KEY');
    }
    return null;
};

export const saveGeminiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('GEMINI_API_KEY', key);
};
