import React, { useState, useRef } from 'react';
import { VideoProject, ExportSettings } from '../../types/videoEditor';
import { VideoExporter, ExportProgress } from '../../utils/videoExporter';
import {
  Download,
  X,
  Loader2,
  CheckCircle2,
  Film,
  Sparkles,
  Settings,
  HardDrive,
  AlertCircle,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  project: VideoProject;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  project,
  onClose,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [fps, setFps] = useState<30 | 60>(30);
  const [quality, setQuality] = useState<'high' | 'ultra' | 'medium'>('high');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [exportedResult, setExportedResult] = useState<{
    url: string;
    filename: string;
    sizeMB: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const exporterRef = useRef<VideoExporter | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    setExportedResult(null);

    const settings: ExportSettings = {
      format: 'webm',
      resolution,
      fps,
      quality,
    };

    const exporter = new VideoExporter();
    exporterRef.current = exporter;

    try {
      const result = await exporter.exportVideo(project, settings, (p) => {
        setProgress(p);
      });

      const sizeMB = (result.blob.size / (1024 * 1024)).toFixed(2);
      setExportedResult({
        url: result.url,
        filename: result.filename,
        sizeMB,
      });

      // Auto trigger download
      const a = document.createElement('a');
      a.href = result.url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      if (err?.message !== 'Exportation annulée par l\'utilisateur') {
        setErrorMessage(err?.message || 'Erreur lors du rendu vidéo.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    if (exporterRef.current) {
      exporterRef.current.cancel();
    }
    setIsExporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Exporter la Vidéo Finale</h3>
              <p className="text-xs text-slate-400">
                Rendu 100% gratuit dans le navigateur (Sans filigrane)
              </p>
            </div>
          </div>
          {!isExporting && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {!isExporting && !exportedResult && (
            <>
              {/* Resolution options */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Résolution de Sortie
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '720p', label: '720p HD', desc: 'Rendu Rapide' },
                    { id: '1080p', label: '1080p Full HD', desc: 'Standard Broadcast' },
                    { id: '4k', label: '4K Ultra HD', desc: 'Qualité Maximale' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setResolution(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        resolution === item.id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{item.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Framerate & Quality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Images par Seconde (FPS)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[30, 60].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFps(f as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          fps === f
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {f} FPS
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Qualité d'Encodage
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="high">Haute (6 Mbps)</option>
                    <option value="ultra">Ultra Cinématographique (12 Mbps)</option>
                    <option value="medium">Moyenne (3 Mbps)</option>
                  </select>
                </div>
              </div>

              {/* Summary pill */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>Format : WebM / MP4 H.264 compatible</span>
                <span className="font-mono text-cyan-400">
                  Durée : {Math.round(project.duration)}s
                </span>
              </div>
            </>
          )}

          {/* Export in Progress State */}
          {isExporting && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Rendu de la Vidéo en Cours...</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Composition des pistes audio, filtres, transitions et sous-titres animés.
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 max-w-sm mx-auto">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Progression</span>
                  <span className="text-cyan-400 font-bold">{progress?.percent || 0}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-150 rounded-full"
                    style={{ width: `${progress?.percent || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>
                    Image {progress?.currentFrame || 0} / {progress?.totalFrames || 0}
                  </span>
                  <span>Temps écoulé : {progress?.elapsedSeconds || 0}s</span>
                </div>
              </div>
            </div>
          )}

          {/* Export Completed State */}
          {exportedResult && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Exportation Réussie !</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Le fichier a été téléchargé sur votre appareil ({exportedResult.sizeMB} Mo).
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <a
                  href={exportedResult.url}
                  download={exportedResult.filename}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger à Nouveau</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!exportedResult && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isExporting ? 'Annuler' : 'Fermer'}
            </button>

            {!isExporting && (
              <button
                type="button"
                onClick={handleStartExport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Lancer le Rendu ({resolution})</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
