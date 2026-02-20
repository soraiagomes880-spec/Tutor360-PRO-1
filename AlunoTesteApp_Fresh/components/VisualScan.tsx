
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Language, LANGUAGES } from '../types';

interface VisualScanProps {
  language: Language;
  onActivity?: () => void;
}

export const VisualScan: React.FC<VisualScanProps> = ({ language, onActivity }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  // Estados para Tradução
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetTranslationLang, setTargetTranslationLang] = useState<Language>('Português Brasil');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Erro na câmera.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      stopCamera();
      scanImage(dataUrl);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        scanImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanImage = async (base64Img: string) => {
    setIsScanning(true);
    setResult(null);
    setTranslation(null); // Limpa tradução anterior ao fazer nova varredura
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const base64Data = base64Img.split(',')[1];
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { text: `Analyze this image and describe it in ${language}. Provide vocabulary tips and cultural context. Respond ONLY in ${language}.` },
                    { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
                ]
            }
        });
        setResult(response.text ?? "Erro ao descrever.");
        if (onActivity) onActivity();
    } catch (e) {
        setResult("Falha na análise.");
    } finally {
        setIsScanning(false);
    }
  };

  const translateResult = async () => {
    if (!result || isTranslating) return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Traduza o seguinte texto para ${targetTranslationLang}. Mantenha a formatação e o tom educativo: "${result}"`,
      });
      setTranslation(response.text ?? "Erro na tradução.");
    } catch (e) {
      setTranslation("Erro ao conectar com o serviço de tradução.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Varredura Visual</h2>
        
        <div className="flex items-center gap-3">
          {/* BOTÃO BAIXAR ARQUIVO (UPLOAD) */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
          >
            <i className="fas fa-folder-open text-sm"></i>
            Baixar Arquivo
          </button>
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="hidden" 
          />

          {/* BOTÃO ABRIR CÂMERA */}
          {!showCamera ? (
            <button 
              onClick={startCamera} 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2"
            >
              <i className="fas fa-camera text-sm"></i> Abrir Câmera
            </button>
          ) : (
            <button 
              onClick={stopCamera} 
              className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
            >
              Sair da Câmera
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel da Imagem (Esquerda) */}
        <div className="relative h-[400px] md:h-[500px] glass-panel rounded-[2.5rem] overflow-hidden flex items-center justify-center bg-black/20 group border-white/10 shadow-2xl">
          {showCamera ? (
            <div className="absolute inset-0">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <button 
                onClick={capturePhoto} 
                className="absolute bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full border-[6px] border-indigo-500/30 shadow-2xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full border-2 border-slate-200"></div>
              </button>
            </div>
          ) : image ? (
            <img src={image} className="w-full h-full object-cover animate-in zoom-in duration-500" />
          ) : (
             <div className="text-center p-12 opacity-40">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                 <i className="fas fa-image text-4xl text-slate-500"></i>
               </div>
               <p className="text-slate-500 font-medium">Selecione um arquivo ou abra a câmera</p>
             </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Painel do Resultado (Direita) */}
        <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] bg-slate-900/40 min-h-[400px] md:h-[500px] flex flex-col border-white/10 shadow-2xl overflow-hidden">
          <div className="mb-6 flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Leitura da IA ({language})</label>
            {isScanning && <i className="fas fa-circle-notch fa-spin text-indigo-500 text-xs"></i>}
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            {isScanning ? (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-xs uppercase font-black tracking-[0.3em] text-indigo-400 animate-pulse">Analisando imagem...</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Texto Original em Idioma Estrangeiro */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-700 bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner">
                  <p className="text-slate-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">{result}</p>
                </div>

                {/* Área de Tradução */}
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <select 
                        value={targetTranslationLang}
                        onChange={(e) => setTargetTranslationLang(e.target.value as Language)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-indigo-300 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.name} value={lang.name} className="bg-slate-900">{lang.name}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={translateResult}
                      disabled={isTranslating}
                      className="w-full sm:w-auto px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isTranslating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-language"></i>}
                      {isTranslating ? 'Traduzindo...' : 'Traduzir Leitura'}
                    </button>
                  </div>

                  {translation && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-500 bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Tradução para {targetTranslationLang}</p>
                      <p className="text-slate-400 text-sm italic leading-relaxed">{translation}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 opacity-20 text-center">
                <i className="fas fa-wand-magic-sparkles text-5xl mb-6"></i>
                <p className="text-slate-500 italic text-sm font-medium">Use os botões acima para enviar uma imagem para leitura.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
