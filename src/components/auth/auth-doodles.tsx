/**
 * Soft line drawings in the background of the login and sign-up pages. Decorative only: hidden from
 * screen readers, not clickable, and kept faint so the form stays the focus.
 */
export function AuthDoodles() {
  const ink = "fill-none stroke-current";
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1000 800"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 hidden h-full w-full text-ld-primary/30 md:block"
    >
      <g className={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* heart, top left */}
        <g transform="translate(110 110) scale(2.2) rotate(-12)">
          <path d="M16 30 C16 30 0 20 0 8 C0 -4 16 -4 16 6 C16 -4 32 -4 32 8 C32 20 16 30 16 30 Z" />
        </g>
        {/* sparkle, top right */}
        <g transform="translate(870 120) scale(2)">
          <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" />
        </g>
        {/* teacup, bottom left */}
        <g transform="translate(120 620) scale(2)">
          <path d="M0 10 H22 V22 Q22 32 11 32 Q0 32 0 22 Z" />
          <path d="M22 14 Q32 14 30 22 Q28 28 22 26" />
          <path d="M6 -4 Q9 -10 6 -14 M13 -4 Q16 -10 13 -14" />
        </g>
        {/* paper plane, bottom right */}
        <g transform="translate(820 600) scale(2.4) rotate(10)">
          <path d="M0 14 L34 0 L20 34 L14 20 Z" />
          <path d="M14 20 L34 0" />
        </g>
        {/* leaf, middle left */}
        <g transform="translate(60 360) scale(2.2) rotate(-20)">
          <path d="M0 20 Q10 0 30 0 Q30 20 0 20 Z" />
          <path d="M0 20 L20 6" />
        </g>
        {/* crescent moon, middle right */}
        <g transform="translate(900 360) scale(1.8)">
          <path d="M20 0 A16 16 0 1 0 20 32 A12 12 0 1 1 20 0 Z" />
        </g>
        {/* small star, upper middle */}
        <g transform="translate(470 70) scale(1.6)">
          <path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z" />
        </g>
        {/* tiny hearts, lower middle */}
        <g transform="translate(420 735) scale(1.1)">
          <path d="M16 30 C16 30 0 20 0 8 C0 -4 16 -4 16 6 C16 -4 32 -4 32 8 C32 20 16 30 16 30 Z" />
        </g>
        <g transform="translate(560 745) scale(0.8) rotate(12)">
          <path d="M16 30 C16 30 0 20 0 8 C0 -4 16 -4 16 6 C16 -4 32 -4 32 8 C32 20 16 30 16 30 Z" />
        </g>
      </g>
    </svg>
  );
}

/**
 * A couple sitting on a bench in the park, one of them taking a photo. Line art only, in the same soft
 * brand colour as the other doodles. Decorative: hidden from screen readers and from small screens.
 */
export function CoupleOnBench() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 220 124"
      className="pointer-events-none absolute bottom-6 left-4 hidden w-72 text-ld-primary/35 lg:block xl:left-10"
    >
      <g className="fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* ground */}
        <path d="M0 110 H220" />
        {/* tree */}
        <path d="M204 110 V76" />
        <circle cx="204" cy="60" r="18" />
        {/* bench */}
        <path d="M24 86 H130" />
        <path d="M24 66 Q78 58 130 66" />
        <path d="M30 66 V86" />
        <path d="M124 66 V86" />
        <path d="M34 86 V108" />
        <path d="M120 86 V108" />
        {/* person one, seated and smiling */}
        <circle cx="54" cy="46" r="10" />
        <path d="M54 58 Q53 72 55 86" />
        <path d="M55 66 Q72 68 86 60" />
        <path d="M55 86 Q62 98 70 108" />
        <path d="M55 86 Q48 98 44 108" />
        {/* person two, seated, holding up a camera */}
        <circle cx="104" cy="46" r="10" />
        <path d="M104 58 Q103 72 105 86" />
        <path d="M104 66 Q96 70 88 64" />
        <path d="M104 58 Q110 48 116 34" />
        <path d="M105 86 Q112 98 118 108" />
        <path d="M105 86 Q98 98 94 108" />
        <g transform="translate(112 18) rotate(18)">
          <rect x="-2" y="0" width="16" height="11" rx="2" />
          <circle cx="6" cy="5.5" r="3" />
        </g>
        {/* little hearts */}
        <g transform="translate(70 14) scale(0.55)">
          <path d="M16 30 C16 30 0 20 0 8 C0 -4 16 -4 16 6 C16 -4 32 -4 32 8 C32 20 16 30 16 30 Z" />
        </g>
        <g transform="translate(130 4) scale(0.4) rotate(-10)">
          <path d="M16 30 C16 30 0 20 0 8 C0 -4 16 -4 16 6 C16 -4 32 -4 32 8 C32 20 16 30 16 30 Z" />
        </g>
      </g>
    </svg>
  );
}
