import React, { useState } from 'react';

interface SupabaseSetupProps {
  onClose: () => void;
}

export const SupabaseSetup: React.FC<SupabaseSetupProps> = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!url || !key) {
      setError("Preencha todos os campos.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Basic validation format
      if (!url.startsWith('https://')) {
        throw new Error("A URL deve começar com https://");
      }

      // Save to localStorage so lib/supabase.ts can pick it up
      // Using keys expected by lib/supabase.ts
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_key', key);

      // Also set VITE_ vars for redundancy? No, lib/supabase checks specific keys.

      // Force reload to apply changes
      window.location.reload();

    } catch (err: any) {
      setError(err.message || "Erro ao salvar configurações.");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <i className="fas fa-database text-2xl text-emerald-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Conectar Supabase</h2>
          <p className="text-slate-400 text-sm">Insira as credenciais do seu projeto para ativar o banco de dados.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Project URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Anon Public Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            Conectar e Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
