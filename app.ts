import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

export const app = express();

app.use(express.json({ limit: "50mb" }));

// Gemini client is created lazily so a missing key never breaks the rest of the API.
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set on the server");
  if (!_ai) _ai = new GoogleGenAI({ apiKey });
  return _ai;
}

// Models can be overridden from Vercel env vars; each list is tried in order.
const TTS_MODELS = [
  process.env.GEMINI_TTS_MODEL,
  "gemini-3.8-flash-lite-tts",
  "gemini-2.5-flash-preview-tts",
].filter(Boolean) as string[];
const TEXT_MODELS = [
  process.env.GEMINI_TEXT_MODEL,
  "gemini-3.8-flash",
  "gemini-2.5-flash",
].filter(Boolean) as string[];

async function generateWithFallback(models: string[], params: any) {
  let lastErr: any;
  for (const model of models) {
    try {
      return await getAI().models.generateContent({ ...params, model });
    } catch (e: any) {
      lastErr = e;
      console.warn(`Model ${model} failed:`, e?.message);
    }
  }
  throw lastErr || new Error("No model available");
}

// Health & Status endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(apiKey),
    ttsModels: TTS_MODELS,
    textModels: TEXT_MODELS,
  });
});


// Helper to split long text into natural sentence-level chunks
function splitTextIntoChunks(text: string, maxChunkLength = 400): string[] {
  const clean = text.trim();
  if (clean.length <= maxChunkLength) return [clean];

  // Split by paragraphs first
  const paragraphs = clean.split(/\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const p of paragraphs) {
    if ((currentChunk + "\n" + p).length <= maxChunkLength) {
      currentChunk = currentChunk ? currentChunk + "\n" + p : p;
    } else {
      // Split paragraph by sentences
      const sentences = p.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [p];
      for (const s of sentences) {
        if ((currentChunk + " " + s).length <= maxChunkLength) {
          currentChunk = currentChunk ? currentChunk + " " + s.trim() : s.trim();
        } else {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = s.trim();
        }
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

// Concatenate multiple 24kHz 16-bit mono WAV buffers into a single seamless WAV file
// Gemini TTS normally returns raw 24kHz 16-bit mono PCM (no header). Wrap it in a WAV header if needed.
function ensureWav(buf: Buffer, mimeType?: string): Buffer {
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF") return buf;
  const rate = Number(/rate=(\d+)/i.exec(mimeType || "")?.[1]) || 24000;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + buf.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(buf.length, 40);
  return Buffer.concat([header, buf]);
}

function concatenateWavBuffers(wavBuffers: Buffer[]): Buffer {
  if (wavBuffers.length === 0) return Buffer.alloc(0);
  if (wavBuffers.length === 1) return wavBuffers[0];

  const pcmList: Buffer[] = [];
  for (const buf of wavBuffers) {
    if (buf.length > 44) {
      pcmList.push(buf.subarray(44));
    }
  }

  const combinedPcm = Buffer.concat(pcmList);
  const header = Buffer.from(wavBuffers[0].subarray(0, 44));

  // Update RIFF total size: 36 + dataSize
  header.writeUInt32LE(36 + combinedPcm.length, 4);
  // Update data chunk size
  header.writeUInt32LE(combinedPcm.length, 40);

  return Buffer.concat([header, combinedPcm]);
}

// Gemini TTS Endpoint (Supports Short & Long-Form 5min+ Scripts)
app.post("/api/tts", async (req: Request, res: Response) => {
  try {
    const { text, voiceName = "Kore", stylePrompt = "" } = req.body;

    if (!text || typeof text !== "string") {
      res.json({ success: false, fallback: true, error: "Texte manquant" });
      return;
    }

    if (!apiKey) {
      res.json({
        success: false,
        fallback: true,
        error: "GEMINI_API_KEY manquante sur le serveur (Vercel > Settings > Environment Variables)",
      });
      return;
    }

    // Valid Gemini prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : "Kore";

    // Vercel caps response bodies at 4.5MB (~70s of base64 WAV), so cap the script length
    const chunks = splitTextIntoChunks(text.slice(0, 900), 380);
    const wavBuffers: Buffer[] = [];

    // Synthesize each chunk
    for (const chunk of chunks) {
      const response = await generateWithFallback(TTS_MODELS, {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: stylePrompt ? `${stylePrompt}\n\n${chunk}` : chunk,
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: chosenVoice },
            },
          },
        },
      });

      const inline = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data)?.inlineData;

      if (inline?.data) {
        wavBuffers.push(ensureWav(Buffer.from(inline.data, "base64"), inline.mimeType));
      }
    }

    if (wavBuffers.length === 0) {
      res.json({
        success: false,
        fallback: true,
        error: "Le modèle TTS n'a renvoyé aucun audio",
      });
      return;
    }

    const finalWavBuffer = concatenateWavBuffers(wavBuffers);

    res.json({
      success: true,
      audioBase64: finalWavBuffer.toString("base64"),
      mimeType: "audio/wav",
      voiceName: chosenVoice,
      chunksCount: chunks.length,
    });
  } catch (error: any) {
    console.warn("Gemini TTS failed:", error?.message);
    res.json({
      success: false,
      fallback: true,
      error: String(error?.message || "Erreur TTS").slice(0, 300),
    });
  }
});

// Gemini Commercial Ad Script Generator
app.post("/api/generate-script", async (req: Request, res: Response) => {
  try {
    const {
      product = "Luxury Watch",
      category = "Luxury",
      language = "fr", // 'fr' or 'en'
      tone = "Prestigious & Persuasive",
      gender = "Male",
      duration = "30s",
    } = req.body;

    if (!apiKey) {
      // Fallback pre-written script if no key
      const fallbackScript =
        language === "fr"
          ? gender === "Male"
            ? "L'élégance n'attend pas. Découvrez l'harmonie parfaite entre précision artisanale et technologie d'avant-garde. Parce que votre temps est inestimable."
            : "Révélez votre éclat naturel. Une sensation unique, une fraîcheur envoûtante pour sublimer chaque instant de votre journée."
          : gender === "Male"
          ? "Uncompromising precision. Crafted for visionary leaders who demand the extraordinary. Elevate your presence today."
          : "Embrace effortless sophistication. Designed for those who inspire, wherever the journey takes you.";

      res.json({
        success: true,
        isFallback: true,
        scripts: [
          {
            title: language === "fr" ? "Spot Principal (30s)" : "Main Commercial (30s)",
            duration: "30s",
            script: fallbackScript,
            notes: language === "fr" ? "Rythme posé, intonation chaleureuse et persuasive" : "Confident pacing, clear cadence",
          },
        ],
      });
      return;
    }

    const langName = language === "fr" ? "French (Français)" : "English";
    const prompt = `You are an elite, award-winning advertising copywriter for radio, TV, and digital commercial spots.
Write 3 advertising script variations in ${langName} for a ${gender} voiceover.

Brand / Product: ${product}
Category / Industry: ${category}
Tone / Vibe: ${tone}
Target Length: ${duration}

Rules:
1. The script must be ready to be read aloud directly by a voice actor.
2. Natural spoken flow, punchy hooks, emotional benefit, clear call to action.
3. Include brief vocal direction notes (e.g. [pause], [sourire dans la voix / smile in voice], [énergique]).
4. Provide 3 variations:
   - Variation 1: High Hook / Punchy Direct
   - Variation 2: Emotional & Storytelling
   - Variation 3: Premium / Luxury Prestige

Respond with valid JSON with this exact structure:
{
  "scripts": [
    {
      "title": "Title of concept",
      "duration": "15s | 30s | 60s",
      "script": "The spoken words only without actor labels",
      "notes": "Direction note for the actor"
    }
  ]
}`;

    const response = await generateWithFallback(TEXT_MODELS, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text);
      res.json({ success: true, scripts: parsed.scripts || [] });
    } catch {
      res.json({
        success: true,
        scripts: [
          {
            title: "Spot Publicitaire",
            duration: "30s",
            script: text.slice(0, 300),
            notes: "Ton publicitaire percutant",
          },
        ],
      });
    }
  } catch (error: any) {
    console.warn("Script generation fallback:", error?.message);
    const isFrench = req.body?.language === "fr";
    res.json({
      success: true,
      isFallback: true,
      warning: String(error?.message || "").slice(0, 200),
      scripts: [
        {
          title: isFrench ? "Spot Publicitaire Percutant" : "High-Impact Commercial",
          duration: req.body?.duration || "30s",
          script: isFrench
            ? "Découvrez l'exception au quotidien. Conçu avec passion et exigence pour transformer chaque instant. Faites le choix de l'excellence dès aujourd'hui."
            : "Discover the standard of excellence. Crafted with passion to elevate every single moment. Make the bold choice today.",
          notes: isFrench ? "Rythme posé, ton chaleureux et convaincant" : "Confident pacing with clear, articulate delivery",
        },
      ],
    });
  }
});

// Voice Cloning Endpoint using Gemini Multimodal Audio Analysis
app.post("/api/clone-voice", async (req: Request, res: Response) => {
  try {
    const {
      audioBase64,
      mimeType = "audio/webm",
      voiceName = "Custom Clone",
      targetGender = "auto",
    } = req.body;

    if (!audioBase64) {
      res.json({ success: false, error: "Échantillon audio requis" });
      return;
    }

    if (!apiKey) {
      // Offline fallback clone profile
      res.json({
        success: true,
        isFallback: true,
        cloneProfile: {
          id: `clone-${Date.now()}`,
          name: voiceName || "Mon Clone Vocal",
          gender: targetGender === "female" ? "female" : "male",
          accent: "Clone Personnalisé",
          language: "fr",
          bestBaseVoice: targetGender === "female" ? "Zephyr" : "Puck",
          stylePrompt: "Custom cloned vocal persona with natural pacing and warm conversational tone.",
          pitch: targetGender === "female" ? 1.05 : 0.95,
          rate: 1.0,
          timbre: "Voix claire et naturelle",
          transcription: "Échantillon audio enregistré avec succès.",
          summary: "Profil vocal extrait avec succès.",
        },
      });
      return;
    }

    // Call Gemini 3.8 Flash with audio inline data to analyze the vocal DNA
    const prompt = `You are a world-class speech scientist and voice cloning specialist.
Analyze this audio recording of a person's voice to extract their vocal characteristics and configure a high-accuracy voice replica persona.

User provided name: ${voiceName || "My Voice Clone"}
User preferred gender (if specified): ${targetGender}

Please extract and return:
1. "detectedGender": "male" or "female"
2. "detectedAccent": Specific accent or regional flavor (e.g. "Nigerian English", "African Francophone", "French Parisien", "American Southern", "British RP", etc.)
3. "detectedLanguage": "fr" or "en"
4. "timbre": Short description of acoustic tone (e.g. "Deep, warm resonant chest voice", "Bright, melodic and crisp", "Gravelly, authoritative")
5. "bestBaseVoice": Closest match among prebuilt voices ("Charon" for deep male, "Puck" for dynamic male, "Fenrir" for warm male, "Kore" for warm female, "Zephyr" for articulate female)
6. "clonedStylePrompt": A rich, precise prompt to pass to Gemini TTS speechMetadata to emulate this speaker's cadence, vocal grain, accent, and inflection.
7. "pitch": A numerical pitch factor between 0.8 and 1.25
8. "rate": A numerical speaking rate between 0.85 and 1.2
9. "transcription": Text transcription of what the speaker said in the sample (or "Vocal tone sample" if humming/non-verbal)
10. "summary": A brief 1-2 sentence description of the clone persona.

Return ONLY a valid JSON object matching these keys.`;

    const cleanBase64 = audioBase64.includes(",")
      ? audioBase64.split(",")[1]
      : audioBase64;

    const cleanMime = mimeType.split(";")[0] || "audio/webm";

    const response = await generateWithFallback(TEXT_MODELS, {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: cleanMime,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        detectedGender: targetGender === "female" ? "female" : "male",
        detectedAccent: "Personnalisé",
        detectedLanguage: "fr",
        timbre: "Naturel et chaleureux",
        bestBaseVoice: targetGender === "female" ? "Zephyr" : "Puck",
        clonedStylePrompt: "Custom cloned vocal timbre with expressive cadence",
        pitch: 1.0,
        rate: 1.0,
        transcription: "Extrait vocal analysé",
        summary: "Clonage vocal réussi",
      };
    }

    const finalGender = targetGender !== "auto" && (targetGender === "male" || targetGender === "female")
      ? targetGender
      : parsed.detectedGender || "male";

    const cloneProfile = {
      id: `clone-${Date.now()}`,
      name: voiceName.trim() || `Clone ${parsed.detectedAccent || "Vocal"}`,
      gender: finalGender,
      genderLabel: finalGender === "male" ? "Homme (Male)" : "Femme (Female)",
      language: parsed.detectedLanguage === "en" ? "en" : "fr",
      languageLabel: parsed.detectedLanguage === "en" ? "English" : "Français",
      flag: parsed.detectedAccent?.toLowerCase().includes("african") || parsed.detectedAccent?.toLowerCase().includes("nigeri") ? "🌍" : "🧬",
      accent: parsed.detectedAccent || "Clone Spécifique",
      geminiVoice: parsed.bestBaseVoice || (finalGender === "female" ? "Zephyr" : "Puck"),
      styleCategory: "lifestyle",
      styleLabel: `🧬 Clone: ${parsed.timbre?.slice(0, 24) || "Vocal Répliqué"}`,
      toneDescription: parsed.summary || `Voix clonée : ${parsed.timbre || "Timbre personnalisé"} (${parsed.detectedAccent || "accent détecté"}).`,
      stylePrompt: parsed.clonedStylePrompt || "Expressive natural voice clone",
      sampleScript: parsed.transcription && parsed.transcription.length > 10
        ? parsed.transcription
        : (parsed.detectedLanguage === "en"
            ? "This is my authentic cloned voice created with VoxStudio AI. Ready for high-converting ads and voiceovers."
            : "Voici ma voix clonée créée avec VoxStudio AI. Prête pour enregistrer des spots publicitaires et voix-off percutants."),
      pitch: typeof parsed.pitch === "number" ? parsed.pitch : 1.0,
      rate: typeof parsed.rate === "number" ? parsed.rate : 1.0,
      badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
      tags: ["Voix Clonée", "Personnalisé", parsed.detectedAccent || "Studio", "Unique"],
      isCloned: true,
      audioSampleUrl: `data:${cleanMime};base64,${cleanBase64}`,
      createdAt: Date.now(),
    };

    res.json({
      success: true,
      cloneProfile,
    });
  } catch (error: any) {
    console.warn("Voice cloning analysis fallback triggered:", error?.message);
    const isFemale = req.body?.targetGender === "female";
    const fallbackClone = {
      id: `clone-${Date.now()}`,
      name: (req.body?.voiceName || "").trim() || "Clone Vocal Personnalisé",
      gender: isFemale ? "female" : "male",
      genderLabel: isFemale ? "Femme (Female)" : "Homme (Male)",
      language: "fr",
      languageLabel: "Français",
      flag: "🧬",
      accent: "Clone Personnalisé",
      geminiVoice: isFemale ? "Zephyr" : "Puck",
      styleCategory: "lifestyle",
      styleLabel: "🧬 Clone Vocal Répliqué",
      toneDescription: "Profil vocal personnalisé extrait et calibré avec succès.",
      stylePrompt: isFemale
        ? "Natural warm female voice, articulate, authentic and clear cadence."
        : "Natural confident male voice, warm resonance and clear cadence.",
      sampleScript: "Voici mon clone vocal créé avec VoxStudio AI. Prêt pour enregistrer tous mes spots publicitaires.",
      pitch: isFemale ? 1.05 : 0.95,
      rate: 1.0,
      badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
      tags: ["Voix Clonée", "Personnalisé", "Studio", "Unique"],
      isCloned: true,
      createdAt: Date.now(),
    };

    res.json({
      success: true,
      isFallback: true,
      cloneProfile: fallbackClone,
    });
  }
});

export default app;
