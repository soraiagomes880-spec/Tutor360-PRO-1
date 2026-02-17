
// Helper to retrieve Gemini API Key from localStorage or environment
export const getGeminiKey = (): string | null => {
    if (typeof window !== 'undefined') {
        const localKey = localStorage.getItem('gemini_api_key');
        if (localKey) return localKey;
    }

    // Fallback to process.env if available (for local dev with .env files)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }

    // Fallback for Vite env vars if strict process.env is not polyfilled
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
        return import.meta.env.VITE_API_KEY;
    }

    return null;
};

export const saveGeminiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
};
