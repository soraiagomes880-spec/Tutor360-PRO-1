
import React, { useState, useEffect } from 'react';
import { Language, GroundingChunk, LANGUAGES } from '../types';
import { getExploreInfo, translateText } from '../services/geminiService';
import TTSButton from './TTSButton';

interface CultureTutorProps {
  targetLanguage: Language;
  onAction: () => void;
}

const CultureTutor: React.FC<CultureTutorProps> = ({ targetLanguage, onAction }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [translatedResult, setTranslatedResult] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [translationLang, setTranslationLang] = useState<Language>(LANGUAGES.find(l => l.code === 'pt') || LANGUAGES[0]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Location access denied. Results may be less relevant to your area.");
        }
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setResult(null);
    setTranslatedResult(null);
    setSources([]);
    onAction(); // Usage increment
    try {
      const response = await getExploreInfo(topic, targetLanguage.name, userLocation || undefined);
      setResult(response.text || "No information found.");
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setSources(chunks);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch explorer info.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!result) return;
    setIsTranslating(true);
    try {
      const translation = await translateText(result, translationLang.name);
      setTranslatedResult(translation || null);
    } catch (err) {
      console.error(err);
      alert('Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 p-6 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h2 className="text-3xl font-black text-slate-800 mb-4">World Explorer</h2>
        <p className="text-slate-500 text-lg">Real-time places, trends, and cultural gems in the {targetLanguage.name}-speaking world.</p>
        {userLocation ? (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit mx-auto">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Location active for nearby recommendations
          </div>
        ) : locationError ? (
          <p className="mt-2 text-[10px] text-amber-500 font-medium">{locationError}</p>
        ) : null}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 relative">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Search places like "Italian restaurants" or "Festivals in Madrid"...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pr-12 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg shadow-inner"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || !topic.trim()}
          className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-3 ${
            isLoading || !topic.trim() ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg active:scale-95'
          }`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col gap-6">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 relative">
              <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Explorer Insight</span>
              </div>
              <div className="prose prose-indigo max-w-none text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                {result}
              </div>
            </div>

            {/* Translation Control Panel */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5c1.382 0 2.72.253 3.946.706" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Language Bridge</h4>
                  <p className="text-xs text-slate-500 font-medium">Translate this insight into your language</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select 
                  value={translationLang.code}
                  onChange={(e) => setTranslationLang(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm flex-1 md:flex-none"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className={`px-6 py-2 rounded-xl font-bold transition-all shadow-sm whitespace-nowrap ${
                    isTranslating ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                  }`}
                >
                  {isTranslating ? 'Translating...' : 'Translate'}
                </button>
              </div>
            </div>

            {translatedResult && (
              <div className="bg-white border border-indigo-200 rounded-3xl p-8 relative shadow-lg shadow-indigo-50 animate-in slide-in-from-top-4 duration-500">
                <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
                   <TTSButton text={translatedResult} language={translationLang.name} className="scale-75 shadow-none border-none bg-indigo-50 text-indigo-600" />
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Translated Insight</span>
                </div>
                <div className="prose prose-indigo max-w-none text-slate-700 leading-relaxed text-lg whitespace-pre-wrap italic">
                  {translatedResult}
                </div>
              </div>
            )}
          </div>

          {sources.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Discovery Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map((source, idx) => {
                  if (source.maps) {
                    return (
                      <a 
                        key={idx}
                        href={source.maps.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full flex items-start justify-end p-2 -mr-4 -mt-4 opacity-50">
                           <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 flex-shrink-0 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <div className="min-w-0 pr-6">
                            <p className="text-sm font-bold text-slate-700 truncate group-hover:text-emerald-600 transition-colors">{source.maps.title || "Place Link"}</p>
                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter">Open in Maps</p>
                          </div>
                        </div>
                        {source.maps.placeAnswerSources?.reviewSnippets && source.maps.placeAnswerSources.reviewSnippets.length > 0 && (
                          <div className="mt-2 text-[11px] text-slate-500 italic line-clamp-2 border-l-2 border-slate-100 pl-2">
                            "{source.maps.placeAnswerSources.reviewSnippets[0].text}"
                          </div>
                        )}
                      </a>
                    );
                  }
                  
                  if (source.web) {
                    return (
                      <a 
                        key={idx}
                        href={source.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group"
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-slate-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{source.web.title || "Web Source"}</p>
                          <p className="text-[10px] text-slate-400 truncate">{new URL(source.web.uri).hostname}</p>
                        </div>
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CultureTutor;
