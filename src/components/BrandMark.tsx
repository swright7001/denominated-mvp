import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className = "" }: BrandMarkProps) {
  return (
    <div className={`flex min-w-0 items-center gap-2 sm:gap-3 ${className}`}>
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[rgba(240,163,111,0.28)] bg-black/40 sm:h-12 sm:w-12">
        <Image
          src="/brand/logo-mark.png"
          alt="Denominated logo"
          fill
          sizes="48px"
          className="object-cover"
          priority
        />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className="truncate text-xl font-medium leading-none text-[#f1e7d8] sm:text-2xl">
            Denominated
          </div>
          <div className="mt-1 truncate text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#f0a36f] sm:text-[0.64rem] sm:tracking-[0.24em]">
            Measure life in purchasing power.
          </div>
        </div>
      )}
    </div>
  );
}
