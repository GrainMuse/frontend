-- Move the remaining editable site content out of the frontend bundle.

create table public.site_content (
  id uuid primary key default extensions.gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  value jsonb not null check (jsonb_typeof(value) in ('object', 'array')),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index site_content_public_listing_idx
  on public.site_content(key)
  where status = 'published';

create trigger site_content_set_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

create policy "published site content is publicly readable"
on public.site_content for select
to anon, authenticated
using (status = 'published');

create policy "staff manage site content"
on public.site_content for all
to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

revoke all on table public.site_content from anon, authenticated;
grant select on table public.site_content to anon, authenticated;
grant insert, update, delete on table public.site_content to authenticated;

insert into public.site_content (key, value, status)
values
  (
    'company',
    $company${
      "name": "Grain Muse",
      "logo": "grainmuse",
      "tagline": "Craft Foods & Herbal Teas",
      "description": "A Sri Lankan craft food company born from a simple belief: everyday meals deserve real ingredients and genuine care.",
      "email": "trade@grainmuse.net",
      "tradeEmail": "trade@grainmuse.net",
      "phone1": "+94 729 839 172",
      "phone2": "+94 71 366 3434",
      "location": "119, Kimbulapitiya, Negombo",
      "hours": "Mon–Fri, 8am–5pm IST",
      "socials": {
        "instagram": "https://www.instagram.com/grainmuse1",
        "facebook": "https://web.facebook.com/people/Grain-Muse/61588632778147",
        "linkedin": "#"
      }
    }$company$::jsonb,
    'published'
  ),
  (
    'navigation',
    $navigation$[
      { "label": "Home", "path": "/" },
      { "label": "Products", "path": "/products" },
      { "label": "About", "path": "/about" },
      { "label": "Our Team", "path": "/team" },
      { "label": "Contact", "path": "/contact" }
    ]$navigation$::jsonb,
    'published'
  ),
  (
    'values',
    $values$[
      {
        "icon": "🌾",
        "title": "Heritage Grains",
        "desc": "We source premium rice varieties from Sri Lankan highland farms, processed slowly to honour their natural character."
      },
      {
        "icon": "🌿",
        "title": "Whole Botanicals",
        "desc": "Every herb in our teas is whole-leaf or whole-flower never powdered extracts or artificial flavour substitutes."
      },
      {
        "icon": "✦",
        "title": "Clean Labels",
        "desc": "No hidden additives. No artificial preservatives. Every ingredient is named and natural. Always."
      },
      {
        "icon": "❤️",
        "title": "Crafted with Care",
        "desc": "Small-batch production means we never lose sight of quality. Every pack is made with intention and pride."
      }
    ]$values$::jsonb,
    'published'
  ),
  (
    'process_steps',
    $process$[
      {
        "step": "01",
        "title": "Ingredient Sourcing",
        "desc": "We work directly with trusted Sri Lankan farms to source heritage grains, fresh herbs, and whole botanicals at peak quality."
      },
      {
        "step": "02",
        "title": "Slow Processing",
        "desc": "Our grains are dehydrated to preserve natural flavour, colour, and nutritional integrity."
      },
      {
        "step": "03",
        "title": "Recipe Development",
        "desc": "Each blend goes through dozens of taste tests before approval balancing flavour, nutrition, and clean-label standards."
      },
      {
        "step": "04",
        "title": "Quality Sealing",
        "desc": "Packed in protective, sustainable packaging designed to lock in freshness from our kitchen to yours."
      }
    ]$process$::jsonb,
    'published'
  )
on conflict (key) do update
set
  value = excluded.value,
  status = excluded.status;
