import React, { useState, useRef, useEffect } from 'react';
import { VOICES, VoiceProfile } from './data/voices';
import { Header } from './components/Header';
import { CommercialStudio } from './components/CommercialStudio';
import { VoiceCatalog } from './components/VoiceCatalog';
import { TemplatesGallery } from './components/TemplatesGallery';
import { TakeHistory } from './components/TakeHistory';
import { AICommercialWriterModal } from './components/AICommercialWriterModal';
import { VoiceCloningModal } from './components/VoiceCloningModal';
import { VideoEditor } from './components/video-editor/VideoEditor';
import { StudioTab } from './components/Header';
import { TakeItem, generateSpeech } from './utils/speechEngine';
import { AdTemplate } from './data/adTemplates';
import { bgMusic } from './utils/audioSynth';
import {
  Sparkles,
  Users,
  Globe,
  Dna,
  Zap,
  Film,
} from 'lucide-react';

const STORAGE_KEY_CLONES = 'voxstudio_cloned_voices';

export default function App() {
  const [activeTab, setActiveTab] = useState<StudioTab>('editor');
  const [allVoices, setAllVoices] = useState<VoiceProfile[]>(VOICES);
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(VOICES[0]); // Default Babajide or Jean-Luc
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [takes, setTakes] = useState<TakeItem[]>([]);
  const [initialTakeToImport, setInitialTakeToImport] = useState<TakeItem | null>(null);
  const [isAIWriterOpen, setIsAIWriterOpen] = useState<boolean>(false);
  const [isCloningModalOpen, setIsCloningModalOpen] = useState<boolean>(false);

  // Hidden audio element for preview samples
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved cloned voices on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLONES);
      if (saved) {
        const parsed: VoiceProfile[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllVoices([...parsed, ...VOICES]);
        }
      }
    } catch (e) {
      console.warn('Failed to load cloned voices from storage', e);
    }
  }, []);

  // Handle previewing a voice's sample commercial line
  const handleTogglePreview = async (voice: VoiceProfile) => {
    if (playingPreviewId === voice.id) {
      setPlayingPreviewId(null);
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      bgMusic.stop();
      return;
    }

    // Stop existing preview
    if (previewAudioRef.current) previewAudioRef.current.pause();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    bgMusic.stop();

    setPlayingPreviewId(voice.id);

    try {
      const result = await generateSpeech(
        voice.sampleScript,
        voice,
        (speaking) => {
          if (!speaking) setPlayingPreviewId(null);
        }
      );

      if (result.audioUrl && previewAudioRef.current) {
        previewAudioRef.current.src = result.audioUrl;
        previewAudioRef.current.play().catch(() => {});
        previewAudioRef.current.onended = () => {
          setPlayingPreviewId(null);
        };
      }
    } catch {
      setPlayingPreviewId(null);
    }
  };

  const handleSelectVoiceFromCatalog = (voice: VoiceProfile) => {
    setSelectedVoice(voice);
    setActiveTab('studio');
  };

  const handleSelectTemplate = (template: AdTemplate, recommendedVoice?: VoiceProfile) => {
    if (recommendedVoice) {
      setSelectedVoice(recommendedVoice);
    }
    setActiveTab('studio');
  };

  const handleAddTake = (take: TakeItem) => {
    setTakes((prev) => [take, ...prev]);
  };

  const handleRestoreTake = (take: TakeItem) => {
    setSelectedVoice(take.voice);
    setActiveTab('studio');
  };

  const handleCreateVideoFromTake = (take: TakeItem) => {
    setInitialTakeToImport(take);
    setActiveTab('editor');
  };

  // Voice Cloning Completion
  const handleVoiceCloned = (newClone: VoiceProfile) => {
    setAllVoices((prev) => {
      const updated = [newClone, ...prev.filter((v) => v.id !== newClone.id)];
      try {
        const onlyClones = updated.filter((v) => v.isCloned);
        localStorage.setItem(STORAGE_KEY_CLONES, JSON.stringify(onlyClones));
      } catch (e) {
        console.warn('Failed to persist clone', e);
      }
      return updated;
    });

    setSelectedVoice(newClone);
    setActiveTab('studio');
  };

  // Delete cloned voice
  const handleDeleteClone = (voiceId: string) => {
    setAllVoices((prev) => {
      const updated = prev.filter((v) => v.id !== voiceId);
      try {
        const onlyClones = updated.filter((v) => v.isCloned);
        localStorage.setItem(STORAGE_KEY_CLONES, JSON.stringify(onlyClones));
      } catch {}
      return updated;
    });

    if (selectedVoice.id === voiceId) {
      setSelectedVoice(VOICES[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 antialiased">
      {/* Hidden audio for card sample previews */}
      <audio ref={previewAudioRef} className="hidden" />

      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        voiceCount={allVoices.length}
        onOpenCloningModal={() => setIsCloningModalOpen(true)}
      />

      {/* Sub-hero feature highlight pill bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/60 py-2.5 px-4 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span>🌍</span>
              <span>Voix Africaines (Nigeria, Ghana, Kenya, SA, Sénégal, CI)</span>
            </span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Dna className="w-3.5 h-3.5" />
              <span>Clonage Vocal IA (Micro & Upload)</span>
            </span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Hommes & Femmes</span>
            </span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Français 🇫🇷 & English 🇺🇸</span>
            </span>
          </div>

          <div className="text-[11px] text-emerald-400 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Studio 100% Gratuit & Illimité (5min+)</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'editor' && (
          <div className="animate-in fade-in duration-200">
            <VideoEditor
              sessionTakes={takes}
              initialTakeToImport={initialTakeToImport}
              onClearInitialTake={() => setInitialTakeToImport(null)}
            />
          </div>
        )}

        {activeTab === 'studio' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <CommercialStudio
              selectedVoice={selectedVoice}
              onOpenVoiceCatalog={() => setActiveTab('catalog')}
              onOpenAIWriter={() => setIsAIWriterOpen(true)}
              onAddTake={handleAddTake}
            />

            {/* Takes Session Library */}
            <TakeHistory
              takes={takes}
              onClearTakes={() => setTakes([])}
              onRestoreTake={handleRestoreTake}
              onCreateVideo={handleCreateVideoFromTake}
            />
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="animate-in fade-in duration-200">
            <VoiceCatalog
              voices={allVoices}
              selectedVoice={selectedVoice}
              onSelectVoice={handleSelectVoiceFromCatalog}
              playingPreviewId={playingPreviewId}
              onTogglePreview={handleTogglePreview}
              onOpenCloningModal={() => setIsCloningModalOpen(true)}
              onDeleteClone={handleDeleteClone}
            />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="animate-in fade-in duration-200">
            <TemplatesGallery onSelectTemplate={handleSelectTemplate} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            VoxStudio AI &bull; Studio vocal et clonage vocal IA pour publicités radio, TV, podcasts et réseaux sociaux.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span>🌍 8 Voix Africaines</span>
            <span>🇫🇷 6 Voix Françaises</span>
            <span>🇺🇸 6 Voix Anglaises</span>
            <span>✨ 6 Voix Spéciales</span>
            <span>🧬 Clonage Illimité</span>
          </div>
        </div>
      </footer>

      {/* AI Commercial Scriptwriter Modal */}
      <AICommercialWriterModal
        isOpen={isAIWriterOpen}
        onClose={() => setIsAIWriterOpen(false)}
        currentLanguage={selectedVoice.language === 'mixed' ? 'fr' : selectedVoice.language}
        currentGender={selectedVoice.gender}
        onSelectScript={(script, notes) => {
          setSelectedVoice((prev) => ({
            ...prev,
            sampleScript: script,
            stylePrompt: notes ? `${prev.stylePrompt} Direction: ${notes}` : prev.stylePrompt,
          }));
        }}
      />

      {/* Voice Cloning Studio Modal */}
      <VoiceCloningModal
        isOpen={isCloningModalOpen}
        onClose={() => setIsCloningModalOpen(false)}
        onVoiceCloned={handleVoiceCloned}
      />
    </div>
  );
}
