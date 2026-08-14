-- Import the published product and team content that previously lived in src/data/index.js.
-- The migration is idempotent by slug so staging refreshes do not create duplicates.

alter table public.team_members
  add column if not exists email text
  check (
    email is null or (
      char_length(email) between 3 and 254
      and email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
    )
  );

insert into public.product_categories (slug, name, display_order, status)
values
  ('rice', 'Instant Fried Rice', 0, 'published'),
  ('tea', 'Herbal Teas', 1, 'published')
on conflict (slug) do update
set
  name = excluded.name,
  display_order = excluded.display_order,
  status = excluded.status;

with source as (
  select *
  from jsonb_to_recordset($products$
[
  {
    "category": "rice",
    "slug": "normal-instant-rice",
    "name": "Instant Fried Rice (Normal)",
    "subtitle": "Classic Everyday Meal",
    "tagline": "Quick, natural, and satisfying",
    "description": "A perfectly balanced ready-to-eat meal made with natural ingredients. Mild flavour suitable for all age groups.",
    "long_description": "A perfectly balanced, ready-to-eat meal crafted for everyday convenience. Made with carefully selected natural ingredients, this instant fried rice delivers a classic, mild flavor loved by all age groups. 100% natural, with no added preservatives, colors, or artificial flavors, it’s a healthy and quick solution for busy lifestyles. Just add hot water and enjoy a delicious meal in 5 minutes.",
    "accent_color": "#C8A96E",
    "image_path": "normal-instant-rice",
    "nutrition": {
      "servingSize": "150g",
      "calories": 208,
      "protein": "4.8g",
      "carbs": "36g",
      "fat": "5.5g",
      "fibre": "1.8g"
    },
    "tags": [
      "Natural",
      "Mild Flavor",
      "5-Min Ready",
      "Everyday Meal"
    ],
    "highlights": [
      "No preservatives, colours, or artificial flavours",
      "Made with natural ingredients",
      "Quick 5-minute preparation",
      "Perfect for all age groups"
    ],
    "badge": "Best Seller",
    "display_order": 0
  },
  {
    "category": "rice",
    "slug": "spicy-instant-rice",
    "name": "Instant Fried Rice (Spicy)",
    "subtitle": "Bold & Aromatic Blend",
    "tagline": "For those who love heat",
    "description": "A bold and flavourful fried rice with natural spices delivering a satisfying spicy kick.",
    "long_description": "Designed for spice lovers, this variant brings bold flavors and a satisfying kick. Made using a blend of natural spices and premium ingredients, it offers a rich and aromatic experience in every bite. Free from preservatives and artificial additives, this product guarantees both taste and health. Ready in just 5 minutes, it’s perfect for those who crave heat and convenience.",
    "accent_color": "#B05A30",
    "image_path": "spicy-instant-rice",
    "nutrition": {
      "servingSize": "150g",
      "calories": 208,
      "protein": "4.8g",
      "carbs": "36g",
      "fat": "5.5g",
      "fibre": "1.8g"
    },
    "tags": [
      "Spicy",
      "Bold Flavor",
      "Natural Ingredients",
      "5-Min Ready"
    ],
    "highlights": [
      "Rich and aromatic spice blend",
      "No preservatives or artificial additives",
      "Perfect for spice lovers",
      "Quick and convenient meal"
    ],
    "badge": null,
    "display_order": 1
  },
  {
    "category": "rice",
    "slug": "premium-instant-rice",
    "name": "Instant Fried Rice (Premium)",
    "subtitle": "Gourmet Experience",
    "tagline": "Elevated taste, instantly",
    "description": "A premium fried rice crafted with high-quality ingredients for a richer and more satisfying experience.",
    "long_description": "An elevated version of instant fried rice, crafted with high-quality ingredients and enhanced flavor profiles. This premium range offers a richer taste, superior texture, and a more satisfying meal experience. With no added colors, flavors, or preservatives, it ensures purity and quality. Enjoy a gourmet-style meal instantly ready in 5 minutes.",
    "accent_color": "#4E6040",
    "image_path": "premium-instant-rice",
    "nutrition": {
      "servingSize": "150g",
      "calories": 208,
      "protein": "4.8g",
      "carbs": "36g",
      "fat": "5.5g",
      "fibre": "1.8g"
    },
    "tags": [
      "Premium",
      "Gourmet",
      "High Quality",
      "5-Min Ready"
    ],
    "highlights": [
      "High-quality ingredients",
      "Richer taste and texture",
      "No artificial additives",
      "Instant gourmet experience"
    ],
    "badge": "Premium",
    "display_order": 2
  },
  {
    "category": "tea",
    "slug": "hibiscus-tea",
    "name": "Hibiscus Tea",
    "subtitle": "Antioxidant Herbal Infusion",
    "tagline": "Refresh and revitalise",
    "description": "A vibrant herbal tea made from dried hibiscus petals with a naturally tangy taste.",
    "long_description": "A refreshing herbal infusion made from carefully dried hibiscus petals. Known for its vibrant color and naturally tangy flavor, this tea is rich in antioxidants and supports overall wellness. Enjoy it hot or cold as a naturally caffeine-free beverage that revitalizes your body and mind.",
    "accent_color": "#9B2335",
    "image_path": "hibiscus-tea",
    "nutrition": {
      "servingSize": "30g",
      "calories": 2,
      "protein": "0g",
      "carbs": "0.1g",
      "fat": "0g",
      "fibre": "0.2g"
    },
    "tags": [
      "Antioxidant",
      "Caffeine-Free",
      "Tangy",
      "Wellness"
    ],
    "highlights": [
      "Rich in antioxidants",
      "Naturally tangy flavour",
      "Caffeine-free",
      "Supports overall wellness"
    ],
    "badge": null,
    "display_order": 3
  },
  {
    "category": "tea",
    "slug": "butterfly-pea-tea",
    "name": "Butterfly Pea Tea",
    "subtitle": "Color-Changing Herbal Tea",
    "tagline": "A magical tea experience",
    "description": "A unique blue tea that changes color with lemon, rich in antioxidants.",
    "long_description": "A unique herbal tea made from butterfly pea flowers, famous for its deep blue color and natural color-changing properties when mixed with lemon. Rich in antioxidants, this caffeine-free tea supports relaxation, skin health, and overall well-being while offering a visually stunning tea experience.",
    "accent_color": "#2D4B9B",
    "image_path": "butterfly-pea-tea",
    "nutrition": {
      "servingSize": "30g",
      "calories": 2,
      "protein": "0g",
      "carbs": "0g",
      "fat": "0g",
      "fibre": "0.2g"
    },
    "tags": [
      "Antioxidant",
      "Color-Changing",
      "Caffeine-Free",
      "Relaxing"
    ],
    "highlights": [
      "Natural color-changing effect",
      "Supports skin health",
      "Rich in antioxidants",
      "Caffeine-free relaxation tea"
    ],
    "badge": "New",
    "display_order": 4
  },
  {
    "category": "tea",
    "slug": "curry-leaf-tea",
    "name": "Curry Leaf Tea",
    "subtitle": "Traditional Wellness Tea",
    "tagline": "Nature’s daily remedy",
    "description": "A traditional herbal tea made from natural curry leaves supporting digestion and wellness.",
    "long_description": "A traditional herbal tea made from natural curry leaves, valued for its numerous health benefits. It supports digestion, helps maintain healthy blood sugar levels, and promotes overall wellness. This caffeine-free infusion combines earthy flavor with functional health benefits, making it ideal for daily consumption.",
    "accent_color": "#4E6040",
    "image_path": "curry-leaf-tea",
    "nutrition": {
      "servingSize": "30g",
      "calories": 2,
      "protein": "0g",
      "carbs": "0.1g",
      "fat": "0g",
      "fibre": "0.2g"
    },
    "tags": [
      "Digestive",
      "Traditional",
      "Caffeine-Free",
      "Wellness"
    ],
    "highlights": [
      "Supports digestion",
      "Helps regulate blood sugar",
      "Traditional herbal remedy",
      "Ideal for daily consumption"
    ],
    "badge": null,
    "display_order": 5
  },
  {
    "category": "tea",
    "slug": "heenbovitiya-tea",
    "name": "Heenbovitiya Tea",
    "subtitle": "Metabolic Wellness Tea",
    "tagline": "Support your healthy lifestyle",
    "description": "A herbal tea made from Heenbovitiya, supporting metabolism and weight management.",
    "long_description": "A powerful herbal tea made from Heenbovitiya, a traditional medicinal plant known for supporting metabolic health and wellness. Naturally caffeine-free, this tea is especially valued for helping in weight management and promoting a healthy lifestyle when consumed regularly.",
    "accent_color": "#6B8E23",
    "image_path": "heenbovitiya-tea",
    "nutrition": {
      "servingSize": "30g",
      "calories": 2,
      "protein": "0g",
      "carbs": "0.1g",
      "fat": "0g",
      "fibre": "0.2g"
    },
    "tags": [
      "Metabolism",
      "Weight Management",
      "Caffeine-Free",
      "Wellness"
    ],
    "highlights": [
      "Supports metabolic health",
      "Aids weight management",
      "Traditional medicinal plant",
      "Caffeine-free"
    ],
    "badge": "Wellness",
    "display_order": 6
  }
]
$products$::jsonb) as item(
    category text,
    slug text,
    name text,
    subtitle text,
    tagline text,
    description text,
    long_description text,
    accent_color text,
    image_path text,
    nutrition jsonb,
    tags text[],
    highlights text[],
    badge text,
    display_order integer
  )
)
insert into public.products (
  category_id, slug, name, subtitle, tagline, description, long_description,
  accent_color, image_path, nutrition, tags, highlights, badge, display_order,
  status, published_at
)
select
  category.id, source.slug, source.name, source.subtitle, source.tagline,
  source.description, source.long_description, source.accent_color,
  source.image_path, source.nutrition, source.tags, source.highlights,
  source.badge, source.display_order, 'published',
  timestamptz '2026-08-15 00:00:00+00'
from source
join public.product_categories as category on category.slug = source.category
on conflict (slug) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  subtitle = excluded.subtitle,
  tagline = excluded.tagline,
  description = excluded.description,
  long_description = excluded.long_description,
  accent_color = excluded.accent_color,
  image_path = excluded.image_path,
  nutrition = excluded.nutrition,
  tags = excluded.tags,
  highlights = excluded.highlights,
  badge = excluded.badge,
  display_order = excluded.display_order,
  status = excluded.status,
  published_at = excluded.published_at;

with source as (
  select *
  from jsonb_to_recordset($team$
[
  {
    "slug": "savina-chandrasekara",
    "name": "Savina Chandrasekara",
    "position": "Founder & Managing Director",
    "department": "Leadership",
    "biography": "I am a passionate food innovator and entrepreneur dedicated to developing convenient, nutritious, and high-quality food solutions. As the founder of Grain Muse (PVT) Ltd, I focus on creating products that combine natural ingredients, modern food technology, and consumer convenience. With a strong background in food science and product development, I have successfully introduced innovative concepts such as instant fried rice solutions and herbal wellness teas, designed to meet the needs of today’s fast-paced lifestyle while maintaining health and authenticity. My mission is to deliver 100% natural, safe, and high-quality food products to both local and international markets, bringing innovation from Sri Lanka to the global stage",
    "quote": "We don’t just create food, we cultivate a future where nourishment, nature, and innovation exist in perfect balance.",
    "image_path": "savina-chandrasekara",
    "email": "savinasasen668@gmail.com",
    "linkedin_url": "https://www.linkedin.com/in/savina-chandrasekara-553b3426a",
    "instagram_url": null,
    "skills": [
      "Food Product Innovation",
      "Food Science & Technology",
      "Entrepreneurship",
      "Product Development",
      "Strategic Planning",
      "Market Expansion"
    ],
    "joined_year": 2025,
    "display_order": 0
  },
  {
    "slug": "pramintha-fernando",
    "name": "Pramintha Fernando",
    "position": "Chief Technology Officer",
    "department": "Technology",
    "biography": "As Chief Technology Officer, I lead the development and optimization of our production technologies, ensuring efficiency, quality, and innovation across all operations. With a background in Computer Science and Engineering from the University of Moratuwa, I focus on integrating smart systems and automation to enhance our manufacturing processes and support sustainable growth.",
    "quote": "Technology is not just support for our business, it is the force that drives efficiency, quality, and innovation in everything we produce.",
    "image_path": "pramintha-fernando",
    "email": "praminthadf@gmail.com",
    "linkedin_url": "https://www.linkedin.com/in/pramintha-dasun",
    "instagram_url": "https://www.instagram.com/pramintha_fernando",
    "skills": [
      "Process Automation",
      "System Optimization",
      "Data Analytics",
      "Technology Strategy",
      "Process Innovation",
      "Technical Leadership"
    ],
    "joined_year": 2026,
    "display_order": 1
  },
  {
    "slug": "pulitha-wanigasekara",
    "name": "Pulitha Wanigasekara",
    "position": "Chief Executive Officer",
    "department": "Leadership",
    "biography": "An undergraduate of Bsc . (Hons) Applied Sciences (Management sciences) at the University of Sri Jayewardenepura, complemented by professional qualifications in CIMA (Chartered Institute of Management Accountants) and CQHRM (Chartered Qualification in Human Resource Management). This multidisciplinary background provides a strong foundation in financial management, strategic decision-making, and human resource practices, alongside expertise in data analysis and scientific applications in business contexts.",
    "quote": "A meaningful brand is not built for attention, but for impact, shaped by purpose, guided by clarity, and sustained by trust.",
    "image_path": "pulitha-wanigasekara",
    "email": "pulithawanigasekara@gmail.com",
    "linkedin_url": "https://www.linkedin.com/in/pulitha-wanigasekara-36b287211",
    "instagram_url": "https://www.instagram.com/_pulitha_",
    "skills": [
      "Strategic Leadership",
      "Financial Management",
      "Business Analytics",
      "Brand Strategy",
      "Decision Making",
      "Organizational Development"
    ],
    "joined_year": 2026,
    "display_order": 2
  },
  {
    "slug": "heshan-chandrasekara",
    "name": "Heshan Chandrasekara",
    "position": "Chief Marketing Officer",
    "department": "Marketing",
    "biography": "Hi, I’m Nimanka Heshan Chandrasekara. As the Chief Marketing Officer (CMO) at Grainmuse Pvt Ltd and a passionate ICT educator, I bridge the worlds of sustainable business and digital learning. With a BET honors in Sustainable Development from the University of Kelaniya, my expertise spans web development, graphic design, and multimedia production. I’m driven by a constant curiosity for new tech trends and literature, crafting digital experiences that inspire and educate.",
    "quote": "True influence begins with authenticity when stories are rooted in truth, they naturally find their way to people.",
    "image_path": "heshan-chandrasekara",
    "email": "nimankaheshan3@gmail.com",
    "linkedin_url": "https://www.linkedin.com/in/windroidinfo",
    "instagram_url": "https://www.instagram.com/nima_chandras",
    "skills": [
      "Digital Marketing",
      "Content Strategy",
      "Web Development",
      "Graphic Design",
      "Multimedia Production",
      "Brand Communication"
    ],
    "joined_year": 2026,
    "display_order": 3
  },
  {
    "slug": "movini-wanasinghe",
    "name": "Movini Wanasinghe",
    "position": "Chief Operating Officer",
    "department": "Operations",
    "biography": "I am Movini Wanasinghe, a science driven professional with a strong passion for innovation and sustainable product development. I hold a BSc (Hons) in Cosmetic Science and am currently pursuing MBA in Business Analytics, allowing me to integrate scientific knowledge with strategic and data-driven decision-making. As the Chief Operations Officer of Grainmuse (Pvt) Ltd., I focus on bridging science and business to create high-quality natural food products that support healthier lifestyles. I am deeply committed to maintaining excellence, efficiency, and authenticity across every aspect of our operations.",
    "quote": "Excellence is a quiet discipline where care, precision, and integrity come together to create something truly lasting.",
    "image_path": "movini-wanasinghe",
    "email": "pasankawanasinghe@gmail.com",
    "linkedin_url": "https://www.linkedin.com/in/movini-wanasinghe-8a298818b",
    "instagram_url": "https://www.instagram.com/movi_wanasinghe",
    "skills": [
      "Operations Management",
      "Process Optimization",
      "Product Development",
      "Quality Assurance",
      "Business Analytics",
      "Supply Chain Management"
    ],
    "joined_year": 2026,
    "display_order": 4
  }
]
$team$::jsonb) as member(
    slug text,
    name text,
    position text,
    department text,
    biography text,
    quote text,
    image_path text,
    email text,
    linkedin_url text,
    instagram_url text,
    skills text[],
    joined_year smallint,
    display_order integer
  )
)
insert into public.team_members (
  slug, name, position, department, biography, quote, image_path, email,
  linkedin_url, instagram_url, skills, joined_year, display_order, status,
  published_at
)
select
  slug, name, position, department, biography, quote, image_path, email,
  linkedin_url, instagram_url, skills, joined_year, display_order, 'published',
  timestamptz '2026-08-15 00:00:00+00'
from source
on conflict (slug) do update
set
  name = excluded.name,
  position = excluded.position,
  department = excluded.department,
  biography = excluded.biography,
  quote = excluded.quote,
  image_path = excluded.image_path,
  email = excluded.email,
  linkedin_url = excluded.linkedin_url,
  instagram_url = excluded.instagram_url,
  skills = excluded.skills,
  joined_year = excluded.joined_year,
  display_order = excluded.display_order,
  status = excluded.status,
  published_at = excluded.published_at;
