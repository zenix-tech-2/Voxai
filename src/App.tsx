import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptStudio } from './components/PromptStudio';
import { CanvasEditor } from './components/CanvasEditor';
import { PromptLab } from './components/PromptLab';
import { CuratedGallery } from './components/CuratedGallery';
import { HistoryView } from './components/HistoryView';
import { StatusModal } from './components/StatusModal';
import { StudioDrawer } from './components/StudioDrawer';
import { VoiceToolsModal } from './components/VoiceToolsModal';
import { NavigationDock } from './components/NavigationDock';
import { VoiceStudio } from './components/VoiceStudio';
import { CURATED_SHOWCASE } from './data/curatedPresets';
import { GeneratedImage, StudioSettings, AppTab } from './types';
import { useVoiceTools, VoiceCommand } from './hooks/useVoiceTools';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
  Wand2,
  Compass,
  Archive,
  Volume2,
  Mic,
} from 'lucide-react';

const INITIAL_SETTINGS: StudioSettings = {
  prompt:
    'Surreal architectural photography of a floating minimalist marble pavilion in a calm violet cosmic ocean under twin crescent moons, soft ethereal ambient light, long exposure water, Hasselblad medium format',
  negativePrompt: 'blurry, oversaturated, plastic texture, low quality, watermark',
  style: 'Surreal Architecture',
  lighting: 'Moody Chiaroscuro',
  camera: '24mm Ultra-Wide',
  aspectRatio: '16:9',
  referenceImage: null,
  referenceName: null,
  quality: 'hd',
  engine: 'flux',
};

const STORAGE_KEY = 'lumen_studio_history_v1';

const SCREENS: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'studio', label: 'Studio Synthesizer', icon: Sparkles },
  { id: 'canvas', label: 'Canvas Suite', icon: Sliders },
  { id: 'voice', label: 'Voice Studio', icon: Volume2 },
  { id: 'lab', label: 'Prompt Lab', icon: Wand2 },
  { id: 'gallery', label: 'Curated Gallery', icon: Compass },
  { id: 'history', label: 'History Archive', icon: Archive },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('studio');
  const [settings, setSettings] = useState<StudioSettings>(INITIAL_SETTINGS);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(CURATED_SHOWCASE[1]);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);

  // History state loaded from localStorage, pre-seeded with showcase pieces
  const [history, setHistory] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load history from storage:', e);
    }
    return CURATED_SHOWCASE;
  });

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist history:', e);
    }
  }, [history]);

  const handleUpdateSettings = useCallback((updated: Partial<StudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleImageGenerated = useCallback((newImage: GeneratedImage) => {
    setHistory((prev) => [newImage, ...prev]);
    setCurrentImage(newImage);
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setHistory((prev) =>
      prev.map((img) => (img.id === id ? { ...img, isFavorite: !img.isFavorite } : img))
    );
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setHistory((prev) => prev.filter((img) => img.id !== id));
    setCurrentImage((curr) => {
      if (curr?.id === id) {
        return history.find((img) => img.id !== id) || null;
      }
      return curr;
    });
  }, [history]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleRemixInStudio = useCallback((remixSettings: Partial<StudioSettings>) => {
    handleUpdateSettings(remixSettings);
    setActiveTab('studio');
  }, [handleUpdateSettings]);

  const handleOpenInCanvas = useCallback((image: GeneratedImage) => {
    setCurrentImage(image);
    setActiveTab('canvas');
  }, []);

  const handleSendToStudioAsReference = useCallback((dataUrl: string, name: string) => {
    handleUpdateSettings({
      referenceImage: dataUrl,
      referenceName: name,
    });
    setActiveTab('studio');
  }, [handleUpdateSettings]);

  // Screen to Screen navigation helpers
  const currentScreenIndex = SCREENS.findIndex((s) => s.id === activeTab);
  const prevScreen = currentScreenIndex > 0 ? SCREENS[currentScreenIndex - 1] : null;
  const nextScreen = currentScreenIndex < SCREENS.length - 1 ? SCREENS[currentScreenIndex + 1] : null;

  const handleGoToPrevScreen = () => {
    if (prevScreen) setActiveTab(prevScreen.id);
  };

  const handleGoToNextScreen = () => {
    if (nextScreen) setActiveTab(nextScreen.id);
  };

  // Voice commands setup
  const voiceCommands: VoiceCommand[] = useMemo(
    () => [
      {
        command: 'go to studio',
        description: 'Navigate to Image Studio',
        action: () => setActiveTab('studio'),
      },
      {
        command: 'studio',
        description: 'Navigate to Image Studio',
        action: () => setActiveTab('studio'),
      },
      {
        command: 'go to canvas',
        description: 'Navigate to Canvas Suite',
        action: () => setActiveTab('canvas'),
      },
      {
        command: 'canvas',
        description: 'Navigate to Canvas Suite',
        action: () => setActiveTab('canvas'),
      },
      {
        command: 'go to voice studio',
        description: 'Navigate to Voice Studio',
        action: () => setActiveTab('voice'),
      },
      {
        command: 'voice studio',
        description: 'Navigate to Voice Studio',
        action: () => setActiveTab('voice'),
      },
      {
        command: 'voice',
        description: 'Navigate to Voice Studio',
        action: () => setActiveTab('voice'),
      },
      {
        command: 'prompt lab',
        description: 'Navigate to Prompt Lab',
        action: () => setActiveTab('lab'),
      },
      {
        command: 'lab',
        description: 'Navigate to Prompt Lab',
        action: () => setActiveTab('lab'),
      },
      {
        command: 'gallery',
        description: 'Open Curated Gallery',
        action: () => setActiveTab('gallery'),
      },
      {
        command: 'history',
        description: 'Open History Archive',
        action: () => setActiveTab('history'),
      },
      {
        command: 'open drawer',
        description: 'Open Studio Options Drawer',
        action: () => setDrawerOpen(true),
      },
      {
        command: 'options',
        description: 'Open Studio Options Drawer',
        action: () => setDrawerOpen(true),
      },
      {
        command: 'close drawer',
        description: 'Close Options Drawer',
        action: () => setDrawerOpen(false),
      },
    ],
    []
  );

  const handleTranscript = useCallback((text: string) => {
    // If voice modal is open, user can choose whether to apply. If listening directly in background, optionally append.
    console.log('Voice transcript received:', text);
  }, []);

  const voiceTools = useVoiceTools(handleTranscript, voiceCommands);

  // Keyboard navigation shortcuts (1-6 for screen jumps, [ ] for previous/next screen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === '1') setActiveTab('studio');
      if (e.key === '2') setActiveTab('canvas');
      if (e.key === '3') setActiveTab('voice');
      if (e.key === '4') setActiveTab('lab');
      if (e.key === '5') setActiveTab('gallery');
      if (e.key === '6') setActiveTab('history');
      if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setVoiceModalOpen((prev) => !prev);
      }
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setDrawerOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col font-sans selection:bg-amber-400/20 selection:text-amber-200 pb-24 md:pb-16">
      {/* Top Bar adhering to strict 3-zone contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenStatusModal={() => setStatusModalOpen(true)}
        onQuickGenerate={() => setActiveTab('studio')}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenVoiceTools={() => setVoiceModalOpen(true)}
        isListening={voiceTools.isListening}
        historyCount={history.length}
      />

      {/* Screen-to-Screen Breadcrumb & Quick Switcher Strip */}
      <nav aria-label="Screen Navigation" className="border-b border-slate-800/60 bg-[#070A10]/60 backdrop-blur-sm px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-slate-400 hidden sm:inline">Screen:</span>
            {SCREENS.map((screen, idx) => {
              const Icon = screen.icon;
              const isActive = activeTab === screen.id;
              return (
                <React.Fragment key={screen.id}>
                  {idx > 0 && <span className="text-slate-600">/</span>}
                  <button
                    onClick={() => setActiveTab(screen.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-400/15 text-amber-300 font-semibold border border-amber-400/30 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{screen.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Quick Screen-to-Screen Step Buttons */}
          <div className="hidden sm:flex items-center gap-1 shrink-0 ml-4">
            <button
              onClick={handleGoToPrevScreen}
              disabled={!prevScreen}
              className={`p-1.5 rounded-md border flex items-center gap-1 transition-all ${
                prevScreen
                  ? 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-700 border-slate-900 cursor-not-allowed opacity-40'
              }`}
              title={prevScreen ? `Previous: ${prevScreen.label}` : 'No previous screen'}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden md:inline">Prev</span>
            </button>
            <button
              onClick={handleGoToNextScreen}
              disabled={!nextScreen}
              className={`p-1.5 rounded-md border flex items-center gap-1 transition-all ${
                nextScreen
                  ? 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-700 border-slate-900 cursor-not-allowed opacity-40'
              }`}
              title={nextScreen ? `Next: ${nextScreen.label}` : 'No next screen'}
            >
              <span className="text-[11px] hidden md:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <main className="flex-1 w-full">
        {activeTab === 'studio' && (
          <PromptStudio
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onImageGenerated={handleImageGenerated}
            onOpenCanvas={handleOpenInCanvas}
            currentImage={currentImage}
            onSetCurrentImage={setCurrentImage}
          />
        )}

        {activeTab === 'canvas' && (
          <CanvasEditor
            image={currentImage}
            onSendToStudioAsReference={handleSendToStudioAsReference}
            onOpenStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceStudio
            currentImage={currentImage}
            onSendToStudioPrompt={(promptText) => {
              handleUpdateSettings({ prompt: promptText });
              setActiveTab('studio');
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'lab' && (
          <PromptLab
            onApplySettingsToStudio={handleUpdateSettings}
            onOpenStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'gallery' && (
          <CuratedGallery
            onRemixInStudio={handleRemixInStudio}
            onOpenInCanvas={handleOpenInCanvas}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onToggleFavorite={handleToggleFavorite}
            onDeleteImage={handleDeleteImage}
            onClearHistory={handleClearHistory}
            onRemixInStudio={handleRemixInStudio}
            onOpenInCanvas={handleOpenInCanvas}
            onOpenStudio={() => setActiveTab('studio')}
          />
        )}
      </main>

      {/* Floating Button Navs / Bottom Dock */}
      <NavigationDock
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenVoiceTools={() => setVoiceModalOpen(true)}
        onOpenDrawer={() => setDrawerOpen(true)}
        historyCount={history.length}
        isListening={voiceTools.isListening}
      />

      {/* Slide-out Options Drawer */}
      <StudioDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenVoiceTools={() => {
          setDrawerOpen(false);
          setVoiceModalOpen(true);
        }}
        onOpenStatusModal={() => {
          setDrawerOpen(false);
          setStatusModalOpen(true);
        }}
        onClearHistory={handleClearHistory}
        historyCount={history.length}
      />

      {/* Voice Tools Modal (STT Dictation, Speech Waveform, AI Critic Audio) */}
      <VoiceToolsModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        isListening={voiceTools.isListening}
        onToggleListening={voiceTools.toggleListening}
        transcript={voiceTools.transcript}
        interimTranscript={voiceTools.interimTranscript}
        isSpeaking={voiceTools.isSpeaking}
        onSpeak={voiceTools.speakText}
        onStopSpeaking={voiceTools.stopSpeaking}
        onApplyPrompt={(text) => {
          handleUpdateSettings({ prompt: text });
          setActiveTab('studio');
        }}
        onEnhanceAndSpeak={() => {
          // Speak current prompt aloud
          voiceTools.speakText(`Synthesizing visual scene: ${settings.prompt}`);
        }}
        currentImage={currentImage}
        availableVoices={voiceTools.availableVoices}
        selectedVoice={voiceTools.selectedVoice}
        onSelectVoice={voiceTools.setSelectedVoice}
        volumeLevel={voiceTools.volumeLevel}
        onOpenVoiceStudio={() => setActiveTab('voice')}
      />

      {/* Gemini Engine Status Modal */}
      <StatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </div>
  );
}
