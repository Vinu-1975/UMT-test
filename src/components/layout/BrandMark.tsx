/**
 * Reusable Cooper Standard CS swoosh mark.
 *
 * Two interlocking strokes — royal blue outer C and golden yellow inner S.
 * Hex values are pinned so the mark stays brand-correct under both light
 * and dark themes.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cooper Standard"
      role="img"
    >
      <path
        d="M44 11 C 27 7, 10 16, 10 32 C 10 48, 26 57, 45 53"
        stroke="#0E4DA1"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 17 C 41 21, 39 32, 28 36 C 17 40, 21 51, 37 51"
        stroke="#F4B81B"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
