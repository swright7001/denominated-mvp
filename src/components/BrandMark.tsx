import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className = "" }: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-12 w-12 overflow-hidden rounded-md border border-[rgba(240,163,111,0.28)] bg-black/40">
        <Image
          src="/brand/logo.png"
          alt="Denominated logo"
          fill
          sizes="48px"
          className="brand-logo-crop scale-[2.7]"
          priority
        />
      </div>
      {!compact && (
        <div>
          <div className="text-2xl font-medium leading-none text-[#f1e7d8]">
            Denominated
          </div>
          <div className="mt-1 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-[#f0a36f]">
            Measure life in purchasing power.
          </div>
        </div>
      )}
    </div>
  );
}
