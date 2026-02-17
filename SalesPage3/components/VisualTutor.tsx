
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { readImageText } from '../services/geminiService';
import { blobToBase64 } from '../utils/audio';
import TTSButton from './TTSButton';

interface VisualTutorProps {
  targetLanguage: Language;
  onAction: () => void;
}

interface AnalysisResult {
  transcription: string;
  translation: string;
  sceneDescription: string;
  vocabulary: { word: string; meaning: string }[];
}

const VisualTutor: React.FC<VisualTutorProps> = ({ targetLanguage, onAction }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setResult(null);
        setImage(null);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await blobToBase64(file);
      setImage(`data:${file.type};base64,${base64}`);
      setResult(null);
      setIsCameraActive(false);
    }
  };

  const handleReadImage = async () => {
    if (!image) return;
    setIsReading(true);
    onAction(); // Usage increment
    try {
      const base64Data = image.split(',')[1];
      const analysis = await readImageText(base64Data, targetLanguage.name);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      alert('Error reading image.');
    } finally {
      setIsReading(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 p-6 md:p-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Visual Reader</h2>
            <p className="text-slate-500">Extract text and learn from your surroundings.</p>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="aspect-[4/3] w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden relative group shadow-inner">
            
            {isCameraActive ? (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-10">
                  <button 
                    onClick={stopCamera}
                    className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button 
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-slate-300 active:scale-90 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-indigo-500"></div>
                  </button>
                </div>
              </div>
            ) : image ? (
              <>
                <img src={image} className="w-full h-full object-cover" alt="Uploaded" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
                  <button 
                    onClick={startCamera}
                    className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold border border-white/30 hover:bg-white/40"
                  >
                    Retake
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold border border-white/30 hover:bg-white/40"
                  >
                    New Upload
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-8 w-full h-full flex flex-col items-center justify-center">
                <div className="flex gap-4 mb-4">
                  <button 
                    onClick={startCamera}
                    className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 hover:bg-indigo-200 transition-all hover:scale-110"
                    title="Open Camera"
                  >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all hover:scale-110"
                    title="Upload Image"
                  >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-600">Take a photo or upload</p>
                <p className="text-xs text-slate-400 mt-2">Signs, menus, or book pages</p>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <button
            onClick={handleReadImage}
            disabled={!image || isReading || isCameraActive}
            className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-md ${
              !image || isReading || isCameraActive ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg active:scale-95'
            }`}
          >
            {isReading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reading image...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Extract & Analyze
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          {!result ? (
            <div className="flex-1 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-12 opacity-60">
              <svg className="w-16 h-16 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-500 mb-2">Ready for Scan</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">Upload or capture an image to extract text and generate interactive vocabulary lists.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Scene Context */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Scene Insight</h4>
                <p className="text-slate-700 font-medium leading-relaxed">{result.sceneDescription}</p>
              </div>

              {/* Transcription & Translation */}
              <div className="p-8 bg-white border border-slate-200 rounded-3xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0">
                  <div className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">Analysis</div>
                </div>
                
                <div className="space-y-6">
                  {/* Target Text */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Transcribed Text ({targetLanguage.name})</h4>
                    <div className="flex flex-col gap-4">
                      <p className="text-2xl font-black text-slate-900 leading-tight">{result.transcription || 'No text found.'}</p>
                      {result.transcription && (
                        <div className="flex gap-2">
                          <TTSButton 
                            text={result.transcription} 
                            language={targetLanguage.name} 
                            label="Listen"
                            className="text-xs" 
                          />
                          <TTSButton 
                            text={result.transcription} 
                            language={targetLanguage.name} 
                            slow={true} 
                            label="Slower"
                            className="text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* English Translation */}
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">English Translation</h4>
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xl text-indigo-700 font-medium leading-relaxed flex-1 italic">
                        "{result.translation}"
                      </p>
                      {result.translation && (
                        <TTSButton 
                          text={result.translation} 
                          language="English" 
                          className="mt-1 bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100 shadow-none scale-90" 
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vocabulary Chips */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Scene Vocabulary
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.vocabulary.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-indigo-200 transition-all group">
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 truncate">{item.word}</p>
                        <p className="text-xs text-slate-500 truncate">{item.meaning}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TTSButton text={item.word} language={targetLanguage.name} className="scale-75 !p-1 shadow-none border-none bg-indigo-50 text-indigo-600" />
                        <TTSButton text={item.word} language={targetLanguage.name} slow={true} className="scale-75 !p-1 shadow-none border-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualTutor;
