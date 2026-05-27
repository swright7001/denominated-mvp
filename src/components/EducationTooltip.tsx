import { Info } from "lucide-react";

export function EducationTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <Info size={16} className="text-[#f0a36f]" aria-label={text} />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-md border border-[rgba(240,163,111,0.28)] bg-[#15110e] p-3 text-xs leading-5 text-[#efe6da] shadow-2xl group-hover:block">
        {text}
      </span>
    </span>
  );
}
