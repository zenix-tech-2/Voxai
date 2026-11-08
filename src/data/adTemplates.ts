export interface AdTemplate {
  id: string;
  title: string;
  category: string;
  language: 'fr' | 'en';
  region?: 'african' | 'french' | 'english' | 'specialty';
  recommendedGender: 'male' | 'female' | 'any';
  recommendedVoiceId?: string;
  durationEstimate: string;
  script: string;
  targetTone: string;
}

export const AD_TEMPLATES: AdTemplate[] = [
  // --- LONG-FORM SCRIPTS (5 MINUTES & MORE) ---
  {
    id: 'fr-podcast-5min',
    title: 'Podcast Épisode Complet (5 min) - Le Boom de l\'Innovation Africaine & Mondiale',
    category: 'Podcast & Narration Longue (5 min)',
    language: 'fr',
    region: 'african',
    recommendedGender: 'male',
    recommendedVoiceId: 'af-male-mamadou',
    durationEstimate: '5 min',
    targetTone: 'Captivant, chaleureux, inspirant et posé',
    script: `Bienvenue dans cet épisode spécial de VoxStudio Perspectives. Aujourd'hui, nous plongeons au cœur d'une révolution silencieuse mais spectaculaire qui transforme le continent africain et redéfinit l'économie mondiale. [Pause 1s]

Regardez autour de vous : de Lagos à Dakar, de Nairobi à Abidjan et Johannesburg, une nouvelle génération de créateurs, d'ingénieurs et d'entrepreneurs ne se contente plus de suivre les tendances. Ils les inventent. [Pause 0.5s]

Prenez l'exemple des technologies financières. Il y a dix ans à peine, envoyer de l'argent d'un village à une métropole relevait du parcours du combattant. Aujourd'hui, grâce au Mobile Money et aux fintechs émergentes, des dizaines de millions de familles règlent leurs factures, financent leurs études et développent leurs commerces d'un simple geste sur leur téléphone. C'est plus qu'une avancée technique : c'est une libération d'énergie humaine. [Pause 1s]

Mais l'innovation ne s'arrête pas au numérique. Dans le domaine de l'énergie solaire, des micro-réseaux intelligents illuminent désormais des régions entières. Dans l'agriculture, les données satellitaires permettent aux cultivateurs de maximiser leurs récoltes tout en préservant les sols et l'eau. Et dans la culture — la mode, le design, l'afrobeat, le cinéma —, la créativité africaine s'impose sur les plus grandes scènes internationales. [Pause 0.5s]

Alors, quelle leçon en tirer pour nous tous ? C'est que l'avenir n'attend personne. Les plus grandes opportunités appartiennent à ceux qui osent imaginer le monde de demain avec audace, solidarité et passion. [Pause 1s]

Merci d'avoir été à l'écoute de ce podcast. N'oubliez pas de partager cet épisode et de vous abonner pour ne manquer aucune de nos prochaines aventures sonores. À très bientôt sur nos ondes !`,
  },
  {
    id: 'en-documentary-5min',
    title: 'Documentary Masterpiece (5 min) - The Untamed Pulse: Nature, Culture & Progress',
    category: 'Documentary & Audio Story (5 min)',
    language: 'en',
    region: 'african',
    recommendedGender: 'female',
    recommendedVoiceId: 'af-female-zuri',
    durationEstimate: '5 min',
    targetTone: 'Lyrical, profound, majestic storytelling',
    script: `Look out across the vast expanse where the golden grasses meet the infinite horizon. In the quiet hours before dawn, when the mist still clings to the baobab trees and the air is alive with the whispered secrets of the savannah, you begin to understand the true heartbeat of this land. [Pause 1s]

For thousands of years, these ancient pathways have witnessed the rhythm of great migrations. Wildebeest, elephants, and lions moving in sacred balance with the rains, teaching us that survival is not about dominating nature, but listening to its song. [Pause 0.5s]

Yet today, a second dawn is breaking across the continent. In tech hubs rising above ancient riverbanks, young visionaries are weaving ancient wisdom with artificial intelligence, renewable solar grids, and clean water preservation. They are building smart cities that honor the soil beneath them, proving to the entire planet that sustainability and technological mastery can march side by side. [Pause 1s]

From the majestic peaks of Mount Kenya to the shimmering waters of the Cape coast, and into the vibrant marketplaces of Accra and Lagos, every community carries an unbreakable promise. A promise that tomorrow will be richer in harmony, richer in creativity, and grounded in enduring heritage. [Pause 0.5s]

As the sun sets in blazing hues of crimson and gold, we are reminded of one enduring truth: our shared world is connected not by borders, but by the stories we tell, the courage we share, and the dreams we dare to build together. [Pause 1s]

Thank you for journeying with us today. Until next time, keep your curiosity alive and your horizon boundless.`,
  },  // --- AFRICAN SCRIPTS (ENGLISH & FRENCH) ---
  {
    id: 'af-nigeria-fintech',
    title: 'FinTech Africa - "Kuda Cash Fast Transfer"',
    category: 'FinTech & Mobile Money',
    language: 'en',
    region: 'african',
    recommendedGender: 'male',
    recommendedVoiceId: 'af-male-babajide',
    durationEstimate: '20s',
    targetTone: 'Vibrant Lagos cadence, confident, energetic',
    script: "No dulling! Why wait three days for bank transfers? With Kuda Cash, send money across Africa in sixty seconds with zero hidden charges. Download the app now and power your hustle!",
  },
  {
    id: 'af-nigeria-glow',
    title: 'African Beauty - "Shea Luxe Melanin Gold"',
    category: 'Beauty & Lifestyle',
    language: 'en',
    region: 'african',
    recommendedGender: 'female',
    recommendedVoiceId: 'af-female-amara',
    durationEstimate: '22s',
    targetTone: 'Melodic, radiant, celebratory Naija warmth',
    script: "Your skin is pure royalty. Infused with organic raw shea butter and wild baobab oil, Shea Luxe celebrates your authentic African glow. Soft, glowing, undeniable.",
  },
  {
    id: 'af-kenya-safari',
    title: 'Eco-Tourism - "Kenya Maasai Mara Expedition"',
    category: 'Travel & Safari',
    language: 'en',
    region: 'african',
    recommendedGender: 'female',
    recommendedVoiceId: 'af-female-zuri',
    durationEstimate: '25s',
    targetTone: 'Lyrical, scenic, warm East African grace',
    script: "Feel the earth tremble beneath the great migration. Watch the sunrise paint the savannah in liquid gold. Karibu Kenya. Book your luxury eco-lodge safari today.",
  },
  {
    id: 'af-southafrica-truck',
    title: 'Rugged 4x4 - "Titan Wildtrak 4WD"',
    category: 'Automotive & Rugged',
    language: 'en',
    region: 'african',
    recommendedGender: 'male',
    recommendedVoiceId: 'af-male-jabulani',
    durationEstimate: '22s',
    targetTone: 'Deep, booming South African power',
    script: "Built tough for the wild African bush. From the dunes of the Kalahari to the rocky trails of the Drakensberg, nothing stops the new Titan Wildtrak. Test drive yours today.",
  },
  {
    id: 'af-fr-orange-money',
    title: 'Mobile Money - "Orange Money Express"',
    category: 'Télécom & Finance',
    language: 'fr',
    region: 'african',
    recommendedGender: 'male',
    recommendedVoiceId: 'af-male-mamadou',
    durationEstimate: '20s',
    targetTone: 'Chaleureuse, dynamique, esprit de famille',
    script: "Envoyer de l'argent au village n'a jamais été aussi simple ! Avec Orange Money Express, votre famille reçoit les sous directement sur son téléphone, instantanément et en toute sécurité. La famille d'abord !",
  },
  {
    id: 'af-fr-beaute-abidjan',
    title: 'Cosmétique Bio - "Karité Royal d\'Abidjan"',
    category: 'Beauté & Soin',
    language: 'fr',
    region: 'african',
    recommendedGender: 'female',
    recommendedVoiceId: 'af-female-fatoumata',
    durationEstimate: '22s',
    targetTone: 'Douce, souriante, envoûtante',
    script: "Le secret de nos mères pour une peau éclatante. Notre karité pur d'Afrique de l'Ouest hydrate intensément et révèle la splendeur de votre teint. Découvrez Karité Royal.",
  },

  // --- SPECIALTY VOICE SCRIPTS ---
  {
    id: 'sp-toy-robot',
    title: 'Jouet Enfants - "Mégabot Galactique 3000"',
    category: 'Enfants & Jouets',
    language: 'fr',
    region: 'specialty',
    recommendedGender: 'male',
    recommendedVoiceId: 'sp-boy-leo',
    durationEstimate: '15s',
    targetTone: 'Hyper enthousiaste, rieur et complice',
    script: "Ouah ! Regarde le Mégabot Galactique ! Il tire des lasers lumineux et se transforme en vaisseau spatial ultra-rapide ! Trop fort ! Disponible dans tous les magasins de jouets !",
  },
  {
    id: 'sp-asmr-headphones',
    title: 'Casque Audio ASMR - "Aura Silence Pro"',
    category: 'Audio & Méditation',
    language: 'fr',
    region: 'specialty',
    recommendedGender: 'female',
    recommendedVoiceId: 'sp-female-sienna',
    durationEstimate: '20s',
    targetTone: 'Chuchotement feutré, intime et relaxant',
    script: "Silence total... [chuchoté] Plus aucun bruit autour de vous. Seulement la pureté du son cristallin. Enfilez le nouveau casque Aura Silence. Respirez.",
  },
  {
    id: 'sp-sports-hype',
    title: 'Nitro Monster Truck - "World Mega Clash"',
    category: 'Sports & Extrême',
    language: 'en',
    region: 'specialty',
    recommendedGender: 'male',
    recommendedVoiceId: 'sp-male-rex',
    durationEstimate: '20s',
    targetTone: 'Explosive, roaring stadium announcer',
    script: "GET READY TO RUMBLE! The most destructive monster trucks on planet earth crash into the Mega Arena this Saturday! Fire, flying metal, and pure nitro madness! BE THERE!",
  },

  // --- CLASSIC FRENCH SCRIPTS ---
  {
    id: 'fr-parfum-luxe',
    title: 'Parfum de Luxe - "L\'Élixir Noir"',
    category: 'Luxe & Parfumerie',
    language: 'fr',
    region: 'french',
    recommendedGender: 'male',
    recommendedVoiceId: 'fr-male-jeanluc',
    durationEstimate: '20s',
    targetTone: 'Voix feutrée, séduisante et posée',
    script: "Dans l'obscurité d'un soir parisien, une étincelle suffit. Laissez s'exprimer votre magnétisme avec L'Élixir Noir. L'intensité n'a jamais été aussi sensuelle.",
  },
  {
    id: 'fr-beaute-soin',
    title: 'Sérum Éclat - "Haute Beauté"',
    category: 'Cosmétique & Soin',
    language: 'fr',
    region: 'french',
    recommendedGender: 'female',
    recommendedVoiceId: 'fr-female-camille',
    durationEstimate: '20s',
    targetTone: 'Douceur soyeuse, chic et lumineuse',
    script: "Chaque matin est une renaissance. Gorgé d'actifs botaniques rares, notre Sérum Éclat réveille la jeunesse de votre peau. Sublimez votre beauté naturelle dès aujourd'hui.",
  },
  {
    id: 'fr-auto-electrique',
    title: 'Nouvelle Berline Électrique - "Volt GT"',
    category: 'Automobile & Tech',
    language: 'fr',
    region: 'french',
    recommendedGender: 'male',
    recommendedVoiceId: 'fr-male-antoine',
    durationEstimate: '25s',
    targetTone: 'Puissant, rythmé, percutant',
    script: "Oubliez tout ce que vous pensiez savoir sur la conduite. Six cents chevaux silencieux, zéro émission et un design taillé par le vent. La nouvelle Volt GT est là. Réservez votre essai.",
  },
  {
    id: 'fr-soldes-flash',
    title: 'Vente Flash Week-end - "Méga Soldes"',
    category: 'Promotion & Retail',
    language: 'fr',
    region: 'french',
    recommendedGender: 'male',
    recommendedVoiceId: 'fr-male-julien',
    durationEstimate: '15s',
    targetTone: 'Ultra-énergique, urgent et festif',
    script: "Ce week-end seulement, c'est l'explosion des prix ! Moins cinquante pour cent sur tout le magasin et des surprises exclusives ! Premier arrivé, premier servi !",
  },

  // --- CLASSIC ENGLISH SCRIPTS ---
  {
    id: 'en-trailer-epic',
    title: 'Movie Trailer - "Genesis Protocol"',
    category: 'Cinematic & Trailer',
    language: 'en',
    region: 'english',
    recommendedGender: 'male',
    recommendedVoiceId: 'en-male-marcus',
    durationEstimate: '25s',
    targetTone: 'Deep, dramatic and earth-shaking',
    script: "When the sky falls silent, humanity's darkest chapter begins. One hero will stand. One choice will define forever. In theaters and IMAX this December.",
  },
  {
    id: 'en-flash-sale',
    title: 'Black Friday Frenzy - "Epic Mega Deal"',
    category: 'Retail & Flash Sale',
    language: 'en',
    region: 'english',
    recommendedGender: 'female',
    recommendedVoiceId: 'en-female-sophia',
    durationEstimate: '20s',
    targetTone: 'Fast, thrilling, high energy',
    script: "Stop scrolling right now! The biggest blowout sale of the entire year is live! Take up to seventy percent off your favorite styles for twenty-four hours only!",
  },
  {
    id: 'en-tech-saas',
    title: 'AI Platform - "Aura Workspaces"',
    category: 'Tech & B2B SaaS',
    language: 'en',
    region: 'english',
    recommendedGender: 'male',
    recommendedVoiceId: 'en-male-liam',
    durationEstimate: '22s',
    targetTone: 'Confident, conversational, innovative',
    script: "Your team shouldn't spend three hours a day juggling messy emails and broken dashboards. Meet Aura. Intelligent workflows that turn chaos into clarity. Try it free.",
  },
  {
    id: 'en-luxury-spa',
    title: 'Botanical Skincare - "Pure Sanctuary"',
    category: 'Luxury & Beauty',
    language: 'en',
    region: 'english',
    recommendedGender: 'female',
    recommendedVoiceId: 'en-female-elena',
    durationEstimate: '20s',
    targetTone: 'Velvety, breathy, peaceful',
    script: "Indulge in the quiet majesty of organic wild herbs. Silky hydration that restores your skin's natural luminescence. Discover Pure Sanctuary today.",
  },
];
