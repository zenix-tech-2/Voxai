import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

// roundRect is missing on older Android WebViews / Chrome < 99
if (typeof CanvasRenderingContext2D !== 'undefined' && !(CanvasRenderingContext2D.prototype as any).roundRect) {
  (CanvasRenderingContext2D.prototype as any).roundRect = function (
    x: number, y: number, w: number, h: number, r: number | number[] = 0
  ) {
    const rad = Math.max(0, Math.min(Array.isArray(r) ? r[0] ?? 0 : r, w / 2, h / 2));
    this.moveTo(x + rad, y);
    this.arcTo(x + w, y, x + w, y + h, rad);
    this.arcTo(x + w, y + h, x, y + h, rad);
    this.arcTo(x, y + h, x, y, rad);
    this.arcTo(x, y, x + w, y, rad);
    this.closePath();
  };
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary label="App">
    <App />
  </ErrorBoundary>
);
