# Lumen Studio — Premium AI Visual Synthesizer & Creative Suite

An interactive AI image generation studio and creative post-processing canvas suite built with React 19, Vite, Tailwind CSS, and Node.js.

---

## ⚡ 100% Free & Zero-Cost Capabilities

Lumen Studio is configured out-of-the-box with powerful **zero-cost creative tools** that do not require any paid API keys or subscriptions:

1. **Multi-Model Free Image Engines**:
   - **Flux Neural Cloud**: High-fidelity photorealistic & fine art generation.
   - **SDXL Turbo Fast**: Instant 1-second generative rendering.
   - **Anime Masterpiece**: Japanese animation & Studio Ghibli aesthetic.
   - **16-Bit Pixel Art**: Retro video game isometric sprites.
   - **Gemini 3.8 Flash Vector**: Scalable SVG vector artwork generated via Google AI Studio's free tier.

2. **Creative Studio Post-Processing Suite**:
   - **AI Super-Resolution Upscaler (2X / 4X)**: Enhances pixel density, clarifies fine edges, and produces print-ready 4096px files.
   - **Background Cutout & Studio Isolator**: Real-time subject segmentation with customizable backdrops (Transparent PNG, Studio White, Obsidian Black, Cyber Gradient).
   - **Magic Retouch & Spot Eraser**: Interactive canvas brush to paint over and content-aware blend away unwanted elements and blemishes.
   - **Poster & Magazine Typography Layouts**: 1-click layouts including *Vogue Editorial Masthead, Cinema 2.39:1 Subtitles, Vintage Polaroid, Cyberpunk HUD, and Parental Advisory Album Art*.
   - **Hardware Color Grading & LUTs**: Live exposure, contrast, saturation, color temperature, vignette, film grain, and soft lens blur.
   - **1-Click Batch ZIP Archive**: Download your entire generation history and prompt recipes in a single organized ZIP package.
   - **4X Variation Matrix**: Synthesize 4 distinct quadrant variations in parallel with 1 click.

---

## 🚀 Deploying to Vercel

This repository is **100% Vercel Ready** with pre-configured `vercel.json` and modular serverless handlers in `api/index.ts`.

### 1-Click GitHub Import
1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "Deploy Lumen Studio"
   git push origin main
   ```
2. Log into [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository and click **Deploy**.
   - **Framework Preset**: Vite (detected automatically).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. *(Optional)* Add `GEMINI_API_KEY` under Project Settings > Environment Variables if you want Gemini AI Art Direction enabled on your production deployment. The free Flux and canvas tools work with zero environment variables!

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local full-stack dev server
npm run dev
```

Server runs at `http://localhost:3000`.
