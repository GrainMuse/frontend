const ITEMS = [
  'Instant Fried Rice',
  'Herbal Teas',
  'Natural Ingredients',
  'Crafted with Care',
  'Premium Quality',
  'Sri Lankan Heritage',
  'Wholesome Goodness',
  'Grain Muse',
];

export default function Marquee({ dark = true }) {
  const doubled = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="marquee-outer" style={dark ? {} : { background: 'var(--gm-warm)' }}>
      <div className="marquee-track">
        {doubled.map((text, i) => (
          <span className="marquee-item" key={i}>
            <span className="marquee-dot" />
            <span style={dark ? {} : { color: 'var(--gm-deep)' }}>{text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
