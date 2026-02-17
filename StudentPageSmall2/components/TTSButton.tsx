
import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';

interface TTSButtonProps {
  text: string;
  language: string;
  slow?: boolean;
  className?: string;
  label?: string;
}

const TTSButton: React.FC<TTSButtonProps> = ({ text, language, slow = false, className = "", label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Already stopped or not started
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleToggle = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (!text || isLoading) return;
    
    setIsLoading(true);
    try {
      const base64Audio = await generateSpeech(text, language, slow);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          setIsPlaying(false);
          sourceNodeRef.current = null;
        };

        sourceNodeRef.current = source;
        setIsPlaying(true);
        setIsLoading(false);
        source.start();
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      title={isPlaying ? "Stop" : (slow ? "Hear slow pronunciation" : "Hear pronunciation")}
      className={`group flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-sm border ${
        isPlaying 
          ? 'bg-red-50 border-red-200 text-red-600' 
          : slow 
            ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
            : 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700'
      } ${isLoading ? 'opacity-70 cursor-wait' : ''} ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : slow ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </div>
      {label && <span className="text-xs uppercase tracking-wider">{label}</span>}
    </button>
  );
};

export default TTSButton;
