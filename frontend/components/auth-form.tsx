"use client";

import React, { useEffect, useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  LockKeyhole,
  Mail,
  Mic,
  ShieldCheck,
  Sparkles,
  UserRound,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/components/ui";
import { ApiError, workspacePathForRole } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type AuthMode = "login" | "register";

export function FlagIcon({ code, className = "w-4 h-3 rounded-[2px] shadow-xs flex-shrink-0" }: { code: string; className?: string }) {
  const c = code.toLowerCase();
  switch (c) {
    case "en":
    case "gb":
      return (
        <svg className={className} viewBox="0 0 60 36" fill="none">
          <clipPath id="gb-flag"><rect width="60" height="36" rx="2" /></clipPath>
          <g clipPath="url(#gb-flag)">
            <rect width="60" height="36" fill="#012169" />
            <path d="M0,0 L60,36 M60,0 L0,36" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,36 M60,0 L0,36" stroke="#C8102E" strokeWidth="3" />
            <path d="M30,0 v36 M0,18 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v36 M0,18 h60" stroke="#C8102E" strokeWidth="6" />
          </g>
        </svg>
      );
    case "ja":
    case "jp":
      return (
        <svg className={className} viewBox="0 0 60 36" fill="none">
          <rect width="60" height="36" rx="2" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
          <circle cx="30" cy="18" r="10.8" fill="#BC002D" />
        </svg>
      );
    case "fr":
      return (
        <svg className={className} viewBox="0 0 60 36" fill="none">
          <clipPath id="fr-flag"><rect width="60" height="36" rx="2" /></clipPath>
          <g clipPath="url(#fr-flag)">
            <rect width="20" height="36" fill="#002654" />
            <rect x="20" width="20" height="36" fill="#FFFFFF" />
            <rect x="40" width="20" height="36" fill="#ED2939" />
          </g>
        </svg>
      );
    case "es":
      return (
        <svg className={className} viewBox="0 0 60 36" fill="none">
          <clipPath id="es-flag"><rect width="60" height="36" rx="2" /></clipPath>
          <g clipPath="url(#es-flag)">
            <rect width="60" height="9" fill="#AA151B" />
            <rect y="9" width="60" height="18" fill="#F1BF00" />
            <rect y="27" width="60" height="9" fill="#AA151B" />
            <circle cx="18" cy="18" r="3.5" fill="#AA151B" opacity="0.8" />
          </g>
        </svg>
      );
    case "de":
      return (
        <svg className={className} viewBox="0 0 60 36" fill="none">
          <clipPath id="de-flag"><rect width="60" height="36" rx="2" /></clipPath>
          <g clipPath="url(#de-flag)">
            <rect width="60" height="12" fill="#000000" />
            <rect y="12" width="60" height="12" fill="#DD0000" />
            <rect y="24" width="60" height="12" fill="#FFCC00" />
          </g>
        </svg>
      );
    case "ko":
    case "kr":
      return (
        <svg className={className} viewBox="0 0 60 36" fill="none">
          <clipPath id="kr-flag"><rect width="60" height="36" rx="2" /></clipPath>
          <g clipPath="url(#kr-flag)">
            <rect width="60" height="36" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
            <circle cx="30" cy="18" r="8" fill="#CD2E3A" />
            <path d="M 22,18 A 8,8 0 0,0 38,18 A 4,4 0 0,1 30,18 A 4,4 0 0,0 22,18" fill="#0047A0" />
            <rect x="13" y="8" width="2" height="6" fill="#000" transform="rotate(-30 14 11)" />
            <rect x="45" y="8" width="2" height="6" fill="#000" transform="rotate(30 46 11)" />
            <rect x="13" y="22" width="2" height="6" fill="#000" transform="rotate(30 14 25)" />
            <rect x="45" y="22" width="2" height="6" fill="#000" transform="rotate(-30 46 25)" />
          </g>
        </svg>
      );
    case "zh":
    case "cn":
      return (
        <svg className={className} viewBox="0 0 60 36" fill="none">
          <clipPath id="cn-flag"><rect width="60" height="36" rx="2" /></clipPath>
          <g clipPath="url(#cn-flag)">
            <rect width="60" height="36" fill="#EE1C25" />
            <polygon points="10,5 12,11 18,11 13,15 15,21 10,17 5,21 7,15 2,11 8,11" fill="#FFFF00" transform="scale(0.7) translate(4, 2)" />
            <circle cx="18" cy="6" r="1.2" fill="#FFFF00" />
            <circle cx="21" cy="9" r="1.2" fill="#FFFF00" />
            <circle cx="21" cy="14" r="1.2" fill="#FFFF00" />
            <circle cx="18" cy="17" r="1.2" fill="#FFFF00" />
          </g>
        </svg>
      );
    case "vi":
    case "vn":
    default:
      return (
        <svg className={className} viewBox="0 0 60 36" fill="none">
          <clipPath id="vn-flag"><rect width="60" height="36" rx="2" /></clipPath>
          <g clipPath="url(#vn-flag)">
            <rect width="60" height="36" fill="#DA251D" />
            <polygon points="30,7 33.5,15.5 42.5,15.5 35,21 38,29.5 30,24 22,29.5 25,21 17.5,15.5 26.5,15.5" fill="#FFFF00" />
          </g>
        </svg>
      );
  }
}

interface LanguageShowcaseItem {
  code: string;
  name: string;
  flag: string;
  word: string;
  ipa: string;
  meaningVi: string;
  meaningEn: string;
  partOfSpeech: string;
  quote: string;
  author: string;
  accentColor: string;
  bgGradient: string;
}

const showcaseLanguages: LanguageShowcaseItem[] = [
  {
    code: "en",
    name: "English",
    flag: "🇬🇧",
    word: "Serendipity",
    ipa: "/ˌser.ənˈdɪp.ə.ti/",
    meaningVi: "Sự tình cờ may mắn, duyên kỳ ngộ",
    meaningEn: "Good luck in finding valuable things by chance",
    partOfSpeech: "noun · C2",
    quote: "Every new word you learn is a new window onto the world.",
    author: "Language Wisdom",
    accentColor: "from-blue-500 to-indigo-600",
    bgGradient: "rgba(59, 130, 246, 0.12)",
  },
  {
    code: "ja",
    name: "日本語",
    flag: "🇯🇵",
    word: "木漏れ日 (Komorebi)",
    ipa: "/ko-mo-re-bi/",
    meaningVi: "Ánh nắng vàng xuyên qua kẽ lá",
    meaningEn: "Sunlight filtering through the trees",
    partOfSpeech: "noun · N1",
    quote: "一語一語が、あなたの新しい未来の扉を開く。",
    author: "Japanese Proverb",
    accentColor: "from-rose-500 to-pink-600",
    bgGradient: "rgba(244, 63, 94, 0.12)",
  },
  {
    code: "fr",
    name: "Français",
    flag: "🇫🇷",
    word: "Éphémère",
    ipa: "/e.fe.mɛʁ/",
    meaningVi: "Phù du, thoáng qua nhưng rực rỡ",
    meaningEn: "Lasting for a very short, beautiful time",
    partOfSpeech: "adj · B2",
    quote: "Chaque mot prononcé est une passerelle vers une autre âme.",
    author: "Pensée Française",
    accentColor: "from-violet-500 to-purple-600",
    bgGradient: "rgba(139, 92, 246, 0.12)",
  },
  {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
    word: "Esperanza",
    ipa: "/es.peˈɾan.sa/",
    meaningVi: "Niềm hy vọng và khát vọng",
    meaningEn: "Hope, expectation, and belief in tomorrow",
    partOfSpeech: "noun · B1",
    quote: "El idioma es el mapa de carreteras de una cultura.",
    author: "Rita Mae Brown",
    accentColor: "from-amber-500 to-orange-600",
    bgGradient: "rgba(245, 158, 11, 0.12)",
  },
  {
    code: "de",
    name: "Deutsch",
    flag: "🇩🇪",
    word: "Fernweh",
    ipa: "/ˈfɛʁn.veː/",
    meaningVi: "Khao khát được đi đến những miền đất xa",
    meaningEn: "An ache to travel to distant places",
    partOfSpeech: "noun · B2",
    quote: "Die Grenzen meiner Sprache bedeuten die Grenzen meiner Welt.",
    author: "Ludwig Wittgenstein",
    accentColor: "from-emerald-500 to-teal-600",
    bgGradient: "rgba(16, 185, 129, 0.12)",
  },
  {
    code: "ko",
    name: "한국어",
    flag: "🇰🇷",
    word: "인연 (Inyeon)",
    ipa: "/in-yeon/",
    meaningVi: "Duyên phận kết nối con người",
    meaningEn: "Destiny and meaningful connection between souls",
    partOfSpeech: "noun · TOPIK II",
    quote: "배움에는 끝이 없고, 언어는 세상을 넓힌다.",
    author: "Korean Idiom",
    accentColor: "from-cyan-500 to-blue-600",
    bgGradient: "rgba(6, 182, 212, 0.12)",
  },
  {
    code: "zh",
    name: "中文",
    flag: "🇨🇳",
    word: "初心 (Chūxīn)",
    ipa: "/chū-xīn/",
    meaningVi: "Tâm nguyện ban đầu, giữ trọn ước mơ",
    meaningEn: "Original intention and pure dedication",
    partOfSpeech: "noun · HSK 5",
    quote: "不忘初心，方得始终；千里之行，始于足下。",
    author: "Ancient Wisdom",
    accentColor: "from-red-500 to-amber-600",
    bgGradient: "rgba(239, 68, 68, 0.12)",
  },
  {
    code: "vi",
    name: "Tiếng Việt",
    flag: "🇻🇳",
    word: "Khát vọng",
    ipa: "/kʰaːt˧˦ vawŋ͡m˧˨/",
    meaningVi: "Ước muốn cháy bỏng vươn tầm thế giới",
    meaningEn: "Burning aspiration to explore the global world",
    partOfSpeech: "noun · Native",
    quote: "Học một ngoại ngữ mới là sống thêm một cuộc đời mới.",
    author: "Danh ngôn học tập",
    accentColor: "from-emerald-500 to-green-600",
    bgGradient: "rgba(34, 197, 94, 0.12)",
  },
];

interface StreamColumn {
  code: string;
  name: string;
  flag: string;
  speedClass: string;
  words: Array<{ text: string; sub?: string }>;
}

const languageStreamColumns: StreamColumn[] = [
  {
    code: "EN",
    name: "English",
    flag: "🇬🇧",
    speedClass: "animate-cascade-down",
    words: [
      { text: "Serendipity", sub: "duyên kỳ ngộ" },
      { text: "Fluency", sub: "lưu loát" },
      { text: "Discovery", sub: "khám phá" },
      { text: "Inspire", sub: "truyền cảm hứng" },
      { text: "Mastery", sub: "thành thạo" },
      { text: "Brilliance", sub: "rực rỡ" },
      { text: "Elevation", sub: "vươn tầm" },
      { text: "Horizon", sub: "chân trời" },
      { text: "Insight", sub: "sâu sắc" },
      { text: "Perseverance", sub: "kiên trì" },
    ],
  },
  {
    code: "JA",
    name: "日本語",
    flag: "🇯🇵",
    speedClass: "animate-cascade-down-fast",
    words: [
      { text: "木漏れ日", sub: "Komorebi" },
      { text: "一期一会", sub: "Ichigo ichie" },
      { text: "未来", sub: "Mirai" },
      { text: "夢", sub: "Yume" },
      { text: "希望", sub: "Kibou" },
      { text: "情熱", sub: "Jounetsu" },
      { text: "絆", sub: "Kizuna" },
      { text: "成長", sub: "Seichou" },
      { text: "挑戦", sub: "Chousen" },
      { text: "光", sub: "Hikari" },
    ],
  },
  {
    code: "FR",
    name: "Français",
    flag: "🇫🇷",
    speedClass: "animate-cascade-down-slow",
    words: [
      { text: "Éphémère", sub: "thoáng qua" },
      { text: "Lumière", sub: "ánh sáng" },
      { text: "Voyage", sub: "chuyến đi" },
      { text: "Savoir", sub: "tri thức" },
      { text: "Espoir", sub: "hy vọng" },
      { text: "Courage", sub: "can đảm" },
      { text: "Liberté", sub: "tự do" },
      { text: "Passion", sub: "đam mê" },
      { text: "Avenir", sub: "tương lai" },
      { text: "Harmonie", sub: "hài hòa" },
    ],
  },
  {
    code: "ES",
    name: "Español",
    flag: "🇪🇸",
    speedClass: "animate-cascade-down",
    words: [
      { text: "Esperanza", sub: "hy vọng" },
      { text: "Aventura", sub: "phiêu lưu" },
      { text: "Pasión", sub: "đam mê" },
      { text: "Libertad", sub: "tự do" },
      { text: "Sabiduría", sub: "thông thái" },
      { text: "Sonrisa", sub: "nụ cười" },
      { text: "Fuerza", sub: "sức mạnh" },
      { text: "Destino", sub: "định mệnh" },
      { text: "Corazón", sub: "trái tim" },
      { text: "Éxito", sub: "thành công" },
    ],
  },
  {
    code: "DE",
    name: "Deutsch",
    flag: "🇩🇪",
    speedClass: "animate-cascade-down-fast",
    words: [
      { text: "Fernweh", sub: "chân trời xa" },
      { text: "Zukunft", sub: "tương lai" },
      { text: "Wunderbar", sub: "tuyệt vời" },
      { text: "Erfolg", sub: "thành công" },
      { text: "Freude", sub: "niềm vui" },
      { text: "Glaube", sub: "niềm tin" },
      { text: "Mut", sub: "dũng cảm" },
      { text: "Wissen", sub: "kiến thức" },
      { text: "Fortschritt", sub: "tiến bộ" },
      { text: "Stärke", sub: "bản lĩnh" },
    ],
  },
  {
    code: "KO",
    name: "한국어",
    flag: "🇰🇷",
    speedClass: "animate-cascade-down-slow",
    words: [
      { text: "인연", sub: "Inyeon" },
      { text: "꿈", sub: "Kkum" },
      { text: "도전", sub: "Dojeon" },
      { text: "행복", sub: "Haengbok" },
      { text: "사랑", sub: "Sarang" },
      { text: "열정", sub: "Yeoljeong" },
      { text: "희망", sub: "Huimang" },
      { text: "성장", sub: "Seongjang" },
      { text: "용기", sub: "Yonggi" },
      { text: "지혜", sub: "Jihye" },
    ],
  },
  {
    code: "ZH",
    name: "中文",
    flag: "🇨🇳",
    speedClass: "animate-cascade-down",
    words: [
      { text: "初心", sub: "Chūxīn" },
      { text: "光明", sub: "Guāngmíng" },
      { text: "卓越", sub: "Zhuóyuè" },
      { text: "博学", sub: "Bóxué" },
      { text: "恒心", sub: "Héngxīn" },
      { text: "远方", sub: "Yuǎnfāng" },
      { text: "笃行", sub: "Dǔxíng" },
      { text: "凌云", sub: "Língyún" },
      { text: "智慧", sub: "Zhìhuì" },
      { text: "梦想", sub: "Mèngxiǎng" },
    ],
  },
  {
    code: "VI",
    name: "Tiếng Việt",
    flag: "🇻🇳",
    speedClass: "animate-cascade-down-fast",
    words: [
      { text: "Khát vọng", sub: "Aspiration" },
      { text: "Tri thức", sub: "Knowledge" },
      { text: "Vươn xa", sub: "Reach out" },
      { text: "Đam mê", sub: "Passion" },
      { text: "Tương lai", sub: "Future" },
      { text: "Bản lĩnh", sub: "Confidence" },
      { text: "Kiên định", sub: "Steadfast" },
      { text: "Khai phóng", sub: "Liberation" },
      { text: "Thành tựu", sub: "Achievement" },
      { text: "Tự hào", sub: "Pride" },
    ],
  },
];

const oauthErrorMessages: Record<string, string> = {
  google_cancelled: "Bạn đã huỷ đăng nhập Google.",
  google_email_unverified: "Tài khoản Google của bạn chưa được xác minh email.",
  google_not_configured: "Đăng nhập Google chưa được kích hoạt trên máy chủ.",
  google_failed: "Không thể kết nối đến Google. Vui lòng thử lại sau.",
};

export function AuthForm({ mode: initialMode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();

  const isRegister = initialMode === "register";

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize error from searchParams if present
  const oauthParam = searchParams.get("oauth_error");
  const [error, setError] = useState<string>(() =>
    oauthParam ? (oauthErrorMessages[oauthParam] ?? "Đăng nhập Google thất bại. Vui lòng thử lại.") : ""
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Polyglot Showcase state
  const [activeLangIndex, setActiveLangIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Form IDs for accessibility
  const nameInputId = useId();
  const emailInputId = useId();
  const passwordInputId = useId();
  const confirmPasswordInputId = useId();
  const rememberCheckboxId = useId();

  // Auto cycle language showcase cards
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLangIndex((prev) => (prev + 1) % showcaseLanguages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Clean up oauth_error from URL without triggering render loop
  useEffect(() => {
    if (searchParams.get("oauth_error")) {
      const params = new URLSearchParams(window.location.search);
      params.delete("oauth_error");
      const newQuery = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`);
    }
  }, [searchParams]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Trống", color: "bg-slate-300 dark:bg-slate-700" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Yếu", color: "bg-rose-500 text-rose-500" };
      case 2:
        return { score: 2, label: "Trung bình", color: "bg-amber-500 text-amber-500" };
      case 3:
        return { score: 3, label: "Tốt", color: "bg-blue-500 text-blue-500" };
      case 4:
        return { score: 4, label: "Rất mạnh", color: "bg-emerald-500 text-emerald-500" };
      default:
        return { score: 1, label: "Yếu", color: "bg-rose-500 text-rose-500" };
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = !isRegister || (confirmPassword.length > 0 && password === confirmPassword);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (isRegister && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setSubmitting(true);
    try {
      let user;
      if (isRegister) {
        user = await register(email, password, firstName.trim());
        setSuccessMessage("Tạo tài khoản thành công! Đang chuyển tiếp…");
      } else {
        user = await login(email, password);
        setSuccessMessage("Đăng nhập thành công! Đang mở không gian làm việc…");
      }

      const next = searchParams.get("next");
      const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : workspacePathForRole(user.role);
      setTimeout(() => {
        router.replace(destination);
      }, 350);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
      } else if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError("Không thể hoàn tất yêu cầu. Vui lòng kiểm tra lại kết nối và thử lại.");
      }
      setSubmitting(false);
    }
  }

  function startGoogleLogin() {
    setError("");
    const googleStartURL = new URL("/api/auth/google/start", window.location.origin);
    const next = searchParams.get("next");
    if (next) googleStartURL.searchParams.set("next", next);
    window.location.assign(googleStartURL.toString());
  }

  function handleDemoLogin() {
    setEmail("learner@example.com");
    setPassword("learn123456");
    if (isRegister) {
      setFirstName("Học Viên");
      setConfirmPassword("learn123456");
    }
  }

  function playPronunciationSound() {
    setIsAudioPlaying(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const activeItem = showcaseLanguages[activeLangIndex];
      const utterance = new SpeechSynthesisUtterance(activeItem.word);
      utterance.lang = activeItem.code === "vi" ? "vi-VN" : activeItem.code === "ja" ? "ja-JP" : activeItem.code === "fr" ? "fr-FR" : activeItem.code === "es" ? "es-ES" : activeItem.code === "de" ? "de-DE" : activeItem.code === "ko" ? "ko-KR" : activeItem.code === "zh" ? "zh-CN" : "en-US";
      utterance.onend = () => setIsAudioPlaying(false);
      utterance.onerror = () => setIsAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsAudioPlaying(false), 900);
    }
  }

  const currentShowcase = showcaseLanguages[activeLangIndex];

  return (
    <main className="min-h-screen w-full flex items-stretch relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Subtle Ambient Background Grids */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-[15%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 dark:bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/5 dark:bg-indigo-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e125_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e125_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      </div>

      <div className="relative z-10 w-full min-h-screen lg:h-screen lg:max-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT COLUMN: INTERACTIVE POLYGLOT SHOWCASE (lg:col-span-7) */}
        {/* ========================================================= */}
        <section className="hidden lg:flex lg:col-span-7 flex-col justify-between p-4 sm:p-5 xl:p-6 relative border-r border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/70 backdrop-blur-md transition-colors overflow-hidden lg:h-screen lg:max-h-screen">
          {/* TOP SECTION: BRAND BAR & LANGUAGE SELECTOR (SÁT ĐỈNH) */}
          <div className="w-full space-y-2 flex-shrink-0">
            {/* Top Brand Bar */}
            <div className="flex items-center justify-between w-full">
              <Logo size="md" variant="default" tagline="MULTI-LANGUAGE LEARN" animated={false} />
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-[11px] sm:text-xs">8 Ngôn ngữ toàn cầu</span>
                <span className="text-slate-400 dark:text-slate-600">·</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">AI Tutor</span>
              </div>
            </div>

            {/* Language Selector Horizontal Tabs */}
            <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {showcaseLanguages.map((lang, idx) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLangIndex(idx)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 flex-shrink-0 cursor-pointer",
                    activeLangIndex === idx
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm"
                  )}
                >
                  <FlagIcon code={lang.code} className="w-4 h-3 rounded-[2px] shadow-xs flex-shrink-0" />
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MIDDLE: RESPONSIVE DYNAMIC-HEIGHT VERTICAL CASCADING STREAMS (flex-1 min-h-0 co giãn theo màn hình) */}
          <div className="w-full flex-1 min-h-0 my-1 overflow-hidden flex flex-col justify-stretch">
            <div className="w-full h-full grid grid-cols-8 divide-x divide-slate-200/60 dark:divide-slate-800/60 select-none overflow-hidden">
              {languageStreamColumns.map((col) => (
                <div key={col.code} className="flex flex-col min-w-0 h-full">
                  {/* Cascading Animated Waterfall Column (Dynamic Responsive Height) */}
                  <div className="h-full min-h-0 overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_3%,black_97%,transparent)] select-none">
                    <div className={cn("flex flex-col gap-2 py-1 items-center text-center", col.speedClass)}>
                      {/* 5x Duplicate lists for deep continuous infinite flow */}
                      {[...col.words, ...col.words, ...col.words, ...col.words, ...col.words].map((item, wIdx) => (
                        <div key={wIdx} className="px-0.5 flex flex-col items-center">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-full">
                            {item.text}
                          </span>
                          {item.sub && (
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-full font-sans">
                              {item.sub}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM SECTION: INTERACTIVE VOCABULARY CARD & METRIC PILLS (Sát footer, không tràn) */}
          <div className="w-full space-y-2 flex-shrink-0">
            {/* Main Interactive Word Card */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm dark:shadow-xl transition-colors w-full">
              {/* Top Pill */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                    <FlagIcon code={currentShowcase.code} className="w-3.5 h-2.5 rounded-[2px] flex-shrink-0" />
                    <span>{currentShowcase.name}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {currentShowcase.partOfSpeech}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={playPronunciationSound}
                  title="Nghe phát âm"
                  aria-label={`Nghe phát âm từ ${currentShowcase.word}`}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer",
                    isAudioPlaying
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  <Volume2 size={12} className={isAudioPlaying ? "animate-pulse" : ""} />
                  <span>{isAudioPlaying ? "Đang phát…" : "Phát âm"}</span>
                </button>
              </div>

              {/* Big Vocabulary Word */}
              <div className="mb-1.5">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-baseline gap-2">
                  <span>{currentShowcase.word}</span>
                  <span className="text-xs sm:text-sm font-serif text-slate-500 dark:text-slate-400 font-normal">
                    {currentShowcase.ipa}
                  </span>
                </h3>
              </div>

              {/* Meanings */}
              <div className="space-y-1 mb-2">
                <div className="flex items-start gap-1.5">
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 mt-0.5">VI</span>
                  <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-snug">
                    {currentShowcase.meaningVi}
                  </p>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[9px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1 py-0.5 rounded border border-blue-200 dark:border-blue-500/20 mt-0.5">EN</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-snug">
                    {currentShowcase.meaningEn}
                  </p>
                </div>
              </div>

              {/* Cultural Quote Footer */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-[11px]">
                <Sparkles size={12} className="text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="italic font-serif text-slate-700 dark:text-slate-300 leading-tight text-[11px]">
                    &ldquo;{currentShowcase.quote}&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">
                    — {currentShowcase.author}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Metric High-Impact Feature Pills */}
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-0.5 transition-colors">
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Zap size={11} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">AI Tutor</span>
                </div>
                <span className="text-[11px] text-slate-900 dark:text-slate-200 font-semibold">Phản hồi 0.3s</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">Chữa lỗi tức thì</span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-0.5 transition-colors">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Mic size={11} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Speech Lab</span>
                </div>
                <span className="text-[11px] text-slate-900 dark:text-slate-200 font-semibold">Chuẩn IPA</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">Chấm điểm phát âm</span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-0.5 transition-colors">
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Flame size={11} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">SRS Memory</span>
                </div>
                <span className="text-[11px] text-slate-900 dark:text-slate-200 font-semibold">Nhớ lâu 4x</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">Lặp lại ngắt quãng</span>
              </div>
            </div>
          </div>

          {/* Left Panel Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800 w-full flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-500" /> Bảo mật mã hóa 256-bit
              </span>
              <span>·</span>
              <span>Đồng bộ đa thiết bị</span>
            </div>
            <span>© 2026 LinguaAtlas</span>
          </div>
        </section>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: AUTHENTICATION FORM (lg:col-span-5)         */}
        {/* ========================================================= */}
        <section className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 xl:p-12 relative bg-white dark:bg-slate-950 transition-colors">
          {/* Top Auth Header: Back link & Utilities */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
            >
              <ArrowRight size={13} className="rotate-180" />
              <span>Trang chủ</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-[11px] font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/25 px-2.5 py-1.5 rounded-lg transition"
              >
                ⚡ Điền thử nghiệm
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Main Form Center Container */}
          <div className="my-auto max-w-sm w-full mx-auto">
            {/* Mobile Brand Header */}
            <div className="lg:hidden mb-6 flex items-center justify-center">
              <Logo size="md" variant="default" tagline="MULTI-LANGUAGE LEARN" />
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isRegister ? "Tạo tài khoản LinguaAtlas" : "Đăng nhập tài khoản"}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {isRegister
                  ? "Bắt đầu học ngoại ngữ với lộ trình cá nhân hóa và AI Tutor."
                  : "Chào mừng bạn trở lại! Đăng nhập để tiếp tục bài học."}
              </p>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">!</div>
                <div className="flex-1 leading-relaxed">{error}</div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 p-0.5"
                  aria-label="Đóng thông báo lỗi"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="flex-1 leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* ========================== FORM ========================== */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Register: First Name */}
              {isRegister && (
                <div className="space-y-1.5">
                  <label htmlFor={nameInputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tên hiển thị của bạn
                  </label>
                  <div className="relative flex items-center">
                    <UserRound size={15} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      id={nameInputId}
                      name="first_name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ví dụ: Hoàng Quyến"
                      autoComplete="name"
                      maxLength={100}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 transition"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor={emailInputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Địa chỉ Email
                </label>
                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    id={emailInputId}
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor={passwordInputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mật khẩu
                  </label>
                  {!isRegister && (
                    <Link
                      href="/help"
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                    >
                      Quên mật khẩu?
                    </Link>
                  )}
                </div>

                <div className="relative flex items-center">
                  <LockKeyhole size={15} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    id={passwordInputId}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 8 ký tự"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    minLength={8}
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 focus:outline-none"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Password Strength Meter (Register mode) */}
                {isRegister && password.length > 0 && (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Độ mạnh mật khẩu:</span>
                      <span className={cn("font-bold", passwordStrength.color)}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={cn(
                            "flex-1 h-full rounded-full transition-all duration-200",
                            step <= passwordStrength.score ? passwordStrength.color : "bg-transparent"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password (Register mode) */}
              {isRegister && (
                <div className="space-y-1.5">
                  <label htmlFor={confirmPasswordInputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <KeyRound size={15} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      id={confirmPasswordInputId}
                      name="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="w-full pl-10 pr-11 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 focus:outline-none"
                      aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
                      {passwordsMatch ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <Check size={13} /> Khớp mật khẩu
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                          <X size={13} /> Mật khẩu chưa trùng khớp
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Remember Me Checkbox */}
              {!isRegister && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id={rememberCheckboxId}
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                  />
                  <label htmlFor={rememberCheckboxId} className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    Ghi nhớ đăng nhập trên thiết bị này
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "w-full py-2.5 rounded-lg font-semibold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer mt-2",
                  submitting
                    ? "bg-blue-600/60 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                )}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xử lý…</span>
                  </>
                ) : isRegister ? (
                  <>
                    <span>Tạo tài khoản</span>
                    <ArrowRight size={15} />
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-slate-950 text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                Hoặc
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={startGoogleLogin}
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition duration-150 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {/* Authentic Google Multi-Color SVG Icon */}
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.43 7.37 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.57 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
              <span>{isRegister ? "Đăng ký với Google" : "Đăng nhập với Google"}</span>
            </button>

            {/* Bottom Terms */}
            {isRegister && (
              <p className="text-[11px] text-slate-500 dark:text-slate-500 text-center mt-4 leading-relaxed">
                Bằng việc tạo tài khoản, bạn đồng ý với{" "}
                <Link href="/help" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline">
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link href="/help" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline">
                  Chính sách quyền riêng tư
                </Link>{" "}
                của LinguaAtlas.
              </p>
            )}
          </div>

          {/* Bottom Help & Switch Mode Prompt */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
            {isRegister ? (
              <p>
                Đã có tài khoản học tập?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold ml-1 inline-block"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            ) : (
              <p>
                Chưa có tài khoản LinguaAtlas?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold ml-1 inline-block"
                >
                  Đăng ký miễn phí
                </Link>
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
