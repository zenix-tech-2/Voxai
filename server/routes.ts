import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { VOICES_CATALOG } from './voiceData';
import {
  synthesizeVoiceSpeech,
  transcribeAudioData,
  analyzeVoiceForCloning,
} from './voiceService';

dotenv.config();

export const apiRouter = Router();

// Initialize GoogleGenAI instance with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & Status endpoint
apiRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    freeTierAvailable: true,
    supportedEngines: [
      { id: 'flux', name: 'Flux Neural Cloud', free: true, description: 'Photorealistic & cinematic rendering' },
      { id: 'turbo', name: 'SDXL Turbo Fast', free: true, description: 'High-speed instant generation' },
      { id: 'anime', name: 'Anime Masterpiece', free: true, description: 'Japanese animation & digital illustration' },
      { id: 'pixel', name: '16-Bit Pixel Art', free: true, description: 'Retro video game & isometric sprites' },
      { id: 'svg', name: 'Gemini 3.8 Flash Vector', free: true, description: 'Scalable SVG vector graphics' },
      { id: 'gemini', name: 'Gemini 3.1 Studio', free: false, description: 'Requires paid Google Cloud API key' },
    ],
  });
});

// Multi-Model Free Image Generation Endpoint (100% Free · No API key needed)
apiRouter.post('/free-generate-image', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      style,
      lighting,
      model = 'flux', // 'flux' | 'turbo' | 'anime' | 'pixel'
      negativePrompt,
      seed = Math.floor(Math.random() * 10000000),
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Valid prompt is required' });
      return;
    }

    // Determine target dimensions based on aspect ratio
    let width = 1024;
    let height = 1024;
    if (aspectRatio === '16:9') {
      width = 1280;
      height = 720;
    } else if (aspectRatio === '9:16') {
      width = 720;
      height = 1280;
    } else if (aspectRatio === '4:3') {
      width = 1024;
      height = 768;
    } else if (aspectRatio === '3:4') {
      width = 768;
      height = 1024;
    }

    let fullPrompt = prompt.trim();
    const modifiers: string[] = [];

    // Engine-specific stylistic prompts
    if (model === 'anime') {
      modifiers.push('Japanese anime style, Makoto Shinkai aesthetic, Studio Ghibli quality, clean line art, vibrant color palettes');
    } else if (model === 'pixel') {
      modifiers.push('16-bit retro pixel art, crisp pixels, video game sprite, dithering, clean isometric geometry');
    }

    if (style && !fullPrompt.toLowerCase().includes(style.toLowerCase())) {
      modifiers.push(`${style} style`);
    }
    if (lighting && !fullPrompt.toLowerCase().includes(lighting.toLowerCase())) {
      modifiers.push(`${lighting} lighting`);
    }
    if (modifiers.length > 0) {
      fullPrompt = `${fullPrompt}, ${modifiers.join(', ')}`;
    }

    const encodedPrompt = encodeURIComponent(fullPrompt);
    const pollinationsModel = model === 'turbo' ? 'turbo' : 'flux';
    const targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=${pollinationsModel}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);

    const imageResponse = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeout);

    if (!imageResponse.ok) {
      throw new Error(`Free engine responded with HTTP ${imageResponse.status}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const engineNameMap: Record<string, string> = {
      flux: 'Flux Neural Cloud (Free)',
      turbo: 'SDXL Turbo Fast (Free)',
      anime: 'Anime Masterpiece (Free)',
      pixel: '16-Bit Pixel Art (Free)',
    };

    res.json({
      success: true,
      imageUrl: dataUrl,
      prompt: fullPrompt,
      aspectRatio,
      seed,
      engine: engineNameMap[model] || 'Flux Neural Cloud (Free)',
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Free image generation error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Free image generation timed out',
    });
  }
});

// Free Vector Art Generator using free-tier Gemini 3.8 Flash
apiRouter.post('/gemini/generate-svg', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1', style } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (!ai) {
      res.status(500).json({ error: 'Gemini API not configured' });
      return;
    }

    let viewBox = '0 0 800 800';
    if (aspectRatio === '16:9') viewBox = '0 0 1280 720';
    else if (aspectRatio === '9:16') viewBox = '0 0 720 1280';
    else if (aspectRatio === '4:3') viewBox = '0 0 1024 768';
    else if (aspectRatio === '3:4') viewBox = '0 0 768 1024';

    const systemInstruction = `You are a master digital vector illustrator.
Generate a complete, stunning, high-fidelity SVG illustration for the user's prompt.
Strict rules:
- Output ONLY the raw <svg>...</svg> element. No markdown backticks, no explanations, no text outside <svg>.
- Use viewBox="${viewBox}".
- Include rich gradients (<linearGradient>, <radialGradient>), complex layered paths, shadows, glowing filters, and intricate geometry.
- Theme: ${style || 'Modern Vector Art'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create an artistic SVG vector graphic of: ${prompt}`,
      config: {
        systemInstruction,
      },
    });

    let rawSvg = (response.text || '').trim();
    if (rawSvg.startsWith('```xml')) rawSvg = rawSvg.slice(6);
    if (rawSvg.startsWith('```svg')) rawSvg = rawSvg.slice(6);
    if (rawSvg.startsWith('```')) rawSvg = rawSvg.slice(3);
    if (rawSvg.endsWith('```')) rawSvg = rawSvg.slice(0, -3);
    rawSvg = rawSvg.trim();

    if (!rawSvg.includes('<svg') || !rawSvg.includes('</svg>')) {
      throw new Error('Model did not return valid SVG markup');
    }

    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;

    res.json({
      success: true,
      imageUrl: dataUrl,
      prompt,
      aspectRatio,
      engine: 'Gemini 3.8 Flash Vector (100% Free)',
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Generate SVG error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate SVG artwork',
    });
  }
});

// Prompt Enhancer endpoint (uses gemini-3.8-flash)
apiRouter.post('/gemini/enhance-prompt', async (req: Request, res: Response) => {
  try {
    const { prompt, style, lighting, camera } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Valid prompt text is required' });
      return;
    }

    if (!ai) {
      res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please check the Secrets panel.',
      });
      return;
    }

    const systemInstruction = `You are a master cinematic art director and generative AI prompt engineer for high-end digital art, studio photography, and conceptual visual design.
Given an initial user concept and optional style/lighting/camera hints, compose a rich, detailed, visually evocative image generation prompt that will produce maximum aesthetic impact.
Include rich sensory keywords: materials, lighting dynamics, atmospheric volumetric particles, color grading, focal depth, and compositional balance.
Avoid generic buzzwords like "hyperrealistic photorealistic 8k best quality" alone; focus on photographic lens specifics, precise optical effects, and tangible textural descriptors.`;

    const contents = `User Concept: "${prompt}"
Preferred Style: ${style || 'Cinematic Fine Art'}
Preferred Lighting: ${lighting || 'Natural Dramatic Light'}
Camera / Composition: ${camera || 'Eye-level 50mm Lens'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            enhancedPrompt: {
              type: Type.STRING,
              description: 'The polished, highly descriptive expanded generative prompt.',
            },
            styleKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key artistic movement and technique tags used.',
            },
            lightingAdvice: {
              type: Type.STRING,
              description: 'Specific illumination description used.',
            },
            cameraAdvice: {
              type: Type.STRING,
              description: 'Camera lens, angle, and framing rationale.',
            },
            recommendedNegativePrompt: {
              type: Type.STRING,
              description: 'Suggested negative prompt terms to eliminate artifacts.',
            },
          },
          required: ['enhancedPrompt', 'styleKeywords', 'recommendedNegativePrompt'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Enhance prompt error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to enhance prompt',
    });
  }
});

// Image-to-Prompt Analysis endpoint (reverse engineer image using gemini-3.8-flash)
apiRouter.post('/gemini/describe-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Image base64 data is required' });
      return;
    }

    if (!ai) {
      res.status(500).json({
        error: 'Gemini API key is not configured on the server.',
      });
      return;
    }

    const cleanBase64 = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text: 'Analyze this image and reconstruct the exact generative prompt that would create a visually similar image. Include subject description, artistic style, camera lens, color palette, lighting mood, and atmosphere.',
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedPrompt: {
              type: Type.STRING,
              description: 'Complete generative prompt describing the subject and aesthetic.',
            },
            detectedStyle: {
              type: Type.STRING,
              description: 'Dominant artistic medium or photography style.',
            },
            colorPalette: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key 3-5 hex colors or color names prominent in the image.',
            },
            lightingStyle: {
              type: Type.STRING,
              description: 'Type and direction of lighting.',
            },
          },
          required: ['extractedPrompt', 'detectedStyle', 'colorPalette'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Describe image error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze image',
    });
  }
});

// Optional Paid Gemini Image Generation endpoint
apiRouter.post('/gemini/generate-image', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      referenceImage,
      referenceMimeType = 'image/jpeg',
      style,
      lighting,
      negativePrompt,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (!ai) {
      res.status(500).json({
        error: 'Gemini API key is missing on the server. Please check the Secrets panel.',
      });
      return;
    }

    let fullPrompt = prompt.trim();
    const modifiers: string[] = [];
    if (style && !fullPrompt.toLowerCase().includes(style.toLowerCase())) {
      modifiers.push(`Style: ${style}`);
    }
    if (lighting && !fullPrompt.toLowerCase().includes(lighting.toLowerCase())) {
      modifiers.push(`Lighting: ${lighting}`);
    }
    if (negativePrompt) {
      modifiers.push(`Avoid: ${negativePrompt}`);
    }
    if (modifiers.length > 0) {
      fullPrompt = `${fullPrompt}. [${modifiers.join(', ')}]`;
    }

    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const safeAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    let response;

    if (referenceImage) {
      const cleanBase64 = referenceImage.includes(',')
        ? referenceImage.split(',')[1]
        : referenceImage;

      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: referenceMimeType,
              },
            },
            {
              text: fullPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: safeAspectRatio as any,
          },
        },
      });
    } else {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: fullPrompt,
        config: {
          imageConfig: {
            aspectRatio: safeAspectRatio as any,
          },
        },
      });
    }

    let generatedImageUrl: string | null = null;
    let textFeedback: string | null = null;

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const base64EncodeString: string = part.inlineData.data;
        const mime = part.inlineData.mimeType ?? 'image/png';
        generatedImageUrl = `data:${mime};base64,${base64EncodeString}`;
        break;
      } else if (part.text) {
        textFeedback = part.text;
      }
    }

    if (!generatedImageUrl) {
      res.status(502).json({
        success: false,
        error:
          textFeedback ||
          'The model did not return image data. Check if safety filters or prompt boundaries were triggered.',
      });
      return;
    }

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      aspectRatio: safeAspectRatio,
      prompt: fullPrompt,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Generate image error:', error);
    const message = error?.message || 'Failed to generate image';
    const isBillingError =
      message.includes('RESOURCE_EXHAUSTED') ||
      message.includes('billing') ||
      message.includes('429') ||
      message.includes('PERMISSION_DENIED');

    res.status(500).json({
      success: false,
      error: message,
      isBillingError,
    });
  }
});

// Voice Suite: List 16+ Realistic Human Voices
apiRouter.get('/voice/voices', (_req: Request, res: Response) => {
  res.json({
    success: true,
    voices: VOICES_CATALOG,
    count: VOICES_CATALOG.length,
  });
});

// Voice Suite: Text-to-Speech (Supports up to 5 minutes long-form audio with auto-chunking & WAV concatenation)
apiRouter.post('/voice/tts', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceId = 'kore',
      customStyle,
      speakerName,
      emotion = 'natural',
      speed = 1.0,
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ success: false, error: 'Text prompt is required for speech synthesis' });
      return;
    }

    const result = await synthesizeVoiceSpeech(ai, {
      text,
      voiceId,
      customStyle,
      speakerName,
      emotion,
      speed,
    });

    res.json({
      success: true,
      audioUrl: `data:${result.mimeType};base64,${result.audioBase64}`,
      durationSec: result.durationSec,
      wordCount: result.wordCount,
      chunksCount: result.chunksCount,
      voice: result.voice,
    });
  } catch (error: any) {
    console.error('Speech synthesis error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to synthesize speech',
      fallbackAvailable: true,
    });
  }
});

// Voice Suite: Speech-to-Text Transcription via neural analyzer
apiRouter.post('/voice/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;

    if (!audioData) {
      res.status(400).json({ success: false, error: 'Audio data is required' });
      return;
    }

    const result = await transcribeAudioData(ai, audioData, mimeType);
    res.json({
      success: true,
      transcript: result.transcript,
      wordCount: result.wordCount,
    });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to transcribe audio',
    });
  }
});

// Voice Suite: Voice Cloning & Acoustic DNA Analyzer
apiRouter.post('/voice/clone', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType = 'audio/webm', name = 'Custom Clone' } = req.body;

    if (!audioData) {
      res.status(400).json({ success: false, error: 'Audio recording sample is required for cloning' });
      return;
    }

    const analysis = await analyzeVoiceForCloning(ai, audioData, mimeType, name);
    res.json({
      success: true,
      profile: {
        id: `clone-${Date.now()}`,
        name: analysis.name,
        displayName: `${analysis.name} · Cloned Persona`,
        gender: 'non-binary',
        category: 'cloned',
        accent: analysis.accent,
        baseGeminiVoice: analysis.baseGeminiVoice,
        stylePrompt: analysis.voiceDesignPrompt,
        tagline: analysis.summary,
        description: `Cloned voice profile: ${analysis.timbre}, ${analysis.pitch}, with ${analysis.cadence}.`,
        previewText: 'Hello, this is my cloned neural voice speaking. The acoustic timbre matches my reference calibration sample.',
        avatarColor: 'from-emerald-400 to-cyan-500',
        timbre: analysis.timbre,
        pitch: analysis.pitch,
        cadence: analysis.cadence,
        createdAt: Date.now(),
      },
    });
  } catch (error: any) {
    console.error('Voice clone analysis error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to clone voice',
    });
  }
});

// Art Director Verbal Critique Endpoint
apiRouter.post('/critique-art', async (req: Request, res: Response) => {
  try {
    const { prompt, style = 'cinematic', aspectRatio = '16:9' } = req.body;

    if (!ai) {
      res.json({
        success: true,
        critique: `This visual composition leverages a ${aspectRatio} frame with ${style} aesthetic direction. Notice the intentional balance of lighting gradients and textural contrast.`,
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide a succinct, 2-to-3 sentence spoken art critique of this creative concept:
Prompt: "${prompt}"
Style: "${style}"
Aspect Ratio: "${aspectRatio}"
Speak with the poise and refined insight of a world-class gallery curator or museum director. Mention composition, light quality, and atmosphere. Keep it under 65 words.`,
    });

    const critique = (response.text || '').trim();
    res.json({
      success: true,
      critique,
    });
  } catch (error: any) {
    console.error('Art critique error:', error);
    res.json({
      success: true,
      critique: 'The composition showcases refined atmospheric presence, directional lighting, and delicate textural contrast across the frame.',
    });
  }
});

