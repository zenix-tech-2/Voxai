import {
  StockMediaAsset,
  SoundEffectAsset,
  TextPreset,
  FilterPreset,
} from '../types/videoEditor';

// Curated high quality royalty-free stock footage assets
// Using resilient media links and rich canvas procedural backups
export const STOCK_MEDIA_ASSETS: StockMediaAsset[] = [
  // African Business, Cityscapes & Culture
  {
    id: 'stock-africa-lagos',
    title: 'Lagos Modern Skyline & Sunset',
    category: 'africa',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=1920&q=85',
    aspectRatio: '16:9',
    color: '#E06D53',
  },
  {
    id: 'stock-africa-safari',
    title: 'Kenya Serengeti Golden Savanna',
    category: 'africa',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=85',
    aspectRatio: '16:9',
    color: '#D4A373',
  },
  {
    id: 'stock-africa-tech',
    title: 'African Tech Innovator at Work',
    category: 'africa',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=85',
    aspectRatio: '16:9',
    color: '#2A9D8F',
  },

  // Tech & Innovation
  {
    id: 'stock-tech-digital',
    title: 'Futuristic AI Neon Data Streams',
    category: 'tech',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=85',
    aspectRatio: '16:9',
    color: '#00B4D8',
  },
  {
    id: 'stock-tech-mobile',
    title: 'Smartphone Mobile App Interaction',
    category: 'tech',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=1920&q=85',
    aspectRatio: '9:16',
    color: '#4361EE',
  },

  // Luxury & Premium
  {
    id: 'stock-lux-watch',
    title: 'Swiss Chronograph Luxury Watch',
    category: 'luxury',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=85',
    aspectRatio: '1:1',
    color: '#D4AF37',
  },
  {
    id: 'stock-lux-perfume',
    title: 'Haute Parfumerie Gold Flacon',
    category: 'luxury',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=85',
    aspectRatio: '4:5',
    color: '#F4A261',
  },

  // Retail & Fashion
  {
    id: 'stock-retail-fashion',
    title: 'Urban Streetwear Collection',
    category: 'retail',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=85',
    aspectRatio: '9:16',
    color: '#E76F51',
  },
  {
    id: 'stock-retail-sneaker',
    title: 'Commercial Sneaker Launch',
    category: 'retail',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1920&q=85',
    aspectRatio: '16:9',
    color: '#E63946',
  },

  // Abstract & Motion B-Roll
  {
    id: 'stock-abstract-gradient',
    title: 'Cyberpunk Fluid Dark Gradient',
    category: 'abstract',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=85',
    aspectRatio: '16:9',
    color: '#7209B7',
  },
  {
    id: 'stock-abstract-particles',
    title: 'Golden Cinematic Bokeh Dust',
    category: 'abstract',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507908708918-778587c9e563?w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1507908708918-778587c9e563?w=1920&q=85',
    aspectRatio: '16:9',
    color: '#E9C46A',
  },
];

// CapCut-Grade Text Presets
export const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'txt-tiktok-pop',
    name: 'TikTok Kinetic Subtitle',
    sample: 'NOUVEAU PRODUIT',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 52,
    textColor: '#FFFF00', // Yellow
    strokeColor: '#000000',
    strokeWidth: 8,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 10,
    animation: 'word-karaoke',
  },
  {
    id: 'txt-neon-cyber',
    name: 'Neon Cyber Glow',
    sample: 'EXCLUSIVITÉ 2026',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 48,
    textColor: '#00F0FF',
    strokeColor: '#003366',
    strokeWidth: 4,
    shadowColor: '#00F0FF',
    shadowBlur: 20,
    animation: 'pop',
  },
  {
    id: 'txt-minimal-clean',
    name: 'Minimal Clean Box',
    sample: 'Disponible maintenant',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 38,
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    animation: 'fade',
  },
  {
    id: 'txt-luxury-serif',
    name: 'Luxury Prestige Serif',
    sample: 'L\'Art de Vivre',
    fontFamily: 'serif',
    fontSize: 56,
    textColor: '#F5E6CA', // Champagne gold
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowBlur: 8,
    animation: 'slide-up',
  },
  {
    id: 'txt-lower-third',
    name: 'Bandeau Info Publicitaire',
    sample: '-50% SUR TOUT LE SITE',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 44,
    textColor: '#FFFFFF',
    backgroundColor: '#DC2626', // Red banner
    animation: 'bounce',
  },
  {
    id: 'txt-retro-80s',
    name: 'Retro 80s VHS Vibe',
    sample: 'PLAY ► 00:15:32',
    fontFamily: 'monospace',
    fontSize: 40,
    textColor: '#39FF14', // Neon green
    shadowColor: 'rgba(0,255,0,0.7)',
    shadowBlur: 12,
    animation: 'typewriter',
  },
];

// Color Grading & Cinematic Filter Presets
export const FILTER_PRESETS_CATALOG: {
  id: FilterPreset;
  name: string;
  description: string;
  cssFilter: string;
  accentColor: string;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    vignette: number;
    grain: number;
  };
}[] = [
  {
    id: 'none',
    name: 'Original (Neutre)',
    description: 'Aucune correction de couleur',
    cssFilter: 'none',
    accentColor: '#94A3B8',
    adjustments: { brightness: 0, contrast: 0, saturation: 0, warmth: 0, vignette: 0, grain: 0 },
  },
  {
    id: 'teal-orange',
    name: 'Teal & Orange Hollywood',
    description: 'Le look block-buster cinématique par excellence',
    cssFilter: 'contrast(1.25) saturate(1.35) hue-rotate(-10deg)',
    accentColor: '#0ea5e9',
    adjustments: { brightness: 5, contrast: 25, saturation: 35, warmth: 15, vignette: 30, grain: 10 },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Tokyo Night',
    description: 'Hautes lumières néon et contrastes profonds',
    cssFilter: 'contrast(1.4) saturate(1.6) hue-rotate(25deg)',
    accentColor: '#a855f7',
    adjustments: { brightness: -5, contrast: 40, saturation: 60, warmth: -20, vignette: 45, grain: 20 },
  },
  {
    id: 'vintage-film',
    name: 'Kodak Portra 400',
    description: 'Grain doux, tons chauds et textures argentiques',
    cssFilter: 'sepia(0.25) contrast(1.1) saturate(1.15) brightness(1.05)',
    accentColor: '#f59e0b',
    adjustments: { brightness: 5, contrast: 15, saturation: 15, warmth: 35, vignette: 35, grain: 35 },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour Sunset',
    description: 'Lumière dorée chaleureuse et enveloppante',
    cssFilter: 'sepia(0.35) saturate(1.4) contrast(1.1)',
    accentColor: '#eab308',
    adjustments: { brightness: 8, contrast: 15, saturation: 40, warmth: 45, vignette: 20, grain: 5 },
  },
  {
    id: 'noir-bw',
    name: 'Film Noir Noir & Blanc',
    description: 'Monochrome haute tension dramatique',
    cssFilter: 'grayscale(1) contrast(1.5) brightness(0.95)',
    accentColor: '#64748b',
    adjustments: { brightness: -5, contrast: 50, saturation: -100, warmth: 0, vignette: 50, grain: 40 },
  },
  {
    id: 'vibrant-pop',
    name: 'Vibrant Pop Commercial',
    description: 'Couleurs saturées percutantes pour la vente et pub',
    cssFilter: 'saturate(1.7) contrast(1.2)',
    accentColor: '#ec4899',
    adjustments: { brightness: 5, contrast: 20, saturation: 70, warmth: 5, vignette: 10, grain: 0 },
  },
  {
    id: 'retro-vhs',
    name: 'Cassette VHS 1995',
    description: 'Aberration chromatique et balayage analogique',
    cssFilter: 'contrast(1.2) saturate(1.25) brightness(1.1)',
    accentColor: '#10b981',
    adjustments: { brightness: 10, contrast: 20, saturation: 25, warmth: -10, vignette: 40, grain: 60 },
  },
  {
    id: 'emerald-cinema',
    name: 'Emerald Cinema Matrix',
    description: 'Teinte émeraude stylisée et atmosphérique',
    cssFilter: 'hue-rotate(60deg) contrast(1.2) saturate(1.1)',
    accentColor: '#059669',
    adjustments: { brightness: 0, contrast: 20, saturation: 10, warmth: -30, vignette: 30, grain: 15 },
  },
];

// Sound Effects Catalog (Synthesized live via Web Audio for 100% offline free fidelity)
export const SFX_PRESETS: {
  id: string;
  name: string;
  category: 'swoosh' | 'impact' | 'glitch' | 'ui' | 'cinematic';
  duration: number; // in seconds
  iconName: string;
}[] = [
  { id: 'sfx-whoosh-fast', name: 'Fast Whoosh Transition', category: 'swoosh', duration: 0.6, iconName: 'Wind' },
  { id: 'sfx-cinematic-boom', name: 'Cinematic Sub Bass Impact', category: 'cinematic', duration: 1.8, iconName: 'Zap' },
  { id: 'sfx-camera-click', name: 'Camera Shutter Click', category: 'ui', duration: 0.4, iconName: 'Camera' },
  { id: 'sfx-digital-glitch', name: 'Cyberpunk Digital Glitch', category: 'glitch', duration: 0.7, iconName: 'Radio' },
  { id: 'sfx-bell-ding', name: 'Notification Bell Ding', category: 'ui', duration: 1.2, iconName: 'Bell' },
  { id: 'sfx-pop-bubble', name: 'Modern UI Pop', category: 'ui', duration: 0.3, iconName: 'Sparkles' },
];

// Stickers & Overlay Badges
export const STICKER_PRESETS: {
  id: string;
  name: string;
  svgIcon: string;
  text: string;
  bgGradient: string;
  textColor: string;
  category: 'commerce' | 'social' | 'reaction';
}[] = [
  {
    id: 'stk-sale-50',
    name: 'Promo -50%',
    svgIcon: 'Tag',
    text: '-50% OFF',
    bgGradient: 'from-rose-600 to-red-600',
    textColor: '#FFFFFF',
    category: 'commerce',
  },
  {
    id: 'stk-new',
    name: 'Badge NOUVEAU',
    svgIcon: 'Sparkles',
    text: 'NOUVEAU',
    bgGradient: 'from-amber-400 to-orange-500',
    textColor: '#000000',
    category: 'commerce',
  },
  {
    id: 'stk-subscribe',
    name: 'Bouton S\'abonner',
    svgIcon: 'Bell',
    text: 'S\'ABONNER',
    bgGradient: 'from-red-600 to-rose-700',
    textColor: '#FFFFFF',
    category: 'social',
  },
  {
    id: 'stk-verified',
    name: 'Badge Vérifié',
    svgIcon: 'CheckCircle',
    text: '✓ CERTIFIÉ',
    bgGradient: 'from-blue-500 to-cyan-500',
    textColor: '#FFFFFF',
    category: 'social',
  },
  {
    id: 'stk-fire',
    name: 'Tendance 🔥',
    svgIcon: 'Flame',
    text: 'TENDANCE 🔥',
    bgGradient: 'from-orange-500 to-red-600',
    textColor: '#FFFFFF',
    category: 'reaction',
  },
  {
    id: 'stk-wave',
    name: 'Onde Audio Animée',
    svgIcon: 'Activity',
    text: 'AUDIO ON',
    bgGradient: 'from-emerald-500 to-teal-600',
    textColor: '#FFFFFF',
    category: 'social',
  },
];
