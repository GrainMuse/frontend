// ============================================================
// GRAIN MUSE — Central Data Layer
// ============================================================

export const COMPANY = {
  name: 'Grain Muse',
  logo: "grainmuse",
  tagline: 'Craft Foods & Herbal Teas',
  description:
    'A Sri Lankan craft food company born from a simple belief: everyday meals deserve real ingredients and genuine care.',
  email: 'trade@grainmuse.net',
  tradeEmail: 'trade@grainmuse.net',
  phone1: '+94 729 839 172',
  phone2: '+94 766 142 802',
  location: '119, Kimbulapitiya, Negombo',
  hours: 'Mon–Fri, 8am–5pm IST',
  socials: {
    instagram: 'https://www.instagram.com/grainmuse1',
    facebook: 'https://web.facebook.com/people/Grain-Muse/61588632778147',
    linkedin: '#',
  },
};

export const NAV_LINKS = [
  { label: 'Home',     path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'About',    path: '/about' },
  { label: 'Our Team', path: '/team' },
  { label: 'Contact',  path: '/contact' },
];

export const PRODUCT_CATEGORIES = {
  RICE: 'rice',
  TEA:  'tea',
};

export const PRODUCTS = [
  /* ── Instant Fried Rice ─────────────────────────────────── */
  {
    id: 'rice-01',
    category: PRODUCT_CATEGORIES.RICE,
    slug: 'normal-instant-rice',
    icon: '🍚',
    img: "src/images/rice-products/normal-instant-rice.jpeg",
    color: '#C8A96E',
    name: 'Instant Fried Rice (Normal)',
    subtitle: 'Classic Everyday Meal',
    tagline: 'Quick, natural, and satisfying',
    desc: 'A perfectly balanced ready-to-eat meal made with natural ingredients. Mild flavour suitable for all age groups.',
    longDesc: "A perfectly balanced, ready-to-eat meal crafted for everyday convenience. Made with carefully selected natural ingredients, this instant fried rice delivers a classic, mild flavor loved by all age groups. 100% natural, with no added preservatives, colors, or artificial flavors, it’s a healthy and quick solution for busy lifestyles. Just add hot water and enjoy a delicious meal in 5 minutes.",
    tags: ['Natural', 'Mild Flavor', '5-Min Ready', 'Everyday Meal'],
    highlights: [
      'No preservatives, colours, or artificial flavours',
      'Made with natural ingredients',
      'Quick 5-minute preparation',
      'Perfect for all age groups',
    ],
    nutrition: { servingSize: '150g', calories: 208, protein: '4.8g', carbs: '36g', fat: '5.5g', fibre: '1.8g' },
    badge: 'Best Seller',
  },

  {
    id: 'rice-02',
    category: PRODUCT_CATEGORIES.RICE,
    slug: 'spicy-instant-rice',
    icon: '🌶️',
    img: "src/images/rice-products/spicy-instant-rice.jpeg",
    color: '#B05A30',
    name: 'Instant Fried Rice (Spicy)',
    subtitle: 'Bold & Aromatic Blend',
    tagline: 'For those who love heat',
    desc: 'A bold and flavourful fried rice with natural spices delivering a satisfying spicy kick.',
    longDesc: "Designed for spice lovers, this variant brings bold flavors and a satisfying kick. Made using a blend of natural spices and premium ingredients, it offers a rich and aromatic experience in every bite. Free from preservatives and artificial additives, this product guarantees both taste and health. Ready in just 5 minutes, it’s perfect for those who crave heat and convenience.",
    tags: ['Spicy', 'Bold Flavor', 'Natural Ingredients', '5-Min Ready'],
    highlights: [
      'Rich and aromatic spice blend',
      'No preservatives or artificial additives',
      'Perfect for spice lovers',
      'Quick and convenient meal',
    ],
    nutrition: { servingSize: '150g', calories: 208, protein: '4.8g', carbs: '36g', fat: '5.5g', fibre: '1.8g' },
    badge: null,
  },

  {
    id: 'rice-03',
    category: PRODUCT_CATEGORIES.RICE,
    slug: 'premium-instant-rice',
    icon: '✨',
    img: "src/images/rice-products/premium-instant-rice.jpeg",
    color: '#4E6040',
    name: 'Instant Fried Rice (Premium)',
    subtitle: 'Gourmet Experience',
    tagline: 'Elevated taste, instantly',
    desc: 'A premium fried rice crafted with high-quality ingredients for a richer and more satisfying experience.',
    longDesc: "An elevated version of instant fried rice, crafted with high-quality ingredients and enhanced flavor profiles. This premium range offers a richer taste, superior texture, and a more satisfying meal experience. With no added colors, flavors, or preservatives, it ensures purity and quality. Enjoy a gourmet-style meal instantly ready in 5 minutes.",
    tags: ['Premium', 'Gourmet', 'High Quality', '5-Min Ready'],
    highlights: [
      'High-quality ingredients',
      'Richer taste and texture',
      'No artificial additives',
      'Instant gourmet experience',
    ],
    nutrition: { servingSize: '150g', calories: 208, protein: '4.8g', carbs: '36g', fat: '5.5g', fibre: '1.8g' },
    badge: 'Premium',
  },

  /* ── Herbal Teas ─────────────────────────────────────────── */

  {
    id: 'tea-01',
    category: PRODUCT_CATEGORIES.TEA,
    slug: 'hibiscus-tea',
    icon: '🌺',
    img: "src/images/tea-products/hibiscus-tea.jpeg",
    color: '#9B2335',
    name: 'Hibiscus Tea',
    subtitle: 'Antioxidant Herbal Infusion',
    tagline: 'Refresh and revitalise',
    desc: 'A vibrant herbal tea made from dried hibiscus petals with a naturally tangy taste.',
    longDesc: "A refreshing herbal infusion made from carefully dried hibiscus petals. Known for its vibrant color and naturally tangy flavor, this tea is rich in antioxidants and supports overall wellness. Enjoy it hot or cold as a naturally caffeine-free beverage that revitalizes your body and mind.",
    tags: ['Antioxidant', 'Caffeine-Free', 'Tangy', 'Wellness'],
    highlights: [
      'Rich in antioxidants',
      'Naturally tangy flavour',
      'Caffeine-free',
      'Supports overall wellness',
    ],
    nutrition: { servingSize: '30g', calories: 2, protein: '0g', carbs: '0.1g', fat: '0g', fibre: '0.2g' },
    badge: null,
  },

  {
    id: 'tea-02',
    category: PRODUCT_CATEGORIES.TEA,
    slug: 'butterfly-pea-tea',
    icon: '🦋',
    img: "src/images/tea-products/butterfly-pea-tea.jpeg",
    color: '#2D4B9B',
    name: 'Butterfly Pea Tea',
    subtitle: 'Color-Changing Herbal Tea',
    tagline: 'A magical tea experience',
    desc: 'A unique blue tea that changes color with lemon, rich in antioxidants.',
    longDesc: "A unique herbal tea made from butterfly pea flowers, famous for its deep blue color and natural color-changing properties when mixed with lemon. Rich in antioxidants, this caffeine-free tea supports relaxation, skin health, and overall well-being while offering a visually stunning tea experience.",
    tags: ['Antioxidant', 'Color-Changing', 'Caffeine-Free', 'Relaxing'],
    highlights: [
      'Natural color-changing effect',
      'Supports skin health',
      'Rich in antioxidants',
      'Caffeine-free relaxation tea',
    ],
    nutrition: { servingSize: '30g', calories: 2, protein: '0g', carbs: '0g', fat: '0g', fibre: '0.2g' },
    badge: 'New',
  },

  {
    id: 'tea-03',
    category: PRODUCT_CATEGORIES.TEA,
    slug: 'curry-leaf-tea',
    icon: '🌿',
    img: "src/images/tea-products/curry-leaf-tea.jpeg",
    color: '#4E6040',
    name: 'Curry Leaf Tea',
    subtitle: 'Traditional Wellness Tea',
    tagline: 'Nature’s daily remedy',
    desc: 'A traditional herbal tea made from natural curry leaves supporting digestion and wellness.',
    longDesc:"A traditional herbal tea made from natural curry leaves, valued for its numerous health benefits. It supports digestion, helps maintain healthy blood sugar levels, and promotes overall wellness. This caffeine-free infusion combines earthy flavor with functional health benefits, making it ideal for daily consumption.",
    tags: ['Digestive', 'Traditional', 'Caffeine-Free', 'Wellness'],
    highlights: [
      'Supports digestion',
      'Helps regulate blood sugar',
      'Traditional herbal remedy',
      'Ideal for daily consumption',
    ],
    nutrition: { servingSize: '30g', calories: 2, protein: '0g', carbs: '0.1g', fat: '0g', fibre: '0.2g' },
    badge: null,
  },

  {
    id: 'tea-04',
    category: PRODUCT_CATEGORIES.TEA,
    slug: 'heenbovitiya-tea',
    icon: '🍃',
    img: "src/images/tea-products/heen-bovitiya-tea.jpeg",
    color: '#6B8E23',
    name: 'Heenbovitiya Tea',
    subtitle: 'Metabolic Wellness Tea',
    tagline: 'Support your healthy lifestyle',
    desc: 'A herbal tea made from Heenbovitiya, supporting metabolism and weight management.',
    longDesc: "A powerful herbal tea made from Heenbovitiya, a traditional medicinal plant known for supporting metabolic health and wellness. Naturally caffeine-free, this tea is especially valued for helping in weight management and promoting a healthy lifestyle when consumed regularly.",
    tags: ['Metabolism', 'Weight Management', 'Caffeine-Free', 'Wellness'],
    highlights: [
      'Supports metabolic health',
      'Aids weight management',
      'Traditional medicinal plant',
      'Caffeine-free',
    ],
    nutrition: { servingSize: '30g', calories: 2, protein: '0g', carbs: '0.1g', fat: '0g', fibre: '0.2g' },
    badge: 'Wellness',
  },
];

export const getProductsByCategory = (category) =>
  PRODUCTS.filter((p) => p.category === category);

export const getProductBySlug = (slug) =>
  PRODUCTS.find((p) => p.slug === slug);

export const VALUES = [
  {
    icon: '🌾',
    title: 'Heritage Grains',
    desc: 'We source premium rice varieties from Sri Lankan highland farms, processed slowly to honour their natural character.',
  },
  {
    icon: '🌿',
    title: 'Whole Botanicals',
    desc: 'Every herb in our teas is whole-leaf or whole-flower never powdered extracts or artificial flavour substitutes.',
  },
  {
    icon: '✦',
    title: 'Clean Labels',
    desc: 'No hidden additives. No artificial preservatives. Every ingredient is named and natural. Always.',
  },
  {
    icon: '❤️',
    title: 'Crafted with Care',
    desc: 'Small-batch production means we never lose sight of quality. Every pack is made with intention and pride.',
  },
];

export const PROCESS_STEPS = [
  { step: '01', title: 'Ingredient Sourcing', desc: 'We work directly with trusted Sri Lankan farms to source heritage grains, fresh herbs, and whole botanicals at peak quality.' },
  { step: '02', title: 'Slow Processing',     desc: 'Our grains are dehydrated to preserve natural flavour, colour, and nutritional integrity.' },
  { step: '03', title: 'Recipe Development',  desc: 'Each blend goes through dozens of taste tests before approval balancing flavour, nutrition, and clean-label standards.' },
  { step: '04', title: 'Quality Sealing',     desc: 'Packed in protective, sustainable packaging designed to lock in freshness from our kitchen to yours.' },
];

/* ── Team Members ────────────────────────────────────────────── */
export const TEAM_MEMBERS = [
  {
    id:       'savina-chandrasekara',
    slug:     'src/images/team/savina.jpeg',
    name:     'Savina Chandrasekara',
    position: 'Founder & Managing Director',
    dept:     'Leadership',
    desc:     'I am a passionate food innovator and entrepreneur dedicated to developing convenient, nutritious, and high-quality food solutions. As the founder of Grain Muse (PVT) Ltd, I focus on creating products that combine natural ingredients, modern food technology, and consumer convenience. With a strong background in food science and product development, I have successfully introduced innovative concepts such as instant fried rice solutions and herbal wellness teas, designed to meet the needs of today’s fast-paced lifestyle while maintaining health and authenticity. My mission is to deliver 100% natural, safe, and high-quality food products to both local and international markets, bringing innovation from Sri Lanka to the global stage',
    quote:    'We don’t just create food, we cultivate a future where nourishment, nature, and innovation exist in perfect balance.',
    email:    'savinasasen668@gmail.com',
    linkedin: 'www.linkedin.com/in/savina-chandrasekara-553b3426a',
    instagram:'#',
    skills:   [
      'Food Product Innovation',
      'Food Science & Technology',
      'Entrepreneurship',
      'Product Development',
      'Strategic Planning',
      'Market Expansion'
    ],
    joined:   '2025',
  },
  {
    id:       'pramintha-fernando',
    slug:     'src/images/team/pramintha.jpg',
    name:     'Pramintha Fernando',
    position: 'Chief Technology Officer',
    dept:     'Technology',
    desc:     'As Chief Technology Officer, I lead the development and optimization of our production technologies, ensuring efficiency, quality, and innovation across all operations. With a background in Computer Science and Engineering from the University of Moratuwa, I focus on integrating smart systems and automation to enhance our manufacturing processes and support sustainable growth.',
    quote:    'Technology is not just support for our business, it is the force that drives efficiency, quality, and innovation in everything we produce.',
    email:    'praminthadf@gmail.com',
    linkedin: 'https://www.linkedin.com/in/pramintha-dasun',
    instagram:'https://www.instagram.com/pramintha_fernando',
    skills:   [
      'Process Automation', 
      'System Optimization', 
      'Data Analytics', 
      'Technology Strategy', 
      'Process Innovation', 
      'Technical Leadership'
    ],
    joined:   '2026',
  },
  {
    id:       'pulitha-wanigasekara',
    slug:     'src/images/team/pulitha.jpeg',
    name:     'Pulitha Wanigasekara',
    position: 'Chief Executive Officer',
    dept:     'Leadership',
    desc:     'An undergraduate of Bsc . (Hons) Applied Sciences (Management sciences) at the University of Sri Jayewardenepura, complemented by professional qualifications in CIMA (Chartered Institute of Management Accountants) and CQHRM (Chartered Qualification in Human Resource Management). This multidisciplinary background provides a strong foundation in financial management, strategic decision-making, and human resource practices, alongside expertise in data analysis and scientific applications in business contexts.',
    quote:    'A meaningful brand is not built for attention, but for impact, shaped by purpose, guided by clarity, and sustained by trust.',
    email:    'pulithawanigasekara@gmail.com',
    linkedin: 'https://www.linkedin.com/in/pulitha-wanigasekara-36b287211',
    instagram:'https://www.instagram.com/_pulitha_',
    skills:   [
      'Strategic Leadership',
      'Financial Management',
      'Business Analytics',
      'Brand Strategy',
      'Decision Making',
      'Organizational Development'
    ],
    joined:   '2026',
  },
  {
    id:       'heshan-chandrasekara',
    slug:     'src/images/team/heshan.jpeg',
    name:     'Heshan Chandrasekara',
    position: 'Chief Marketing Officer',
    dept:     'Marketing',
    desc:     'Hi, I’m Nimanka Heshan Chandrasekara. As the Chief Marketing Officer (CMO) at Grainmuse Pvt Ltd and a passionate ICT educator, I bridge the worlds of sustainable business and digital learning. With a BET honors in Sustainable Development from the University of Kelaniya, my expertise spans web development, graphic design, and multimedia production. I’m driven by a constant curiosity for new tech trends and literature, crafting digital experiences that inspire and educate.',
    quote:    'True influence begins with authenticity when stories are rooted in truth, they naturally find their way to people.',
    email:    'nimankaheshan3@gmail.com',
    linkedin: 'https://www.linkedin.com/in/windroidinfo',
    instagram:'https://www.instagram.com/nima_chandras',
    skills:   [
      'Digital Marketing',
      'Content Strategy',
      'Web Development',
      'Graphic Design',
      'Multimedia Production',
      'Brand Communication'
    ],
    joined:   '2026',
  },
  {
    id:       'movini-wanasinghe',
    slug:     'src/images/team/movini.jpeg',
    name:     'Movini Wanasinghe',
    position: 'Chief Operating Officer',
    dept:     'Operations',
    desc:     'I am Movini Wanasinghe, a science driven professional with a strong passion for innovation and sustainable product development. I hold a BSc (Hons) in Cosmetic Science and am currently pursuing MBA in Business Analytics, allowing me to integrate scientific knowledge with strategic and data-driven decision-making. As the Chief Operations Officer of Grainmuse (Pvt) Ltd., I focus on bridging science and business to create high-quality natural food products that support healthier lifestyles. I am deeply committed to maintaining excellence, efficiency, and authenticity across every aspect of our operations.',
    quote:    'Excellence is a quiet discipline where care, precision, and integrity come together to create something truly lasting.',
    email:    'pasankawanasinghe@gmail.com',
    linkedin: 'https://www.linkedin.com/in/movini-wanasinghe-8a298818b',
    instagram:'https://www.instagram.com/movi_wanasinghe',
    skills:   [
      'Operations Management',
      'Process Optimization',
      'Product Development',
      'Quality Assurance',
      'Business Analytics',
      'Supply Chain Management'
    ],
    joined:   '2026',
  },
];

export const DEPT_COLORS = {
  Leadership:  '#BF9A56',
  Technology:  '#43a7ea',
  Product:     '#4E6040',
  Operations:  '#7A5235',
  Brand:       '#9B2335',
  Marketing:   '#C4601A',
  Quality:     '#2D6B5A',
};
