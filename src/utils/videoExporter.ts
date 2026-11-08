import { VideoProject, ExportSettings } from '../types/videoEditor';
import { VideoRenderer, CANVAS_DIMENSIONS } from './videoRenderer';

export interface ExportProgress {
  percent: number; // 0 - 100
  currentFrame: number;
  totalFrames: number;
  elapsedSeconds: number;
}

export class VideoExporter {
  private isCancelled = false;

  cancel() {
    this.isCancelled = true;
  }

  async exportVideo(
    project: VideoProject,
    settings: ExportSettings,
    onProgress: (progress: ExportProgress) => void
  ): Promise<{ blob: Blob; url: string; filename: string }> {
    this.isCancelled = false;

    const baseDim = CANVAS_DIMENSIONS[project.aspectRatio] || CANVAS_DIMENSIONS['16:9'];
    let targetWidth = baseDim.width;
    let targetHeight = baseDim.height;

    // Scale resolution based on export settings
    if (settings.resolution === '720p') {
      targetWidth = Math.round(targetWidth * 0.666);
      targetHeight = Math.round(targetHeight * 0.666);
    } else if (settings.resolution === '4k') {
      targetWidth = Math.round(targetWidth * 2);
      targetHeight = Math.round(targetHeight * 2);
    }

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = targetWidth;
    offscreenCanvas.height = targetHeight;

    const renderer = new VideoRenderer(offscreenCanvas);

    const fps = settings.fps || 30;
    const duration = Math.max(1, project.duration);
    const totalFrames = Math.ceil(duration * fps);

    // Audio setup
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const dest = audioCtx.createMediaStreamDestination();

    // Stream capture from canvas
    const videoStream = offscreenCanvas.captureStream(fps);
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

    // MediaRecorder format selection
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/mp4';
    }

    const videoBits =
      settings.quality === 'ultra' ? 12000000 : settings.quality === 'high' ? 6000000 : 3000000;

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
      videoBitsPerSecond: videoBits,
    });

    const recordedChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.start(100);

    const startTime = performance.now();

    // Frame-by-frame stepping render loop
    for (let frame = 0; frame <= totalFrames; frame++) {
      if (this.isCancelled) {
        mediaRecorder.stop();
        throw new Error('Exportation annulée par l\'utilisateur');
      }

      const currentTime = (frame / totalFrames) * duration;
      renderer.renderFrame(project, currentTime, { showSafeAreas: false });

      const percent = Math.min(100, Math.round((frame / totalFrames) * 100));
      const elapsed = Math.round((performance.now() - startTime) / 1000);

      onProgress({
        percent,
        currentFrame: frame,
        totalFrames,
        elapsedSeconds: elapsed,
      });

      // Allow event loop to breathe and stream chunks
      await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
    }

    // Stop recorder and finalize Blob
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        try {
          const finalBlob = new Blob(recordedChunks, { type: mimeType });
          const url = URL.createObjectURL(finalBlob);
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const filename = `${project.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${ext}`;

          audioCtx.close().catch(() => {});
          resolve({ blob: finalBlob, url, filename });
        } catch (err) {
          reject(err);
        }
      };

      mediaRecorder.stop();
    });
  }
}
