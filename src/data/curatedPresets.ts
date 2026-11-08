import { AspectRatio, GeneratedImage } from '../types';

export interface StylePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  promptModifier: string;
  negativeModifier: string;
}

export interface LightingPreset {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
}

export interface CameraPreset {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
}

export const ASPECT_RATIOS: { id: AspectRatio; label: string; iconRatio: string; desc: string }[] = [
  { id: '1:1', label: '1:1', iconRatio: 'w-4 h-4', desc: 'Square · Universal' },
  { id: '16:9', label: '16:9', iconRatio: 'w-6 h-3.5', desc: 'Landscape · Cinema' },
  { id: '9:16', label: '9:16', iconRatio: 'w-3.5 h-6', desc: 'Portrait · Mobile' },
  { id: '4:3', label: '4:3', iconRatio: 'w-5 h-4', desc: 'Classic · Gallery' },
  { id: '3:4', label: '3:4', iconRatio: 'w-4 h-5', desc: 'Editorial · Book' },
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cinematic-photo',
    name: 'Cinematic Photorealism',
    category: 'Photography',
    description: 'Ultra-detailed 35mm film texture with authentic depth of field',
    promptModifier: 'cinematic photography, 35mm film look, photorealistic, subtle grain, atmospheric depth, 8k resolution',
    negativeModifier: 'cgi, cartoon, illustration, oversaturated plastic, artificial rendering',
  },
  {
    id: 'cyberpunk-noir',
    name: 'Cyberpunk Noir',
    category: 'Sci-Fi',
    description: 'Neon-drenched rain reflections, volumetric smog, and sleek bionics',
    promptModifier: 'cyberpunk noir aesthetic, neon reflections on wet asphalt, volumetric mist, high-contrast cyan and magenta shadows',
    negativeModifier: 'sunny, daylight, cheerful, pastel colors, washed out',
  },
  {
    id: 'analog-film',
    name: 'Kodachrome 1970s',
    category: 'Vintage',
    description: 'Warm nostalgic tones, tactile film grain, and rich organic saturation',
    promptModifier: 'vintage 1970s Kodachrome film stock, analog grain, warm golden amber saturation, Leica optics',
    negativeModifier: 'digital, harsh HDR, modern sterile clean look, cold blues',
  },
  {
    id: 'surreal-minimal',
    name: 'Surreal Architecture',
    category: 'Fine Art',
    description: 'Clean sculptural geometry suspended in dreamlike tranquil environments',
    promptModifier: 'surreal minimalist architectural photography, ethereal horizon, marble monolith, sculptural form, serene mood',
    negativeModifier: 'cluttered, chaotic, noisy, low resolution, messy',
  },
  {
    id: 'macro-biolum',
    name: 'Bioluminescent Macro',
    category: 'Nature',
    description: 'Intricate glowing crystalline structures and microscopic stardust',
    promptModifier: 'macro photography, bioluminescent glow, intricate crystalline details, studio lighting, deep jewel tones',
    negativeModifier: 'blurry, out of focus, flat lighting, muddy colors',
  },
  {
    id: 'concept-matte',
    name: 'Epic Concept Art',
    category: 'Illustration',
    description: 'Grand scale matte painting with painterly brushwork and dramatic scale',
    promptModifier: 'concept art matte painting, monumental scale, cinematic lighting, ArtStation trending quality',
    negativeModifier: 'amateur, photo watermark, flat composition, distorted perspective',
  },
  {
    id: 'studio-portrait',
    name: 'High Fashion Studio',
    category: 'Fashion',
    description: 'Precision beauty dish illumination with immaculate skin micro-textures',
    promptModifier: 'high fashion editorial studio portrait, dramatic beauty dish lighting, clean backdrop, Hasselblad medium format',
    negativeModifier: 'distorted anatomy, low res, plastic skin blur, bad hands',
  },
];

export const LIGHTING_PRESETS: LightingPreset[] = [
  {
    id: 'natural',
    name: 'Natural Daylight',
    description: 'Soft diffused morning illumination',
    promptModifier: 'soft diffused natural daylight, delicate ambient shadows',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm low-angle sunset glow with long shadows',
    promptModifier: 'warm golden hour sunlight, long dramatic shadows, atmospheric amber haze',
  },
  {
    id: 'volumetric-fog',
    name: 'Volumetric Fog',
    description: 'God rays cutting through dense atmospheric mist',
    promptModifier: 'volumetric god rays streaming through dense atmospheric mist and dust particles',
  },
  {
    id: 'studio-rim',
    name: 'Studio Rim Light',
    description: 'Crisp outline edge light separating subject from background',
    promptModifier: 'dual studio rim lighting, crisp edge separation, dark moody backdrop',
  },
  {
    id: 'chiaroscuro',
    name: 'Dramatic Chiaroscuro',
    description: 'Caravaggio-inspired extreme contrast between light and dark',
    promptModifier: 'Caravaggio chiaroscuro lighting, deep black shadows, high contrast directional beam',
  },
  {
    id: 'neon-ambient',
    name: 'Neon Ambient',
    description: 'Vibrant dual-toned neon backlight reflections',
    promptModifier: 'vibrant neon ambient glow, magenta and cyan edge highlights',
  },
];

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'portrait-85mm',
    name: '85mm Portrait (f/1.4)',
    description: 'Flattering compression with creamy optical bokeh',
    promptModifier: 'shot on 85mm f/1.4 lens, shallow depth of field, creamy smooth bokeh',
  },
  {
    id: 'wide-24mm',
    name: '24mm Ultra-Wide',
    description: 'Expansive field of view with dynamic foreground presence',
    promptModifier: 'shot on 24mm wide angle lens, expansive environmental perspective, immersive depth',
  },
  {
    id: 'macro-100mm',
    name: '100mm Macro Close-Up',
    description: 'Extreme microscopic detail on surface textures',
    promptModifier: '100mm macro lens, ultra-fine microscopic surface texture, extreme close-up',
  },
  {
    id: 'drone-aerial',
    name: 'Aerial Drone 45°',
    description: 'Elevated cinematic top-down viewpoint',
    promptModifier: 'cinematic aerial drone shot, 45-degree angle bird eye view, breathtaking landscape scale',
  },
  {
    id: 'vintage-anamorphic',
    name: 'Anamorphic Cinema',
    description: 'Widescreen horizontal flare and cinematic oval bokeh',
    promptModifier: 'anamorphic cinema lens, subtle horizontal blue lens flares, cinematic optical distortion',
  },
];

export const CREATIVE_SPARKS: string[] = [
  'A solitary glass observatory on the edge of a snow-covered Icelandic glacier under a swirling emerald aurora borealis.',
  'An ancient Japanese tea master preparing matcha in a moss-covered zen courtyard while cherry blossom petals drift in slow motion.',
  'A retro-futuristic hovercraft delivery van parked beside a neon noodle bar in a rainy Tokyo backstreet.',
  'A crystal terrarium floating in zero gravity inside a sunlit orbital greenhouse with blooming bioluminescent orchids.',
  'An ethereal ceramic sculpture of an abstract deer merging with twisted oak roots in an autumn misty forest.',
  'A vintage 1968 Alfa Romeo prototype parked in front of a brutalist concrete villa along the Mediterranean coast at twilight.',
  'A macro close-up of a chameleon made of iridescent stained glass and brass clockwork gears.',
];

// Curated Masterpiece Showcase (utilizing the pristine generated assets)
export const CURATED_SHOWCASE: GeneratedImage[] = [
  {
    id: 'showcase-1',
    url: '/src/assets/images/cyberpunk_neon_portrait_1794095058032.jpg',
    prompt: 'Hyper-detailed cinematic portrait of a cybernetic warrior woman with glowing neon copper ocular implants, rainy Tokyo alley reflections, iridescent rain slicker, atmospheric volumetric fog, Hasselblad 80mm lens, photorealistic 8k render',
    style: 'Cyberpunk Noir',
    lighting: 'Neon Ambient',
    camera: '85mm Portrait (f/1.4)',
    aspectRatio: '1:1',
    createdAt: 1794095058000,
    isFavorite: true,
    model: 'gemini-3.1-flash-lite-image',
    source: 'curated',
  },
  {
    id: 'showcase-2',
    url: '/src/assets/images/surreal_astral_solitude_1794095058217.jpg',
    prompt: 'Surreal architectural photography of a floating minimalist marble pavilion in a calm violet cosmic ocean under twin crescent moons, soft ethereal ambient light, long exposure water, Hasselblad medium format',
    style: 'Surreal Architecture',
    lighting: 'Moody Chiaroscuro',
    camera: '24mm Ultra-Wide',
    aspectRatio: '16:9',
    createdAt: 1794095058200,
    isFavorite: true,
    model: 'gemini-3.1-flash-lite-image',
    source: 'curated',
  },
  {
    id: 'showcase-3',
    url: '/src/assets/images/botanical_glass_terrarium_1794095059188.jpg',
    prompt: 'Macro photography of an intricate glowing bioluminescent crystal bonsai tree encased inside a blown glass sphere with tiny floating stardust particles, studio lighting, deep emerald and amber tones, ultra-fine texture',
    style: 'Bioluminescent Macro',
    lighting: 'Studio Rim Light',
    camera: '100mm Macro Close-Up',
    aspectRatio: '1:1',
    createdAt: 1794095059100,
    isFavorite: true,
    model: 'gemini-3.1-flash-lite-image',
    source: 'curated',
  },
  {
    id: 'showcase-4',
    url: '/src/assets/images/vintage_racing_supercar_1794095059491.jpg',
    prompt: 'Cinematic tracking shot of a 1970s prototype aerodynamic concept racecar speeding through the Italian Amalfi coast cliffs at dusk, motion blur wheels, warm golden light, vintage 35mm film grain, Kodachrome color grading',
    style: 'Kodachrome 1970s',
    lighting: 'Golden Hour',
    camera: 'Anamorphic Cinema',
    aspectRatio: '16:9',
    createdAt: 1794095059400,
    isFavorite: true,
    model: 'gemini-3.1-flash-lite-image',
    source: 'curated',
  },
];
