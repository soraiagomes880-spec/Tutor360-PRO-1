
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

// Always use process.env.API_KEY directly as per guidelines.
export const getGeminiResponse = async (prompt: string, model: string = 'gemini-3-flash-preview') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return response;
};

export const getExploreInfo = async (topic: string, language: string, location?: { latitude: number; longitude: number }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `I am a student learning ${language}. Help me explore this language's culture or find places related to my query: "${topic}". 
    If I'm asking about places, prioritize real-world locations, landmarks, or restaurants that would help me practice ${language} or immerse in the culture.
    Provide cultural trends, news, or interesting facts. Speak in English but include relevant local phrases.`,
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      toolConfig: location ? {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      } : undefined
    },
  });
  return response;
};

export const translateText = async (text: string, targetLanguage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following cultural information into ${targetLanguage}. Maintain the original tone and preserve any specific names of places or local phrases: \n\n ${text}`,
  });
  return response.text;
};

export const analyzeWriting = async (text: string, language: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this writing in ${language}: "${text}". Provide a JSON response with: corrected (improved version), explanation (why changes were made), translation (English), and suggestions (list of 3 related vocab words).`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          corrected: { type: Type.STRING },
          explanation: { type: Type.STRING },
          translation: { type: Type.STRING },
          suggestions: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
        },
        required: ['corrected', 'explanation', 'translation'],
      },
    },
  });
  return JSON.parse(response.text || '{}');
};

export const readImageText = async (base64Image: string, language: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `Analyze this image for a student learning ${language}. 
        Extract any text present, translate it, and identify 5 key vocabulary words seen in the scene.
        Provide a JSON response with:
        transcription: (the exact text found in the image),
        translation: (English translation of that text),
        sceneDescription: (briefly describe what is happening in the image),
        vocabulary: (list of 5 objects/words identified in the image with their translations).` }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transcription: { type: Type.STRING },
          translation: { type: Type.STRING },
          sceneDescription: { type: Type.STRING },
          vocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                meaning: { type: Type.STRING }
              },
              required: ['word', 'meaning']
            }
          }
        },
        required: ['transcription', 'translation', 'sceneDescription', 'vocabulary']
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateSpeech = async (text: string, language: string, slow: boolean = false) => {
  if (!text || text.trim().length === 0) return null;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const cleanText = text.replace(/[*_#`~>]/g, '').trim();
  const prompt = `Say in ${language}: ${cleanText}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction: `You are a dedicated TTS engine for language learners. 
      Only output AUDIO data. DO NOT output any text or explanations.
      ${slow ? 'Speak extremely slowly and clearly, pronouncing every syllable distinctly.' : 'Speak clearly and naturally.'}`,
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  return part?.inlineData?.data;
};

export const analyzePronunciation = async (audioBase64: string, expectedText: string, language: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Browsers usually record in webm. Since blobToBase64 strips the data URL prefix,
  // we use audio/webm as the most likely format for the model to process.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: audioBase64, mimeType: 'audio/webm' } },
        { text: `The student is learning ${language} and tried to say: "${expectedText}". 
        Evaluate their pronunciation in the provided audio file.
        Compare what was actually spoken against the target text.
        Focus on phonetics, accent, and rhythm.
        
        Return a JSON object with:
        score: (integer 0-100),
        feedback: (clear advice in English on how to improve),
        detected_text: (the actual text you heard in the recording).` }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          feedback: { type: Type.STRING },
          detected_text: { type: Type.STRING }
        },
        required: ['score', 'feedback', 'detected_text']
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
