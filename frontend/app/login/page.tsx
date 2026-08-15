import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { LogoMark } from "@/components/logo";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
          <LogoMark size="lg" animated={true} />
          <p className="text-sm font-medium text-slate-400 animate-pulse">Đang tải không gian đăng nhập…</p>
        </div>
      }
    >
      <AuthForm mode="login" />
    </Suspense>
  );
}

