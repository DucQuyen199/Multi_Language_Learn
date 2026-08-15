import { LogoMark } from "@/components/logo";

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-4">
      <LogoMark size="lg" animated={true} />
      <p className="text-xs font-semibold text-slate-500 animate-pulse tracking-wider uppercase">
        Đang tải dữ liệu…
      </p>
    </div>
  );
}
