
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import { Language, LANGUAGES } from '../types';
import { withRetry } from '../utils';
import { getGeminiKey } from '../lib/gemini';

interface VisualScanProps {
  language: Language;
  onAction?: () => Promise<boolean> | boolean;
}

const SCAN_MESSAGES = [
  "Iniciando varredura...",
  "Processando imagem...",
  "Analisando contexto...",
  "Traduzindo ambiente...",
  "Gerando leitura final..."
];

export const VisualScan: React.FC<VisualScanProps> = ({ language, onAction }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let interval: number;
    if (isScanning) {
      interval = window.setInterval(() => {
        setScanMessageIndex((prev) => (prev + 1) % SCAN_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const scanImage = async (base64Img: string) => {
    setIsScanning(true);
    setResult(null);
    if (onAction) {
      const allowed = await onAction();
      if (!allowed) {
        setIsScanning(false);
        return;
      }
    }
    try {
      const apiKey = getGeminiKey();
      if (!apiKey) {
        alert("Configure a Gemini API Key no botão 'Conectar Nuvem'");
        setIsScanning(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const base64Data = base64Img.split(',')[1];
      const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: `Analyze this image in ${language} educationally. Identify objects and describe the scene. Respond ONLY in ${language}.` },
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
          ]
        }
      }));
      setResult(response.text ?? null);
    } catch (e: any) {
      setResult(e.message?.includes('503') ? "Servidor temporariamente indisponível." : "Falha na análise.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert("Câmera indisponível.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      scanImage(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Varredura Visual</h2>

        <div className="flex gap-2 md:gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-gradient-to-r from-[#5046e5] to-[#7c3aed] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all text-[10px] md:text-xs uppercase tracking-wider"
          >
            <i className="fas fa-folder-open"></i>
            Arquivo
          </button>

          {!showCamera ? (
            <button
              onClick={startCamera}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-[#2563eb] text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-all text-[10px] md:text-xs uppercase tracking-wider"
            >
              <i className="fas fa-camera"></i>
              Câmera
            </button>
          ) : (
            <button onClick={stopCamera} className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl text-[10px] md:text-xs uppercase tracking-wider">Cancelar</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:h-[600px]">
        {/* Lado Esquerdo - Preview */}
        <div className="glass-panel rounded-[2rem] bg-[#050914]/40 border border-white/5 overflow-hidden flex items-center justify-center relative min-h-[300px] md:min-h-0">
          {showCamera ? (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline />
              <button onClick={capturePhoto} className="absolute bottom-8 w-16 h-16 bg-white rounded-full border-4 border-blue-500 shadow-2xl flex items-center justify-center z-10">
                <i className="fas fa-camera text-slate-900 text-xl"></i>
              </button>
            </div>
          ) : image ? (
            <img src={image} className="w-full h-full object-cover animate-in zoom-in-95" />
          ) : (
            <div className="text-center space-y-4 p-8">
              <div className="w-16 md:w-20 h-16 md:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <i className="fas fa-image text-slate-700 text-2xl md:text-3xl"></i>
              </div>
              <p className="text-slate-600 font-medium text-xs md:text-sm">Selecione um arquivo ou abra a câmera</p>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Lado Direito - Leitura */}
        <div className="glass-panel rounded-[2rem] bg-[#050914]/40 border border-white/5 overflow-hidden flex flex-col min-h-[300px] md:min-h-0">
          <div className="p-6 md:p-8 border-b border-white/5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Leitura da IA ({language.toUpperCase()})
            </h3>
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col items-center justify-center text-center">
            {isScanning ? (
              <div className="space-y-4 animate-pulse">
                <i className="fas fa-wand-magic-sparkles text-indigo-400 text-4xl"></i>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">{SCAN_MESSAGES[scanMessageIndex]}</p>
              </div>
            ) : result ? (
              <div className="w-full text-left animate-in slide-in-from-bottom-4">
                <p className="text-white text-base md:text-lg leading-relaxed font-medium whitespace-pre-wrap">{result}</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-xs opacity-40 p-4">
                <i className="fas fa-wand-magic-sparkles text-5xl md:text-6xl text-slate-700"></i>
                <p className="text-slate-600 text-xs md:text-sm italic font-medium leading-relaxed">
                  Use os botões acima para enviar uma imagem para leitura.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
