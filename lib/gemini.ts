
// Helper to retrieve Gemini API Key from localStorage or environment
export const getGeminiKey = (): string | null => {
    // 1. Priority: Vercel/Environment Variables (Global for all students)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
        return import.meta.env.VITE_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env && (process.env.API_KEY || (process.env as any).VITE_API_KEY)) {
        return process.env.API_KEY || (process.env as any).VITE_API_KEY;
    }

    // 2. Fallback: localStorage (Local override for owner testing)
    if (typeof window !== 'undefined') {
        const localKey = localStorage.getItem('gemini_api_key');
        if (localKey) return localKey;
    }

    return null;
};

export const saveGeminiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
};
