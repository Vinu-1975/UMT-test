export function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <div
          className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none">
            <path
              d="M5 4v10a7 7 0 1 0 14 0V4"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="20" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">UMT</div>
          <div className="text-[11px] text-muted-foreground">Usage Monitor</div>
        </div>
      </div>
    </div>
  );
}
