import { BrandMark } from "./BrandMark";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <BrandMark className="size-9 shrink-0" />
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
