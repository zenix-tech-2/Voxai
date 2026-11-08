import React, { useState } from 'react';
import { X, Sparkles, Loader2, ArrowRight, Wand2, Clock, Check } from 'lucide-react';

interface AICommercialWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScript: (script: string, notes?: string) => void;
  currentLanguage: 'fr' | 'en';
  currentGender: 'male' | 'female';
}

interface ScriptResult {
  title: string;
  duration: string;
  script: string;
  notes?: string;
}

export const AICommercialWriterModal: React.FC<AICommercialWriterModalProps> = ({
  isOpen,
  onClose,
  onSelectScript,
  currentLanguage,
  currentGender,
}) => {
  const [product, setProduct] = useState('');
  const [category, setCategory] = useState('Luxe & Mode');
  const [language, setLanguage] = useState<'fr' | 'en'>(currentLanguage);
  const [gender, setGender] = useState<'Male' | 'Female'>(currentGender === 'male' ? 'Male' : 'Female');
  const [tone, setTone] = useState('Persuasif, élégant et captivant');
  const [duration, setDuration] = useState('30s');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedScripts, setGeneratedScripts] = useState<ScriptResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) {
      setError(language === 'fr' ? 'Veuillez saisir un produit ou une marque' : 'Please enter a product or brand name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          category,
          language,
          gender,
          tone,
          duration,
        }),
      });

      const raw = await res.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Serveur indisponible (${res.status}). Vérifiez le déploiement Vercel et GEMINI_API_KEY.`);
      }
      if (data.success && data.scripts && data.scripts.length > 0) {
        setGeneratedScripts(data.scripts);
        if (data.isFallback) {
          setError(`Script de secours affiché (IA indisponible${data.warning ? ` : ${data.warning}` : ''})`);
        }
      } else {
        setError(data.error || 'Erreur lors de la génération du script');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                {language === 'fr' ? 'Rédacteur Publicitaire IA' : 'AI Commercial Copywriter'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'fr'
                  ? 'Générez des spots percutants sur mesure pour voix masculine ou féminine'
                  : 'Generate high-converting commercial spots tailored to male or female voiceover'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'fr' ? 'Produit ou Marque' : 'Product / Brand Name'} *
                </label>
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder={language === 'fr' ? 'ex: Montre Horizon Solaire, Parfum Nuit Bleue...' : 'e.g. Horizon Solar Chrono, Aura Skincare...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'fr' ? 'Secteur d\'activité' : 'Industry / Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Luxe & Parfumerie">Luxe & Parfumerie (Luxury)</option>
                  <option value="Automobile & Tech">Automobile & Électrique (Auto & Tech)</option>
                  <option value="Promotion & Vente Flash">Promotion & Soldes (Flash Sale)</option>
                  <option value="Gastronomie & Terroir">Gastronomie & Vins (Gourmet Food)</option>
                  <option value="SaaS & Logiciel">SaaS B2B & Startup (Tech)</option>
                  <option value="Voyages & Hôtels">Voyages & Palaces (Travel)</option>
                  <option value="Santé & Bien-être">Santé & Beauté (Wellness)</option>
                  <option value="Banque & Patrimoine">Banque & Finance (Finance)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'fr' ? 'Langue du Spot' : 'Spot Language'}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'fr' ? 'Genre de la Voix' : 'Target Voice'}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Male">👨 Homme (Men's Voice)</option>
                  <option value="Female">👩 Femme (Women's Voice)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'fr' ? 'Format Cible' : 'Target Duration'}
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="15s">15 secondes (Flash / Réseaux)</option>
                  <option value="30s">30 secondes (Radio / TV Standard)</option>
                  <option value="60s">60 secondes (Brand Story)</option>
                  <option value="2min">2 minutes (Présentation & Démo)</option>
                  <option value="5min">5 minutes (Podcast & Narration Longue)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>{language === 'fr' ? 'Rédaction IA en cours...' : 'Generating commercial copy...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{language === 'fr' ? 'Générer les Scripts Publicitaires' : 'Generate Commercial Scripts'}</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Scripts List */}
          {generatedScripts.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                {language === 'fr' ? 'Variations Disponibles :' : 'Generated Variations:'}
              </h4>

              {generatedScripts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200">
                      {item.title}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.duration}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    "{item.script}"
                  </p>

                  {item.notes && (
                    <p className="text-[11px] text-cyan-400/90 italic">
                      💡 Direction : {item.notes}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onSelectScript(item.script, item.notes);
                      onClose();
                    }}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'fr' ? 'Utiliser ce texte dans le Studio' : 'Load this script into Studio'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
