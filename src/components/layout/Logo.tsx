/**
 * Cooper Standard brand mark.
 *
 * Two interlocking swooshes — royal blue (outer C) and golden yellow
 * (inner S) — paired with the wordmark. Hex values are pinned so the
 * mark stays brand-correct under both light and dark themes.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <CooperStandardMark className="size-9 shrink-0" />
        <div className="leading-tight">
          <div className="text-[14px] font-semibold tracking-tight text-[#0E4DA1] dark:text-primary">
            CooperStandard
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Usage Monitor
          </div>
        </div>
      </div>
    </div>
  );
}

function CooperStandardMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cooper Standard"
      role="img"
    >
      {/* Outer C — royal blue, with the upper-left tail that gives the
          mark its forward momentum. */}
      <path
        d="M44 11 C 27 7, 10 16, 10 32 C 10 48, 26 57, 45 53"
        stroke="#0E4DA1"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner S — golden yellow, the brand spark nesting inside the C. */}
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
