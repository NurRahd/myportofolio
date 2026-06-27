// Decorative floral SVG elements matching the design's blue floral accents
export function FloralTopRight({ style = {} }) {
  return (
    <svg className="floral-deco" style={{ top: 0, right: 0, width: 220, ...style }} viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.7">
        {/* Large flower */}
        <ellipse cx="160" cy="60" rx="18" ry="28" fill="#a8c0e8" transform="rotate(-30 160 60)"/>
        <ellipse cx="160" cy="60" rx="18" ry="28" fill="#b8cff0" transform="rotate(30 160 60)"/>
        <ellipse cx="160" cy="60" rx="18" ry="28" fill="#c8d8f5" transform="rotate(90 160 60)"/>
        <ellipse cx="160" cy="60" rx="18" ry="28" fill="#a8c0e8" transform="rotate(150 160 60)"/>
        <circle cx="160" cy="60" r="12" fill="#e8f0fa"/>
        <circle cx="160" cy="60" r="6" fill="#4a7fd4" opacity="0.4"/>
        {/* Small flower */}
        <ellipse cx="195" cy="30" rx="10" ry="16" fill="#b8cff0" transform="rotate(-20 195 30)"/>
        <ellipse cx="195" cy="30" rx="10" ry="16" fill="#c8d8f5" transform="rotate(40 195 30)"/>
        <ellipse cx="195" cy="30" rx="10" ry="16" fill="#a8c0e8" transform="rotate(100 195 30)"/>
        <circle cx="195" cy="30" r="7" fill="#eef4fc"/>
        <circle cx="195" cy="30" r="3.5" fill="#4a7fd4" opacity="0.35"/>
        {/* Stems */}
        <path d="M160 88 Q155 110 148 130" stroke="#7aaedc" strokeWidth="1.5" fill="none"/>
        <path d="M160 88 Q170 105 175 125" stroke="#7aaedc" strokeWidth="1.2" fill="none"/>
        {/* Leaves */}
        <ellipse cx="148" cy="130" rx="10" ry="5" fill="#9abfe0" transform="rotate(30 148 130)"/>
        <ellipse cx="175" cy="125" rx="10" ry="5" fill="#9abfe0" transform="rotate(-20 175 125)"/>
        {/* Mini buds */}
        <circle cx="120" cy="80" r="5" fill="#c8d8f5"/>
        <circle cx="130" cy="95" r="3.5" fill="#b8cff0"/>
        <circle cx="195" cy="70" r="4" fill="#d0e0f8"/>
        {/* Dots scatter */}
        <circle cx="100" cy="50" r="2.5" fill="#a8c0e8" opacity="0.6"/>
        <circle cx="210" cy="90" r="2" fill="#a8c0e8" opacity="0.5"/>
        <circle cx="140" cy="155" r="2.5" fill="#b8cff0" opacity="0.5"/>
      </g>
    </svg>
  );
}

export function FloralBottomLeft({ style = {} }) {
  return (
    <svg className="floral-deco" style={{ bottom: 0, left: 0, width: 200, ...style }} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.65">
        <ellipse cx="50" cy="140" rx="16" ry="25" fill="#a8c0e8" transform="rotate(-20 50 140)"/>
        <ellipse cx="50" cy="140" rx="16" ry="25" fill="#b8cff0" transform="rotate(40 50 140)"/>
        <ellipse cx="50" cy="140" rx="16" ry="25" fill="#c8d8f5" transform="rotate(100 50 140)"/>
        <ellipse cx="50" cy="140" rx="16" ry="25" fill="#9abfe0" transform="rotate(160 50 140)"/>
        <circle cx="50" cy="140" r="10" fill="#eef4fc"/>
        <circle cx="50" cy="140" r="5" fill="#4a7fd4" opacity="0.35"/>
        <path d="M50 115 Q44 95 40 75" stroke="#7aaedc" strokeWidth="1.5" fill="none"/>
        <path d="M50 115 Q60 98 65 80" stroke="#7aaedc" strokeWidth="1.2" fill="none"/>
        <ellipse cx="40" cy="75" rx="9" ry="4.5" fill="#9abfe0" transform="rotate(-30 40 75)"/>
        <ellipse cx="65" cy="80" rx="9" ry="4.5" fill="#9abfe0" transform="rotate(20 65 80)"/>
        <circle cx="90" cy="155" r="6" fill="#c8d8f5"/>
        <circle cx="80" cy="170" r="4" fill="#b8cff0"/>
        <circle cx="25" cy="100" r="3" fill="#d0e0f8" opacity="0.7"/>
        <circle cx="15" cy="165" r="2.5" fill="#a8c0e8" opacity="0.6"/>
      </g>
    </svg>
  );
}

export function FloralMini({ style = {} }) {
  return (
    <svg className="floral-deco" style={{ width: 90, ...style }} viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.6">
        <ellipse cx="45" cy="45" rx="12" ry="20" fill="#b8cff0" transform="rotate(0 45 45)"/>
        <ellipse cx="45" cy="45" rx="12" ry="20" fill="#c8d8f5" transform="rotate(60 45 45)"/>
        <ellipse cx="45" cy="45" rx="12" ry="20" fill="#a8c0e8" transform="rotate(120 45 45)"/>
        <circle cx="45" cy="45" r="9" fill="#eef4fc"/>
        <circle cx="45" cy="45" r="4" fill="#4a7fd4" opacity="0.3"/>
      </g>
    </svg>
  );
}

export function PaperPlane({ style = {} }) {
  return (
    <svg style={{ width: 48, ...style }} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 24L42 6L30 42L22 28L6 24Z" fill="#4a7fd4" opacity="0.15" stroke="#4a7fd4" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M22 28L30 20" stroke="#4a7fd4" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
