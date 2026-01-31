
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Language, LANGUAGES } from '../types';

interface VisualScanProps {
  language: Language;
}

const SCAN_MESSAGES = [
  "Iniciando visão computacional...",
  "Segmentando objetos na cena...",
  "Analisando contexto cultural...",
  "Gerando explicação pedagógica...",
  "Polindo os detalhes finais..."
];

export const VisualScan: React.FC<VisualScanProps> = ({ language }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);
  const [targetTransLang, setTargetTransLang] = useState<Language>('Português Brasil');

  // States for Pronunciation Challenge
  const [isRecordingUser, setIsRecordingUser] = useState(false);
  const [isAnalyzingPronunciation, setIsAnalyzingPronunciation] = useState(false);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: number;
    if (isScanning) {
      interval = window.setInterval(() => {
        setScanMessageIndex((prev) => (prev + 1) % SCAN_MESSAGES.length);
      }, 2000);
    } else {
      setScanMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const startCamera = async () => {
    setCameraLoading(true);
    setShowCamera(true);
    try {
      const constraints = {
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
          setCameraLoading(false);
        }
      }, 150);
    } catch (err) {
      alert("Não foi possível acessar a câmera.");
      setShowCamera(false);
      setCameraLoading(false);
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImage(dataUrl);
        stopCamera();
        scanImage(dataUrl);
      }
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

  const scanImage = async (base64Img: string) => {
    setIsScanning(true);
    setResult(null);
    setTranslation(null);
    setPronunciationFeedback(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = base64Img.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: {
          parts: [
            { text: `You are a helpful language tutor. Analyze this image and explain what is happening in ${language}. Use clear, descriptive, and educational language. Respond ONLY in ${language}. Do not use Portuguese.` },
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
          ]
        }
      });
      setResult(response.text);
    } catch (e) {
      setResult("Falha ao analisar a imagem.");
    } finally {
      setIsScanning(false);
    }
  };

  const translateResult = async (specificLang?: Language) => {
    if (!result) return;
    setIsTranslating(true);
    const target = specificLang || targetTransLang;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Translate the following educational text from ${language} to ${target}. Maintain a pedagogical, clear, and encouraging tone: "${result}"`,
      });
      setTranslation(response.text);
      if (specificLang) setTargetTransLang(specificLang);
    } catch (e) {
      setTranslation("Erro ao traduzir.");
    } finally {
      setIsTranslating(false);
    }
  };

  const startRecordingUser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      const updateLevel = () => {
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 128);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        analyzeUserPronunciation(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setAudioLevel(0);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingUser(true);
    } catch (err) { alert("Microfone negado."); }
  };

  const stopRecordingUser = () => {
    if (mediaRecorderRef.current && isRecordingUser) {
      mediaRecorderRef.current.stop();
      setIsRecordingUser(false);
    }
  };

  const analyzeUserPronunciation = async (blob: Blob) => {
    setIsAnalyzingPronunciation(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: {
            parts: [
              { text: `The user recorded themselves reading: "${result}". Analyze pronunciation in ${language} and respond in Portuguese with tips.` },
              { inlineData: { data: base64Audio, mimeType: 'audio/webm' } }
            ]
          }
        });
        setPronunciationFeedback(response.text);
      };
    } catch (e) { setPronunciationFeedback("Erro na análise."); } finally { setIsAnalyzingPronunciation(false); }
  };

  const speakResult = async () => {
    if (!result || isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{ parts: [{ text: `Read this in ${language}: ${result}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        const ctx = audioContextRef.current;
        const decode = (b64: string) => {
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          return bytes;
        };
        const decodeAudioData = async (data: Uint8Array, c: AudioContext): Promise<AudioBuffer> => {
          const dataInt16 = new Int16Array(data.buffer);
          const buffer = c.createBuffer(1, dataInt16.length, 24000);
          const channelData = buffer.getChannelData(0);
          for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
          return buffer;
        };
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start();
      }
    } catch (e) { setIsPlayingAudio(false); }
  };

  const resetAll = () => {
    setImage(null);
    setResult(null);
    setTranslation(null);
    setPronunciationFeedback(null);
    stopCamera();
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Varredura Visual</h2>
          <p className="text-slate-400 text-sm md:text-base">Transforme imagens em lições.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!showCamera && (
            <button onClick={() => fileRef.current?.click()} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-indigo-400 font-bold text-xs">
              Upload
            </button>
          )}
          {!showCamera ? (
            <button onClick={startCamera} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all text-xs">
              <i className="fas fa-camera mr-2"></i> Abrir Câmera
            </button>
          ) : (
            <button onClick={stopCamera} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl text-xs">Cancelar</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="relative h-[300px] sm:h-[450px] md:h-[600px] lg:h-[650px] glass-panel rounded-[2rem] border border-white/10 overflow-hidden flex items-center justify-center bg-black/20 group">
          {showCamera ? (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              {cameraLoading && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 gap-4"><div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div></div>}
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
                <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-indigo-500/30 flex items-center justify-center shadow-2xl">
                  <i className="fas fa-camera text-slate-900 text-lg"></i>
                </button>
              </div>
            </div>
          ) : image ? (
            <img src={image} className="w-full h-full object-cover animate-in zoom-in-95 duration-500" alt="Captured" />
          ) : (
            <div className="text-center p-8 space-y-4">
              <i className="fas fa-camera text-indigo-400 text-3xl opacity-30"></i>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Tire uma foto para analisar o ambiente.</p>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex flex-col gap-6 h-auto lg:h-[650px]">
          <div className="flex-1 glass-panel p-6 md:p-8 rounded-[2rem] border-white/10 overflow-y-auto bg-slate-900/40 custom-scrollbar">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-900/80 backdrop-blur-md py-2 z-10 -mx-6 px-6">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resultado</label>
              {result && (
                <button onClick={speakResult} disabled={isPlayingAudio} className="text-[10px] text-indigo-400 font-bold uppercase">
                  <i className={`fas ${isPlayingAudio ? 'fa-spinner fa-spin' : 'fa-volume-high'} mr-1`}></i> Ouvir
                </button>
              )}
            </div>

            {isScanning ? (
              <div className="py-20 flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{SCAN_MESSAGES[scanMessageIndex]}</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="text-slate-200 text-sm md:text-lg leading-relaxed whitespace-pre-wrap">{result}</div>
                <button
                  onClick={() => translateResult('Português Brasil')}
                  disabled={isTranslating}
                  className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 font-bold text-xs transition-all"
                >
                  Traduzir para Português
                </button>
                {translation && <p className="p-4 bg-indigo-950/30 rounded-xl text-slate-400 text-xs italic">{translation}</p>}

                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Desafio de Pronúncia</p>
                    <button
                      onMouseDown={startRecordingUser} onMouseUp={stopRecordingUser}
                      onTouchStart={startRecordingUser} onTouchEnd={stopRecordingUser}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecordingUser ? 'bg-red-500 shadow-xl' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                    >
                      <i className={`fas ${isRecordingUser ? 'fa-stop' : 'fa-microphone'} text-white`}></i>
                    </button>
                  </div>
                  {pronunciationFeedback && <div className="text-xs text-slate-300 italic p-4 bg-white/5 rounded-xl border border-white/5">{pronunciationFeedback}</div>}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-600 text-xs italic">Aguardando imagem...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
