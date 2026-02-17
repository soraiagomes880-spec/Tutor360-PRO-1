
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, GenerationStatus, VideoResult } from '../types';

interface VeoGeneratorProps {
  onComplete: (video: VideoResult) => void;
}

const REASSURING_MESSAGES = [
  "Iniciando motor neural cinemático...",
  "Analisando texturas e iluminação da imagem...",
  "Sintetizando consistência temporal...",
  "Simulando física e movimento fluido...",
  "Upscaling de frames para qualidade de cinema...",
  "Aplicando desfoque de movimento final...",
  "Otimizando para reprodução...",
];

const FILTERS = [
  { name: 'Nenhum', filter: 'none' },
  { name: 'P&B', filter: 'grayscale(100%)' },
  { name: 'Sépia', filter: 'sepia(80%)' },
  { name: 'Vívido', filter: 'contrast(120%) saturate(120%)' },
  { name: 'Sonhador', filter: 'brightness(110%) saturate(80%)' },
];

export const VeoGenerator: React.FC<VeoGeneratorProps> = ({ onComplete }) => {
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [status, setStatus] = useState<GenerationStatus>({ step: 'idle', message: '' });
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  
  // Image editing state
  const [rotation, setRotation] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeFilterIdx, setActiveFilterIdx] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        setOriginalImage(result);
        // Reset edits
        setRotation(0);
        setIsFlipped(false);
        setActiveFilterIdx(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyEdits = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!originalImage || !canvasRef.current) return resolve(image || '');
      
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        
        const isRotatedVertical = (rotation / 90) % 2 !== 0;
        canvas.width = isRotatedVertical ? img.naturalHeight : img.naturalWidth;
        canvas.height = isRotatedVertical ? img.naturalWidth : img.naturalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        if (isFlipped) ctx.scale(-1, 1);
        
        // Apply Canvas filter
        ctx.filter = FILTERS[activeFilterIdx].filter;
        
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = originalImage;
    });
  };

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleFlip = () => setIsFlipped((prev) => !prev);
  const handleCycleFilter = () => setActiveFilterIdx((prev) => (prev + 1) % FILTERS.length);

  const generateVideo = async () => {
    if (!image || !prompt) return;

    setStatus({ step: 'processing', message: REASSURING_MESSAGES[0] });
    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % REASSURING_MESSAGES.length;
      setStatus(prev => ({ ...prev, message: REASSURING_MESSAGES[messageIndex] }));
    }, 8000);

    try {
      // Bake edits into a final image string
      const bakedImage = await applyEdits();
      const base64Data = bakedImage.split(',')[1];

      // Always create a new GoogleGenAI instance right before the API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: base64Data,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        try {
          operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (pollError: any) {
          // If the request fails due to missing project configuration, prompt user to select key again
          if (pollError.message?.includes("Requested entity was not found")) {
            clearInterval(interval);
            setStatus({ step: 'error', message: 'API Key reset detected. Please re-select your key.' });
            if (window.aistudio) {
              await window.aistudio.openSelectKey();
            }
            return;
          }
          throw pollError;
        }
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed to return a valid URL.");

      setStatus({ step: 'downloading', message: 'Finalizando sua obra-prima...' });
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);

      setResultVideo(videoUrl);
      onComplete({
        url: videoUrl,
        prompt,
        aspectRatio,
      });
      setStatus({ step: 'complete', message: 'Geração concluída!' });
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        setStatus({ step: 'error', message: 'API Key inválida ou não encontrada. Por favor, reconecte.' });
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
        }
      } else {
        setStatus({ step: 'error', message: error.message || 'Ocorreu um erro inesperado.' });
      }
    } finally {
      clearInterval(interval);
    }
  };

  const reset = () => {
    setImage(null);
    setOriginalImage(null);
    setPrompt('');
    setResultVideo(null);
    setStatus({ step: 'idle', message: '' });
    setRotation(0);
    setIsFlipped(false);
    setActiveFilterIdx(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <canvas ref={canvasRef} className="hidden" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[2rem] border-white/10 shadow-xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <i className="fas fa-wand-magic-sparkles text-blue-400"></i>
              Criar Cena Cinemática
            </h2>

            {/* Image Upload & Editor */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Imagem de Referência</label>
              <div 
                className={`relative group border-2 border-dashed rounded-2xl overflow-hidden transition-all h-64 flex flex-col items-center justify-center ${
                  image ? 'border-blue-500/50' : 'border-white/10 hover:border-blue-500/30 bg-white/5 cursor-pointer'
                }`}
                onClick={() => !image && fileInputRef.current?.click()}
              >
                {image ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-black/20">
                    <img 
                      src={image} 
                      className="max-w-full max-h-full transition-all duration-300" 
                      style={{ 
                        transform: `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
                        filter: FILTERS[activeFilterIdx].filter
                      }} 
                      alt="Preview" 
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all text-white"
                        title="Trocar Imagem"
                      >
                        <i className="fas fa-camera text-sm"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <i className="fas fa-cloud-arrow-up text-blue-400 text-2xl"></i>
                    </div>
                    <p className="text-slate-300 font-medium mb-1">Carregar Frame Inicial</p>
                    <p className="text-xs text-slate-500">Suporta PNG, JPG, WEBP</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              {/* Editing Toolbar */}
              {image && (
                <div className="flex items-center justify-center gap-4 mt-4 px-2 py-3 bg-white/5 rounded-2xl border border-white/5">
                  <button 
                    onClick={handleRotate}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-all">
                      <i className="fas fa-rotate-right text-slate-400 group-hover:text-blue-400"></i>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Girar</span>
                  </button>

                  <button 
                    onClick={handleFlip}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-all">
                      <i className="fas fa-arrows-left-right text-slate-400 group-hover:text-blue-400"></i>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Inverter</span>
                  </button>

                  <button 
                    onClick={handleCycleFilter}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${activeFilterIdx > 0 ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-800 border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/50'}`}>
                      <i className={`fas fa-wand-magic-sparkles ${activeFilterIdx > 0 ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}`}></i>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">
                      {FILTERS[activeFilterIdx].name}
                    </span>
                  </button>

                  <div className="h-8 w-px bg-white/10 mx-1"></div>

                  <button 
                    onClick={() => {
                      setRotation(0);
                      setIsFlipped(false);
                      setActiveFilterIdx(0);
                    }}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all">
                      <i className="fas fa-trash-can text-slate-500 group-hover:text-red-400"></i>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Limpar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Prompt de Animação</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva como a imagem deve se animar... ex: 'Um zoom dramático no personagem enquanto luzes de neon piscam ao fundo'"
                className="w-full h-32 bg-black/30 glass-panel border border-white/10 rounded-[2rem] p-6 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Proporção da Tela</label>
              <div className="grid grid-cols-2 gap-4">
                {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      aspectRatio === ratio 
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-900/10' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <i className={`fas ${ratio === '16:9' ? 'fa-tv' : 'fa-mobile-screen'}`}></i>
                    <span className="font-medium">{ratio === '16:9' ? 'Paisagem' : 'Retrato'}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateVideo}
              disabled={!image || !prompt || status.step !== 'idle'}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-blue-900/40 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
            >
              {status.step === 'idle' ? (
                <>
                  <i className="fas fa-play"></i>
                  Gerar Vídeo
                </>
              ) : (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Processando...
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-6 flex flex-col h-full">
          <div className={`glass-panel p-8 rounded-[2rem] border-white/10 shadow-xl flex-1 flex flex-col ${status.step !== 'idle' ? 'animate-pulse' : ''}`}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <i className="fas fa-film text-purple-400"></i>
              Pré-visualização
            </h2>

            <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl overflow-hidden relative min-h-[400px] flex items-center justify-center">
              {status.step === 'idle' && !resultVideo && (
                <div className="text-center p-12 text-slate-500">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <i className="fas fa-video-slash text-2xl opacity-50"></i>
                  </div>
                  <p>Aguardando seu prompt</p>
                  <p className="text-xs mt-2 italic">Preencha o painel esquerdo para começar</p>
                </div>
              )}

              {status.step !== 'idle' && status.step !== 'complete' && status.step !== 'error' && (
                <div className="text-center p-8 z-10 w-full max-sm:p-4">
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fas fa-bolt text-blue-400 animate-pulse"></i>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Gerando Movimento</h3>
                  <p className="text-sm text-blue-300 font-mono h-12 flex items-center justify-center leading-tight">
                    {status.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-8 italic text-center">Isso pode levar de 2 a 3 minutos. Grande arte leva tempo.</p>
                </div>
              )}

              {status.step === 'error' && (
                <div className="text-center p-12 text-red-400">
                  <i className="fas fa-triangle-exclamation text-4xl mb-4"></i>
                  <h3 className="text-lg font-bold mb-2">Algo deu errado</h3>
                  <p className="text-sm opacity-80 mb-6">{status.message}</p>
                  <button onClick={reset} className="px-6 py-2 bg-red-500/20 border border-red-500/30 rounded-full hover:bg-red-500/30 transition-colors">
                    Tentar Novamente
                  </button>
                </div>
              )}

              {resultVideo && status.step === 'complete' && (
                <div className="w-full h-full flex flex-col animate-in zoom-in duration-500">
                  <video 
                    src={resultVideo} 
                    controls 
                    autoPlay 
                    loop 
                    className={`w-full h-full ${aspectRatio === '16:9' ? 'object-contain' : 'object-cover'}`}
                  />
                  <div className="absolute bottom-6 right-6 flex gap-3">
                    <a 
                      href={resultVideo} 
                      download="tutor360_video.mp4"
                      className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    >
                      <i className="fas fa-download"></i>
                    </a>
                    <button 
                      onClick={reset}
                      className="bg-slate-800 hover:bg-slate-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    >
                      <i className="fas fa-rotate-left"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
