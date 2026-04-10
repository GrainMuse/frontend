/**
 * ProductImages.jsx
 * ─────────────────────────────────────────────────────────────
 * High-fidelity SVG product illustrations — one per product.
 * Each illustration is a standalone React component that renders
 * a richly detailed food/tea image using pure SVG.
 *
 * Usage:
 *   import { ClassicJasmineImg } from '@/assets/illustrations/ProductImages';
 *   <ClassicJasmineImg className={styles.productImg} />
 *
 * All components accept className + style props.
 */

/* ── Shared defs helper ───────────────────────────────────── */
const GrainDefs = () => (
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow
        dx="0"
        dy="4"
        stdDeviation="6"
        floodColor="#2C1A10"
        floodOpacity="0.18"
      />
    </filter>
    <filter id="softBlur">
      <feGaussianBlur stdDeviation="3" />
    </filter>
    <filter id="tinyBlur">
      <feGaussianBlur stdDeviation="1.2" />
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

/* ─────────────────────────────────────────────────────────────
   1. Classic Jasmine Fried Rice
   White jasmine rice in a dark bowl with chopsticks, steam rising
───────────────────────────────────────────────────────────── */
export function ClassicJasmineImg({ className, style }) {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Classic Jasmine Fried Rice"
    >
      <GrainDefs />
      {/* Background warm gradient */}
      <rect width="320" height="260" fill="#F0E6D0" />
      <ellipse
        cx="160"
        cy="200"
        rx="140"
        ry="30"
        fill="#D4C9B5"
        filter="url(#softBlur)"
      />

      {/* Bowl shadow */}
      <ellipse
        cx="160"
        cy="215"
        rx="90"
        ry="16"
        fill="#3D2B1F"
        opacity="0.18"
        filter="url(#softBlur)"
      />

      {/* Bowl body */}
      <path d="M70 160 Q70 220 160 228 Q250 220 250 160 Z" fill="#2C1A10" />
      {/* Bowl rim */}
      <ellipse cx="160" cy="160" rx="90" ry="22" fill="#3D2B1F" />
      <ellipse cx="160" cy="160" rx="86" ry="19" fill="#4A3020" />

      {/* Rice bed inside */}
      <ellipse cx="160" cy="158" rx="80" ry="16" fill="#FAF4EA" />

      {/* Rice grains — scattered pile */}
      {[
        [130, 148],
        [145, 144],
        [160, 142],
        [175, 144],
        [190, 148],
        [122, 153],
        [138, 150],
        [155, 148],
        [170, 148],
        [185, 152],
        [200, 155],
        [128, 158],
        [143, 155],
        [158, 153],
        [173, 153],
        [188, 157],
        [135, 163],
        [150, 160],
        [165, 160],
        [180, 163],
        [142, 168],
        [158, 166],
        [173, 168],
      ].map(([cx, cy], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={6}
          ry={3}
          fill={i % 3 === 0 ? "#FAF4EA" : i % 3 === 1 ? "#F0E6D0" : "#EDE0C8"}
          opacity={0.85 + (i % 3) * 0.05}
          transform={`rotate(${(i * 37) % 160} ${cx} ${cy})`}
        />
      ))}

      {/* Sesame seeds */}
      {[
        [148, 152],
        [162, 149],
        [175, 153],
        [155, 162],
        [168, 159],
      ].map(([cx, cy], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={2}
          ry={1}
          fill="#BF9A56"
          opacity={0.7}
          transform={`rotate(${i * 30} ${cx} ${cy})`}
        />
      ))}

      {/* Spring onion green flecks */}
      {[
        [140, 155],
        [165, 151],
        [158, 163],
        [172, 157],
      ].map(([cx, cy], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={3}
          ry={1.2}
          fill="#4E6040"
          opacity={0.75}
          transform={`rotate(${i * 45} ${cx} ${cy})`}
        />
      ))}

      {/* Chopsticks */}
      <rect
        x="195"
        y="118"
        width="5"
        height="80"
        rx="2.5"
        fill="#8B5E3C"
        transform="rotate(12 195 118)"
      />
      <rect
        x="208"
        y="115"
        width="5"
        height="80"
        rx="2.5"
        fill="#A0703C"
        transform="rotate(16 208 115)"
      />
      {/* Chopstick tips gold */}
      <rect
        x="215"
        y="183"
        width="5"
        height="12"
        rx="2.5"
        fill="#BF9A56"
        transform="rotate(16 215 183)"
      />
      <rect
        x="202"
        y="186"
        width="5"
        height="10"
        rx="2.5"
        fill="#BF9A56"
        transform="rotate(12 202 186)"
      />

      {/* Steam wisps */}
      {[
        [145, 108],
        [160, 100],
        [175, 106],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y + 30} Q${x + 6} ${y + 18} ${x} ${y} Q${x - 6} ${y - 10} ${x} ${y - 22}`}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            animation: `steamRise ${2 + i * 0.4}s ease-in-out infinite`,
            opacity: 0.6,
          }}
        />
      ))}

      {/* Product label strip */}
      <rect x="60" y="22" width="200" height="36" rx="0" fill="#2C1A10" />
      <text
        x="160"
        y="36"
        textAnchor="middle"
        fill="#BF9A56"
        fontFamily="'Outfit',sans-serif"
        fontSize="7.5"
        letterSpacing="3"
        fontWeight="600"
      >
        GRAIN MUSE
      </text>
      <text
        x="160"
        y="51"
        textAnchor="middle"
        fill="#FAF4EA"
        fontFamily="'Cormorant Garamond',serif"
        fontSize="13"
        fontWeight="300"
      >
        Classic Jasmine
      </text>

      <style>{`@keyframes steamRise{0%,100%{transform:translateY(0)opacity(0.6)}50%{transform:translateY(-8px);opacity:0.3}}`}</style>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. Garden Herb Fried Rice
   Green-flecked rice in a white ceramic bowl with herbs on top
───────────────────────────────────────────────────────────── */
export function GardenHerbImg({ className, style }) {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Garden Herb Fried Rice"
    >
      <GrainDefs />
      <rect width="320" height="260" fill="#EDF2E8" />
      <ellipse
        cx="160"
        cy="215"
        rx="88"
        ry="15"
        fill="#3D2B1F"
        opacity="0.14"
        filter="url(#softBlur)"
      />

      {/* White ceramic bowl */}
      <path d="M72 162 Q72 222 160 230 Q248 222 248 162 Z" fill="#F8F5F0" />
      <ellipse cx="160" cy="162" rx="88" ry="21" fill="#FFFFFF" />
      <ellipse cx="160" cy="162" rx="84" ry="18" fill="#F5F0EA" />
      {/* Bowl inner shadow */}
      <ellipse cx="160" cy="162" rx="80" ry="15" fill="#EDE8E0" />

      {/* Herb-green rice base */}
      <ellipse cx="160" cy="160" rx="75" ry="13" fill="#D4E4C0" />

      {/* Rice grains — light with green flecks */}
      {[
        [132, 150],
        [147, 146],
        [162, 144],
        [177, 146],
        [192, 150],
        [124, 155],
        [140, 152],
        [157, 150],
        [172, 150],
        [187, 154],
        [130, 160],
        [145, 157],
        [160, 156],
        [175, 157],
        [190, 161],
        [137, 165],
        [152, 163],
        [167, 163],
        [182, 166],
      ].map(([cx, cy], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={5.5}
          ry={2.8}
          fill={i % 4 === 0 ? "#F5EFE2" : i % 4 === 1 ? "#EEEAE0" : "#E8E4D5"}
          opacity={0.9}
          transform={`rotate(${(i * 41) % 170} ${cx} ${cy})`}
        />
      ))}

      {/* Herb flecks — basil, chive */}
      {[
        [136, 153, "#2D5A1B"],
        [155, 149, "#3A6B22"],
        [170, 153, "#2D5A1B"],
        [148, 159, "#4E6040"],
        [163, 157, "#3A6B22"],
        [178, 161, "#2D5A1B"],
        [142, 164, "#4E6040"],
        [160, 163, "#3A6B22"],
        [175, 165, "#2D5A1B"],
      ].map(([cx, cy, fill], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={3.5}
          ry={1.5}
          fill={fill}
          opacity={0.8}
          transform={`rotate(${i * 55} ${cx} ${cy})`}
        />
      ))}

      {/* Fresh herb garnish on top */}
      <ellipse
        cx="155"
        cy="142"
        rx="12"
        ry="6"
        fill="#3A7A22"
        opacity="0.85"
        transform="rotate(-20 155 142)"
      />
      <ellipse
        cx="165"
        cy="140"
        rx="10"
        ry="5"
        fill="#4E9A2E"
        opacity="0.8"
        transform="rotate(15 165 140)"
      />
      <ellipse
        cx="148"
        cy="144"
        rx="9"
        ry="4.5"
        fill="#3A7A22"
        opacity="0.75"
        transform="rotate(-35 148 144)"
      />
      <line
        x1="158"
        y1="150"
        x2="155"
        y2="162"
        stroke="#2D5A1B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="163"
        y1="149"
        x2="165"
        y2="160"
        stroke="#2D5A1B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Spring onion rings */}
      <ellipse
        cx="172"
        cy="145"
        rx="5"
        ry="2.5"
        fill="none"
        stroke="#4E9A2E"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <ellipse
        cx="145"
        cy="155"
        rx="4"
        ry="2"
        fill="none"
        stroke="#4E9A2E"
        strokeWidth="1.2"
        opacity="0.6"
      />

      {/* Wooden spoon */}
      <path
        d="M210 115 Q215 130 213 160 Q211 175 208 178 Q204 180 202 178 Q198 176 200 160 Q198 130 205 115 Z"
        fill="#C8974A"
      />
      <ellipse cx="207" cy="112" rx="10" ry="7" fill="#D4A850" />
      <path
        d="M200 112 Q207 107 214 112 Q214 120 207 122 Q200 120 200 112Z"
        fill="#BF9A56"
        opacity="0.5"
      />

      {/* Steam */}
      {[
        [148, 105],
        [163, 97],
        [178, 103],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y + 28} Q${x + 5} ${y + 15} ${x} ${y} Q${x - 5} ${y - 8} ${x} ${y - 20}`}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}

      <rect x="60" y="20" width="200" height="36" rx="0" fill="#3A6B22" />
      <text
        x="160"
        y="34"
        textAnchor="middle"
        fill="#D4F0B0"
        fontFamily="'Outfit',sans-serif"
        fontSize="7.5"
        letterSpacing="3"
        fontWeight="600"
      >
        GRAIN MUSE
      </text>
      <text
        x="160"
        y="49"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="'Cormorant Garamond',serif"
        fontSize="13"
        fontWeight="300"
      >
        Garden Herb
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. Spiced Chilli Fried Rice
   Red-tinged rice in a black wok with chilli slices
───────────────────────────────────────────────────────────── */
export function SpicedChilliImg({ className, style }) {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Spiced Chilli Fried Rice"
    >
      <GrainDefs />
      <rect width="320" height="260" fill="#F5EDE4" />
      <ellipse
        cx="160"
        cy="218"
        rx="95"
        ry="16"
        fill="#2C1A10"
        opacity="0.2"
        filter="url(#softBlur)"
      />

      {/* Wok */}
      <path d="M55 155 Q55 225 160 235 Q265 225 265 155 Z" fill="#1A1008" />
      <ellipse cx="160" cy="155" rx="105" ry="26" fill="#1A1008" />
      <ellipse cx="160" cy="155" rx="100" ry="22" fill="#221508" />
      {/* Wok sheen */}
      <ellipse
        cx="130"
        cy="148"
        rx="18"
        ry="6"
        fill="rgba(255,255,255,0.05)"
        transform="rotate(-20 130 148)"
      />

      {/* Wok handles */}
      <rect x="35" y="148" width="28" height="10" rx="5" fill="#2C1A10" />
      <rect x="257" y="148" width="28" height="10" rx="5" fill="#2C1A10" />

      {/* Red-orange rice base */}
      <ellipse cx="160" cy="153" rx="92" ry="19" fill="#C4501A" opacity="0.6" />
      <ellipse cx="160" cy="151" rx="85" ry="16" fill="#D4601A" opacity="0.5" />

      {/* Rice grains — warm orange tones */}
      {[
        [120, 141],
        [137, 137],
        [155, 135],
        [172, 137],
        [190, 141],
        [205, 147],
        [112, 148],
        [130, 145],
        [148, 143],
        [165, 143],
        [183, 145],
        [200, 149],
        [118, 155],
        [135, 152],
        [153, 150],
        [170, 150],
        [188, 153],
        [205, 157],
        [125, 161],
        [143, 158],
        [161, 158],
        [178, 160],
        [195, 163],
        [133, 167],
        [151, 165],
        [168, 165],
        [184, 168],
      ].map(([cx, cy], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={5.5}
          ry={2.8}
          fill={i % 3 === 0 ? "#E8C898" : i % 3 === 1 ? "#D4A870" : "#E0B880"}
          opacity={0.88}
          transform={`rotate(${(i * 43) % 175} ${cx} ${cy})`}
        />
      ))}

      {/* Red chilli slices */}
      {[
        [148, 143, "#C41A1A"],
        [165, 139, "#D42020"],
        [180, 147, "#B01515"],
        [155, 157, "#C41A1A"],
      ].map(([cx, cy, fill], i) => (
        <g key={i}>
          <ellipse
            cx={cx}
            cy={cy}
            rx="7"
            ry="3.5"
            fill={fill}
            opacity={0.9}
            transform={`rotate(${i * 40} ${cx} ${cy})`}
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx="5"
            ry="2.5"
            fill="none"
            stroke="#FF4040"
            strokeWidth="0.8"
            opacity={0.5}
            transform={`rotate(${i * 40} ${cx} ${cy})`}
          />
        </g>
      ))}

      {/* Paprika/spice dust */}
      {[
        [140, 152, "#D4601A"],
        [162, 148, "#B84A10"],
        [175, 155, "#D4601A"],
        [152, 163, "#B84A10"],
      ].map(([cx, cy, fill], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.5} fill={fill} opacity={0.7} />
      ))}

      {/* Spring onion green */}
      {[
        [155, 145, "#3A7A22"],
        [170, 152, "#2D5A1B"],
        [145, 158, "#3A7A22"],
      ].map(([cx, cy, fill], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={4}
          ry={1.5}
          fill={fill}
          opacity={0.8}
          transform={`rotate(${i * 60} ${cx} ${cy})`}
        />
      ))}

      {/* Heat shimmer/steam — more intense */}
      {[
        [145, 108],
        [160, 98],
        [175, 106],
        [155, 103],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y + 32} Q${x + 8} ${y + 16} ${x} ${y} Q${x - 8} ${y - 12} ${x} ${y - 26}`}
          fill="none"
          stroke="rgba(255,120,40,0.2)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}

      <rect x="60" y="18" width="200" height="36" rx="0" fill="#B84A10" />
      <text
        x="160"
        y="32"
        textAnchor="middle"
        fill="#FFD0A0"
        fontFamily="'Outfit',sans-serif"
        fontSize="7.5"
        letterSpacing="3"
        fontWeight="600"
      >
        GRAIN MUSE
      </text>
      <text
        x="160"
        y="47"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="'Cormorant Garamond',serif"
        fontSize="13"
        fontWeight="300"
      >
        Spiced Chilli
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. Chamomile & Honey Calm
   Glass teacup with golden brew, chamomile flowers, honey drizzle
───────────────────────────────────────────────────────────── */
export function ChamomileHoneyImg({ className, style }) {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Chamomile & Honey Calm Tea"
    >
      <GrainDefs />
      <defs>
        <linearGradient id="teaGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0C060" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#C8881A" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="glassG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
        </linearGradient>
      </defs>
      <rect width="320" height="260" fill="#FBF5E8" />
      <ellipse
        cx="160"
        cy="220"
        rx="75"
        ry="12"
        fill="#C8A850"
        opacity="0.15"
        filter="url(#softBlur)"
      />

      {/* Saucer */}
      <ellipse cx="160" cy="210" rx="80" ry="12" fill="#F0E0C0" />
      <ellipse cx="160" cy="209" rx="74" ry="10" fill="#F8EDD8" />
      <ellipse cx="160" cy="208" rx="50" ry="6" fill="#F0E0C0" />

      {/* Glass cup body */}
      <path
        d="M110 135 Q108 208 160 213 Q212 208 210 135 Z"
        fill="url(#teaGold)"
      />
      {/* Glass walls */}
      <path
        d="M110 135 Q108 208 160 213 Q212 208 210 135 Z"
        fill="url(#glassG)"
      />
      {/* Cup rim */}
      <ellipse cx="160" cy="135" rx="50" ry="10" fill="rgba(255,255,255,0.3)" />
      <ellipse cx="160" cy="135" rx="48" ry="9" fill="rgba(240,190,80,0.4)" />

      {/* Tea surface */}
      <ellipse cx="160" cy="135" rx="46" ry="8" fill="#D4A030" opacity="0.7" />
      {/* Surface highlights */}
      <ellipse
        cx="148"
        cy="133"
        rx="14"
        ry="4"
        fill="rgba(255,220,100,0.3)"
        transform="rotate(-15 148 133)"
      />

      {/* Handle */}
      <path
        d="M210 150 Q238 150 238 170 Q238 190 210 190"
        fill="none"
        stroke="rgba(200,160,60,0.6)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M210 150 Q234 150 234 170 Q234 190 210 190"
        fill="none"
        stroke="rgba(255,240,200,0.25)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Honey drizzle on surface */}
      <path
        d="M148 132 Q152 128 156 132 Q160 135 164 130 Q168 127 172 131"
        fill="none"
        stroke="#D4880A"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Chamomile flowers floating */}
      {/* Flower 1 */}
      <g transform="translate(148,126)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
          <ellipse
            key={i}
            cx={Math.cos((a * Math.PI) / 180) * 7}
            cy={Math.sin((a * Math.PI) / 180) * 7}
            rx="3.5"
            ry="1.8"
            fill="#FFFACD"
            opacity="0.9"
            transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * 7} ${Math.sin((a * Math.PI) / 180) * 7})`}
          />
        ))}
        <circle cx="0" cy="0" r="3.5" fill="#F5C518" />
      </g>
      {/* Flower 2 — smaller */}
      <g transform="translate(172,130) scale(0.75)">
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <ellipse
            key={i}
            cx={Math.cos((a * Math.PI) / 180) * 7}
            cy={Math.sin((a * Math.PI) / 180) * 7}
            rx="3.5"
            ry="1.8"
            fill="#FFFACD"
            opacity="0.85"
            transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * 7} ${Math.sin((a * Math.PI) / 180) * 7})`}
          />
        ))}
        <circle cx="0" cy="0" r="3.5" fill="#F0B818" />
      </g>

      {/* Tea bag tag outside cup */}
      <line
        x1="112"
        y1="135"
        x2="88"
        y2="108"
        stroke="#8B6A3E"
        strokeWidth="1.2"
      />
      <rect
        x="76"
        y="98"
        width="22"
        height="14"
        rx="1"
        fill="#EDE0C0"
        stroke="#C8A850"
        strokeWidth="1"
      />
      <text
        x="87"
        y="108"
        textAnchor="middle"
        fill="#7A5235"
        fontFamily="'Outfit',sans-serif"
        fontSize="5"
        fontWeight="600"
      >
        GM
      </text>

      {/* Steam */}
      {[
        [148, 108],
        [160, 100],
        [172, 106],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y + 20} Q${x + 5} ${y + 10} ${x} ${y} Q${x - 5} ${y - 8} ${x} ${y - 16}`}
          fill="none"
          stroke="rgba(255,220,120,0.35)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}

      {/* Scattered chamomile petals on saucer */}
      {[
        [135, 205, "#FFFACD"],
        [180, 207, "#FFFACD"],
        [158, 212, "#FFF0A0"],
      ].map(([cx, cy, fill], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="5"
          ry="2"
          fill={fill}
          opacity="0.7"
          transform={`rotate(${i * 55} ${cx} ${cy})`}
        />
      ))}

      <rect x="62" y="20" width="196" height="36" rx="0" fill="#C8881A" />
      <text
        x="160"
        y="34"
        textAnchor="middle"
        fill="#FFF0C0"
        fontFamily="'Outfit',sans-serif"
        fontSize="7.5"
        letterSpacing="3"
        fontWeight="600"
      >
        GRAIN MUSE
      </text>
      <text
        x="160"
        y="49"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="'Cormorant Garamond',serif"
        fontSize="13"
        fontWeight="300"
      >
        Chamomile & Honey
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. Ginger & Turmeric Vitality
   Deep amber brew in a dark clay mug, ginger root slices beside
───────────────────────────────────────────────────────────── */
export function GingerTurmericImg({ className, style }) {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Ginger & Turmeric Vitality Tea"
    >
      <GrainDefs />
      <defs>
        <linearGradient id="amberTea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4700A" />
          <stop offset="100%" stopColor="#8B3A05" />
        </linearGradient>
      </defs>
      <rect width="320" height="260" fill="#F5ECE0" />
      <ellipse
        cx="160"
        cy="218"
        rx="72"
        ry="11"
        fill="#4A2800"
        opacity="0.15"
        filter="url(#softBlur)"
      />

      {/* Clay mug */}
      <path d="M112 130 L116 208 Q160 220 204 208 L208 130 Z" fill="#7A4520" />
      <rect x="112" y="128" width="96" height="8" rx="3" fill="#8B5530" />
      {/* Mug texture lines */}
      <path
        d="M116 150 Q160 155 204 150"
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="1"
      />
      <path
        d="M115 170 Q160 175 205 170"
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="1"
      />
      <path
        d="M115 190 Q160 195 205 190"
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="1"
      />
      {/* Mug highlight */}
      <path
        d="M118 132 L121 205 Q125 210 122 210 L118 132Z"
        fill="rgba(255,255,255,0.08)"
      />

      {/* Handle */}
      <path
        d="M208 145 Q240 145 240 168 Q240 192 208 192"
        fill="none"
        stroke="#6B3A18"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M208 145 Q234 145 234 168 Q234 192 208 192"
        fill="none"
        stroke="#8B5530"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Tea inside */}
      <ellipse cx="160" cy="130" rx="46" ry="8" fill="url(#amberTea)" />
      {/* Surface sheen */}
      <ellipse
        cx="152"
        cy="128"
        rx="16"
        ry="4"
        fill="rgba(255,160,40,0.25)"
        transform="rotate(-10 152 128)"
      />

      {/* Turmeric swirl */}
      <path
        d="M148 128 Q155 124 162 128 Q169 131 175 127"
        fill="none"
        stroke="#F0A020"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Mug logo */}
      <text
        x="160"
        y="168"
        textAnchor="middle"
        fill="rgba(255,200,100,0.3)"
        fontFamily="'Cormorant Garamond',serif"
        fontSize="28"
        fontWeight="300"
      >
        GM
      </text>

      {/* Ginger root slices beside mug */}
      <g transform="translate(80,160)">
        <ellipse
          cx="0"
          cy="0"
          rx="18"
          ry="12"
          fill="#D4A850"
          transform="rotate(-15)"
        />
        <ellipse
          cx="0"
          cy="0"
          rx="14"
          ry="9"
          fill="#C89840"
          transform="rotate(-15)"
        />
        {[0, 30, 60, 90, 120, 150].map((a, i) => (
          <line
            key={i}
            x1="0"
            y1="0"
            x2={Math.cos((a * Math.PI) / 180) * 11}
            y2={Math.sin((a * Math.PI) / 180) * 11 * 0.65}
            stroke="#A07830"
            strokeWidth="0.8"
            opacity="0.5"
            transform="rotate(-15 0 0)"
          />
        ))}
      </g>
      {/* Second slice */}
      <g transform="translate(240,172)">
        <ellipse
          cx="0"
          cy="0"
          rx="14"
          ry="9"
          fill="#E0B050"
          transform="rotate(20)"
        />
        <ellipse
          cx="0"
          cy="0"
          rx="10"
          ry="6.5"
          fill="#C89840"
          transform="rotate(20)"
        />
      </g>

      {/* Turmeric powder */}
      <circle
        cx="88"
        cy="185"
        r="4"
        fill="#D4A020"
        opacity="0.5"
        filter="url(#tinyBlur)"
      />
      <circle
        cx="82"
        cy="190"
        r="3"
        fill="#E0B030"
        opacity="0.4"
        filter="url(#tinyBlur)"
      />

      {/* Steam — intense */}
      {[
        [148, 102],
        [160, 93],
        [172, 100],
        [155, 97],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y + 28} Q${x + 7} ${y + 14} ${x} ${y} Q${x - 7} ${y - 12} ${x} ${y - 24}`}
          fill="none"
          stroke="rgba(255,150,30,0.25)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}

      <rect x="58" y="18" width="204" height="36" rx="0" fill="#8B3A05" />
      <text
        x="160"
        y="32"
        textAnchor="middle"
        fill="#FFD090"
        fontFamily="'Outfit',sans-serif"
        fontSize="7.5"
        letterSpacing="3"
        fontWeight="600"
      >
        GRAIN MUSE
      </text>
      <text
        x="160"
        y="47"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="'Cormorant Garamond',serif"
        fontSize="13"
        fontWeight="300"
      >
        Ginger & Turmeric
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. Peppermint & Lemon Clarity
   Clear glass with green brew, mint leaves, lemon slice
───────────────────────────────────────────────────────────── */
export function PeppermintLemonImg({ className, style }) {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Peppermint & Lemon Clarity Tea"
    >
      <GrainDefs />
      <defs>
        <linearGradient id="mintTea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A8D8A8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#4A9A6A" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect width="320" height="260" fill="#EEF5EE" />
      <ellipse
        cx="160"
        cy="218"
        rx="68"
        ry="10"
        fill="#2D5A2D"
        opacity="0.12"
        filter="url(#softBlur)"
      />

      {/* Tall glass */}
      <path
        d="M118 110 L122 208 Q160 216 198 208 L202 110 Z"
        fill="url(#mintTea)"
      />
      {/* Glass walls transparent */}
      <path
        d="M118 110 L122 208 Q160 216 198 208 L202 110 Z"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
      />
      {/* Glass top rim */}
      <ellipse cx="160" cy="110" rx="42" ry="8" fill="rgba(200,240,200,0.5)" />
      <ellipse cx="160" cy="110" rx="40" ry="7" fill="rgba(168,216,168,0.6)" />
      {/* Glass base */}
      <ellipse cx="160" cy="210" rx="38" ry="7" fill="rgba(74,154,106,0.6)" />
      {/* Glass highlight */}
      <path
        d="M120 114 L123 206 Q122 208 120 207 L117 113Z"
        fill="rgba(255,255,255,0.2)"
      />

      {/* Ice cubes */}
      {[
        [142, 178],
        [158, 188],
        [170, 175],
        [148, 192],
      ].map(([cx, cy], i) => (
        <rect
          key={i}
          x={cx - 9}
          y={cy - 8}
          width="18"
          height="16"
          rx="2"
          fill="rgba(255,255,255,0.45)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="0.8"
          transform={`rotate(${i * 12} ${cx} ${cy})`}
        />
      ))}

      {/* Mint leaves floating */}
      <ellipse
        cx="150"
        cy="138"
        rx="14"
        ry="6"
        fill="#2D8A4A"
        opacity="0.85"
        transform="rotate(-25 150 138)"
      />
      <path
        d="M144 138 Q150 132 156 138"
        fill="none"
        stroke="#1A6A32"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <ellipse
        cx="172"
        cy="148"
        rx="11"
        ry="5"
        fill="#3A9A52"
        opacity="0.8"
        transform="rotate(20 172 148)"
      />
      <path
        d="M167 148 Q172 143 177 148"
        fill="none"
        stroke="#1A6A32"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <ellipse
        cx="145"
        cy="157"
        rx="9"
        ry="4"
        fill="#2D8A4A"
        opacity="0.75"
        transform="rotate(-40 145 157)"
      />

      {/* Lemon slice on rim */}
      <g transform="translate(195,106)">
        <circle cx="0" cy="0" r="14" fill="#F5DC50" opacity="0.9" />
        <circle cx="0" cy="0" r="11" fill="#F8E860" />
        {[0, 51, 102, 153, 204, 255, 306].map((a, i) => (
          <path
            key={i}
            d={`M0,0 L${Math.cos((a * Math.PI) / 180) * 11},${Math.sin((a * Math.PI) / 180) * 11}`}
            stroke="#D4B830"
            strokeWidth="0.8"
            opacity="0.5"
          />
        ))}
        <circle cx="0" cy="0" r="3" fill="#F0D040" />
        <path
          d="M-14,-2 L-18,-8"
          stroke="#3A7A22"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Straw */}
      <rect
        x="178"
        y="85"
        width="5"
        height="130"
        rx="2.5"
        fill="rgba(255,255,255,0.7)"
        transform="rotate(5 178 85)"
      />
      <rect
        x="179"
        y="86"
        width="2"
        height="130"
        rx="1"
        fill="rgba(255,255,255,0.4)"
        transform="rotate(5 179 86)"
      />

      {/* Cool steam */}
      {[
        [148, 95],
        [160, 88],
        [172, 93],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y + 18} Q${x + 4} ${y + 9} ${x} ${y} Q${x - 4} ${y - 7} ${x} ${y - 14}`}
          fill="none"
          stroke="rgba(180,240,180,0.3)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}

      <rect x="62" y="18" width="196" height="36" rx="0" fill="#2D7A3A" />
      <text
        x="160"
        y="32"
        textAnchor="middle"
        fill="#C0F0C0"
        fontFamily="'Outfit',sans-serif"
        fontSize="7.5"
        letterSpacing="3"
        fontWeight="600"
      >
        GRAIN MUSE
      </text>
      <text
        x="160"
        y="47"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="'Cormorant Garamond',serif"
        fontSize="13"
        fontWeight="300"
      >
        Peppermint & Lemon
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   7. Hibiscus & Rose Hip Glow
   Deep ruby tea in a clear glass pitcher, hibiscus petals
───────────────────────────────────────────────────────────── */
export function HibiscusRoseHipImg({ className, style }) {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Hibiscus & Rose Hip Glow Tea"
    >
      <GrainDefs />
      <defs>
        <linearGradient id="rubyTea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C01830" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6B0A1A" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width="320" height="260" fill="#F8EEF0" />
      <ellipse
        cx="160"
        cy="220"
        rx="80"
        ry="13"
        fill="#6B0A1A"
        opacity="0.15"
        filter="url(#softBlur)"
      />

      {/* Glass pitcher */}
      <path
        d="M108 105 L112 208 Q160 218 208 208 L212 105 Z"
        fill="url(#rubyTea)"
      />
      {/* Glass walls */}
      <path
        d="M108 105 L112 208 Q160 218 208 208 L212 105 Z"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
      />
      {/* Pitcher top rim */}
      <ellipse cx="160" cy="105" rx="52" ry="10" fill="rgba(200,20,40,0.4)" />
      <ellipse cx="160" cy="105" rx="50" ry="9" fill="rgba(190,24,48,0.5)" />
      {/* Pitcher highlight */}
      <path
        d="M110 108 L113 205 Q111 207 109 206 L107 107Z"
        fill="rgba(255,255,255,0.15)"
      />

      {/* Pitcher handle/spout hint */}
      <path
        d="M212 130 Q242 135 244 158 Q244 182 212 185"
        fill="none"
        stroke="rgba(200,24,50,0.4)"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* Ruby surface */}
      <ellipse cx="160" cy="105" rx="48" ry="8" fill="#B01830" opacity="0.6" />
      <ellipse
        cx="150"
        cy="103"
        rx="16"
        ry="4"
        fill="rgba(255,100,120,0.2)"
        transform="rotate(-10 150 103)"
      />

      {/* Hibiscus petals floating in tea */}
      {[
        [145, 130, "#D42040", -15],
        [168, 125, "#B81830", 20],
        [155, 148, "#C01838", -30],
        [178, 142, "#D42040", 15],
        [140, 155, "#B81830", -20],
      ].map(([cx, cy, fill, rot], i) => (
        <g key={i} transform={`translate(${cx},${cy}) rotate(${rot})`}>
          <ellipse cx="0" cy="-7" rx="5" ry="9" fill={fill} opacity="0.8" />
          <ellipse
            cx="6.5"
            cy="-2"
            rx="5"
            ry="9"
            fill={fill}
            opacity="0.75"
            transform="rotate(72)"
          />
          <ellipse
            cx="4"
            cy="7"
            rx="5"
            ry="9"
            fill={fill}
            opacity="0.7"
            transform="rotate(144)"
          />
          <ellipse
            cx="-4"
            cy="7"
            rx="5"
            ry="9"
            fill={fill}
            opacity="0.75"
            transform="rotate(216)"
          />
          <ellipse
            cx="-6.5"
            cy="-2"
            rx="5"
            ry="9"
            fill={fill}
            opacity="0.8"
            transform="rotate(288)"
          />
          <circle cx="0" cy="0" r="3" fill="#F5C0C8" opacity="0.9" />
        </g>
      ))}

      {/* Rose hip berries */}
      {[
        [135, 143, "#C82828"],
        [175, 135, "#D43030"],
        [162, 158, "#B81A1A"],
      ].map(([cx, cy, fill], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill={fill} opacity="0.85" />
      ))}

      {/* Dried hibiscus on surface */}
      <path
        d="M148 104 Q155 100 162 104 Q169 107 175 103"
        fill="none"
        stroke="#FF6080"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Scattered petals beside pitcher */}
      {[
        [86, 160, "#D42040", "-10"],
        [90, 175, "#C01838", "20"],
        [240, 165, "#B81830", "-25"],
      ].map(([cx, cy, fill, r], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="10"
          ry="5"
          fill={fill}
          opacity="0.5"
          transform={`rotate(${r} ${cx} ${cy})`}
        />
      ))}

      {/* Steam — faint pinkish */}
      {[
        [148, 80],
        [160, 72],
        [172, 78],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y + 28} Q${x + 5} ${y + 14} ${x} ${y} Q${x - 5} ${y - 10} ${x} ${y - 22}`}
          fill="none"
          stroke="rgba(220,80,100,0.2)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}

      <rect x="58" y="18" width="204" height="36" rx="0" fill="#9B1A28" />
      <text
        x="160"
        y="32"
        textAnchor="middle"
        fill="#FFB0C0"
        fontFamily="'Outfit',sans-serif"
        fontSize="7.5"
        letterSpacing="3"
        fontWeight="600"
      >
        GRAIN MUSE
      </text>
      <text
        x="160"
        y="47"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="'Cormorant Garamond',serif"
        fontSize="13"
        fontWeight="300"
      >
        Hibiscus & Rose Hip
      </text>
    </svg>
  );
}

/* ── Map by product slug ──────────────────────────────────── */
export const PRODUCT_IMAGES = {
  "classic-jasmine": ClassicJasmineImg,
  "garden-herb": GardenHerbImg,
  "spiced-chilli": SpicedChilliImg,
  "chamomile-honey": ChamomileHoneyImg,
  "ginger-turmeric": GingerTurmericImg,
  "peppermint-lemon": PeppermintLemonImg,
  "hibiscus-rosehip": HibiscusRoseHipImg,
};

export function ProductImage({ src, className, style }) {
  const Img = src;
  if (!Img)
    return (
      <div className={className} style={{ background: "#F0E6D0", ...style }} />
    );
  return <Img className={className} style={style} />;
}
