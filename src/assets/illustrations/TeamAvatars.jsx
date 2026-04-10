/**
 * TeamAvatars.jsx
 * ─────────────────────────────────────────────────────────────
 * Hand-crafted SVG portrait illustrations for each team member.
 * Each avatar has distinct skin tone, hair, and expression.
 */

function Avatar({ bg, skin, hair, shirtColor, accent, initials, name }) {
  return (
    <svg
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <clipPath id={`clip-${initials}`}>
          <rect width="200" height="220" rx="0" />
        </clipPath>
        <radialGradient id={`bgGrad-${initials}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={bg} stopOpacity="1" />
          <stop offset="100%" stopColor={bg} stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id={`skinGrad-${initials}`} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={skin} stopOpacity="1" />
          <stop offset="100%" stopColor={skin} stopOpacity="0.85" />
        </radialGradient>
      </defs>

      <rect width="200" height="220" fill={`url(#bgGrad-${initials})`} />

      {/* Shirt / body */}
      <ellipse cx="100" cy="235" rx="75" ry="55" fill={shirtColor} />
      <ellipse
        cx="100"
        cy="230"
        rx="55"
        ry="40"
        fill={shirtColor}
        opacity="0.8"
      />
      {/* Collar highlight */}
      <path
        d="M78 188 Q100 198 122 188 Q122 210 100 216 Q78 210 78 188Z"
        fill="rgba(255,255,255,0.15)"
      />

      {/* Neck */}
      <rect
        x="88"
        y="162"
        width="24"
        height="32"
        rx="10"
        fill={`url(#skinGrad-${initials})`}
      />

      {/* Head */}
      <ellipse
        cx="100"
        cy="130"
        rx="46"
        ry="54"
        fill={`url(#skinGrad-${initials})`}
      />

      {/* Hair */}
      <ellipse cx="100" cy="90" rx="48" ry="34" fill={hair} />
      <ellipse cx="100" cy="82" rx="44" ry="26" fill={hair} />
      {/* Side hair */}
      <ellipse cx="58" cy="118" rx="16" ry="28" fill={hair} />
      <ellipse cx="142" cy="118" rx="16" ry="28" fill={hair} />

      {/* Ear left */}
      <ellipse cx="55" cy="132" rx="8" ry="11" fill={skin} />
      <ellipse cx="56" cy="132" rx="5" ry="7" fill={skin} opacity="0.7" />
      {/* Ear right */}
      <ellipse cx="145" cy="132" rx="8" ry="11" fill={skin} />
      <ellipse cx="144" cy="132" rx="5" ry="7" fill={skin} opacity="0.7" />

      {/* Eyes */}
      <ellipse cx="84" cy="126" rx="8" ry="9" fill="white" />
      <ellipse cx="116" cy="126" rx="8" ry="9" fill="white" />
      <ellipse cx="85" cy="127" rx="5" ry="6" fill="#2C1A10" />
      <ellipse cx="117" cy="127" rx="5" ry="6" fill="#2C1A10" />
      {/* Eye shine */}
      <circle cx="87" cy="124" r="2" fill="white" opacity="0.8" />
      <circle cx="119" cy="124" r="2" fill="white" opacity="0.8" />
      {/* Eyebrows */}
      <path
        d={`M76 116 Q84 112 92 115`}
        fill="none"
        stroke={hair}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d={`M108 115 Q116 112 124 116`}
        fill="none"
        stroke={hair}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse cx="100" cy="140" rx="5" ry="3.5" fill={skin} opacity="0.5" />
      <path
        d="M95 142 Q100 146 105 142"
        fill="none"
        stroke={skin}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Smile */}
      <path
        d="M86 154 Q100 163 114 154"
        fill="none"
        stroke="#9B5A3A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M88 154 Q100 161 112 154" fill="rgba(200,100,80,0.15)" />

      {/* Accent dot/pin */}
      <circle cx="152" cy="196" r="8" fill={accent} opacity="0.9" />
      <text
        x="152"
        y="200"
        textAnchor="middle"
        fill="white"
        fontFamily="'Outfit',sans-serif"
        fontSize="7"
        fontWeight="700"
      >
        ✦
      </text>
    </svg>
  );
}

export function AvatarFactory({ member }) {
  switch (member) {
  }
}

export function AvatarAmal() {
  return (
    <Avatar
      bg="#E8D5B8"
      skin="#C8906A"
      hair="#1A0F08"
      shirtColor="#2C1A10"
      accent="#BF9A56"
      initials="AS"
      name="Amal"
    />
  );
}

export function AvatarNilufar() {
  return (
    <Avatar
      bg="#D8E8D8"
      skin="#D4A87C"
      hair="#3D1F0A"
      shirtColor="#4E6040"
      accent="#D4A843"
      initials="NK"
      name="Nilufar"
    />
  );
}

export function AvatarRavindra() {
  return (
    <Avatar
      bg="#E0E8F0"
      skin="#B87850"
      hair="#0A0A0A"
      shirtColor="#2D4A6A"
      accent="#BF9A56"
      initials="RP"
      name="Ravindra"
    />
  );
}

export function AvatarShehan() {
  return (
    <Avatar
      bg="#F0E8D8"
      skin="#E0B090"
      hair="#2A1408"
      shirtColor="#7A5235"
      accent="#D4A843"
      initials="SW"
      name="Shehan"
    />
  );
}

export function AvatarMadushika() {
  return (
    <Avatar
      bg="#F0D8E0"
      skin="#C8846A"
      hair="#180A04"
      shirtColor="#9B2335"
      accent="#BF9A56"
      initials="MF"
      name="Madushika"
    />
  );
}

export function AvatarKasun() {
  return (
    <Avatar
      bg="#D8EAE0"
      skin="#A87050"
      hair="#0A0A0A"
      shirtColor="#2D5A2D"
      accent="#D4A843"
      initials="KD"
      name="Kasun"
    />
  );
}

export const AVATAR_MAP = {
  "amal-silva": AvatarAmal,
  "nilufar-kasim": AvatarNilufar,
  "ravindra-perera": AvatarRavindra,
  "shehan-wickrama": AvatarShehan,
  "madushika-fernando": AvatarMadushika,
  "kasun-dissanayake": AvatarKasun,
};
