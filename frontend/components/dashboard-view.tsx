"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Headphones,
  Library,
  Mic2,
  PencilLine,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useLearningStore } from "@/lib/store";
import { Badge, EmptyState, MiniBars, ProgressBar, SectionHeading, Skeleton, StatCard, cn } from "@/components/ui";
import { t } from "@/lib/i18n";

const skillItems = [
  { key: "listening", label: "Listening", icon: Headphones, tone: "blue" as const },
  { key: "speaking", label: "Speaking", icon: Mic2, tone: "orange" as const },
  { key: "reading", label: "Reading", icon: BookOpen, tone: "green" as const },
  { key: "writing", label: "Writing", icon: PencilLine, tone: "purple" as const },
];

const todayPath = [
  { title: "Review 10 words", detail: "Spaced repetition", icon: RotateCcw, href: "/app/flashcards", tone: "blue" },
  { title: "Listen & notice", detail: "B1 · 8 min", icon: Headphones, href: "/app/listening", tone: "orange" },
  { title: "Write a clear claim", detail: "Academic writing", icon: PencilLine, href: "/app/writing", tone: "purple" },
];

export function DashboardView() {
  const language = useLearningStore((state) => state.targetLanguage);
  const summaryQuery = useQuery({ queryKey: ["dashboard", language], queryFn: () => api.dashboard(language) });
  const vocabularyQuery = useQuery({ queryKey: ["vocabulary"], queryFn: api.vocabulary });

  if (summaryQuery.isLoading) return <DashboardSkeleton />;
  if (summaryQuery.isError) {
    return <div className="state-page"><EmptyState icon={Sparkles} title="Your learning space is taking a pause" description={summaryQuery.error.message}><button className="button button-primary" onClick={() => summaryQuery.refetch()}>Try again</button></EmptyState></div>;
  }

  if (!summaryQuery.data) return <div className="state-page"><EmptyState icon={Sparkles} title="No dashboard data yet" description="Start the API and try loading your workspace again." /></div>;

  const data = summaryQuery.data;
  const reviewWords = vocabularyQuery.data?.slice(0, 3) ?? [];
  const xpPercent = Math.round((data.daily_xp / Math.max(data.daily_goal, 1)) * 100);

  return (
    <div className="dashboard-page page-enter">
      <div className="page-header dashboard-header">
        <div><p className="eyebrow eyebrow-blue">{t("common.today")} · Thursday, August 14</p><h1>Good afternoon, {data.greeting} <span className="wave">✦</span></h1><p className="page-lede">A small, focused session today keeps your English moving forward.</p></div>
        <Link href="/app/flashcards" className="button button-primary"><Play size={16} fill="currentColor" /> Start a session</Link>
      </div>

      <section className="dashboard-hero-grid">
        <article className="goal-card">
          <div className="goal-glow" />
          <div className="goal-top"><div><p className="eyebrow eyebrow-light">Daily focus</p><h2>Make today <em>count.</em></h2><p>Build a little momentum across the skills that matter most to you.</p></div><div className="goal-ring" style={{ "--ring-progress": `${Math.min(xpPercent, 100) * 3.6}deg` } as React.CSSProperties}><strong>{Math.min(xpPercent, 100)}<small>%</small></strong><span>complete</span></div></div>
          <div className="goal-progress"><div className="goal-progress-label"><span>Daily goal</span><strong>{data.daily_xp} <small>/ {data.daily_goal} XP</small></strong></div><ProgressBar value={xpPercent} tone="primary" label="Daily goal" /></div>
          <div className="goal-footer"><span><Target size={15} /> {data.current_level} path</span><span><Clock3 size={15} /> {data.study_minutes} {t("common.minutes")} studied</span><Link href="/app/progress">View progress <ArrowRight size={14} /></Link></div>
        </article>

        <article className="level-card">
          <div className="level-card-orbit orbit-one" /><div className="level-card-orbit orbit-two" />
          <div className="level-top"><div><span className="level-kicker">Current level</span><strong>{data.current_level}</strong><span>Independent user</span></div><div className="level-badge"><Sparkles size={16} /><span>On track</span></div></div>
          <div className="level-meter"><div className="level-meter-head"><span>Progress to B2</span><strong>{data.level_progress}%</strong></div><ProgressBar value={data.level_progress} tone="green" label="Progress to next level" /></div>
          <div className="level-quote"><span className="quote-mark">“</span><p>Clarity is not a destination. It is a habit.</p><span className="quote-source">— your next lesson</span></div>
        </article>
      </section>

      <section className="stat-grid">
        <StatCard icon={Flame} label="Current streak" value={`${data.streak_days} days`} meta="Keep it alive today" tone="orange" />
        <StatCard icon={Clock3} label="Study time" value={`${data.study_minutes} min`} meta="↑ 14% from last week" tone="blue" />
        <StatCard icon={Library} label="Words learned" value={data.words_learned.toLocaleString()} meta="Your personal lexicon" tone="green" />
        <StatCard icon={RotateCcw} label="Due for review" value={data.due_reviews} meta="Ready when you are" tone="purple" />
      </section>

      <section className="dashboard-columns">
        <div className="dashboard-main-column">
          <SectionHeading eyebrow="Your path" title="A balanced practice, made simple" description="Three short steps picked for your current momentum." action={<Link href="/app/courses" className="text-link">Explore courses <ArrowRight size={14} /></Link>} />
          <div className="path-list">
            {todayPath.map((item, index) => { const Icon = item.icon; return <Link href={item.href} className="path-card" key={item.title}><span className={cn("path-index", `path-index-${item.tone}`)}>0{index + 1}</span><span className={cn("path-icon", `path-icon-${item.tone}`)}><Icon size={18} /></span><span className="path-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><span className="path-arrow"><ChevronRight size={17} /></span></Link>; })}
          </div>

          <SectionHeading eyebrow="Review queue" title="Words waiting for you" description="A quick revisit now makes recall easier later." action={<Link href="/app/vocabulary" className="text-link">Open vocabulary <ArrowRight size={14} /></Link>} />
          <div className="review-card">
            {reviewWords.length ? reviewWords.map((word) => <Link href={`/dictionary/en/${word.word}`} key={word.id} className="review-row"><span className="word-initial">{word.word.slice(0, 1).toUpperCase()}</span><span className="review-word"><strong>{word.word}</strong><small>{word.ipa} · {word.part_of_speech}</small></span><Badge tone={word.mastery > 0.65 ? "green" : "orange"}>{word.mastery > 0.65 ? "Familiar" : "Due now"}</Badge><span className="review-translation">{word.translation || "Review meaning"}</span><ChevronRight size={16} /></Link>) : <EmptyState icon={Check} title="Your review queue is clear" description="Save a word from the dictionary and it will appear here when it is ready to revisit." action={<Link href="/dictionary" className="button button-secondary">Open dictionary</Link>} />}
            {reviewWords.length ? <Link href="/app/flashcards" className="review-cta"><span><RotateCcw size={16} /> Review all {data.due_reviews} words</span><ArrowRight size={15} /></Link> : null}
          </div>
        </div>

        <aside className="dashboard-side-column">
          <article className="skills-card"><div className="card-heading"><div><p className="eyebrow">Skill balance</p><h3>Four ways forward</h3></div><Link href="/app/progress" className="round-arrow" aria-label="Open progress"><ArrowRight size={16} /></Link></div><div className="skill-list">{skillItems.map((skill) => { const Icon = skill.icon; const value = data.skills[skill.key as keyof typeof data.skills]; return <div className="skill-row" key={skill.key}><span className={cn("skill-icon", `skill-${skill.tone}`)}><Icon size={15} /></span><span className="skill-name">{skill.label}</span><ProgressBar value={value} tone={skill.tone === "blue" ? "primary" : skill.tone} /><strong>{value}%</strong></div>; })}</div><div className="skills-chart"><MiniBars values={[26, 42, 32, 55, 46, 68, 59, 74, 62, 80, 72, 88]} tone="blue" /><span>Last 12 sessions <TrendingUp size={13} /> improving</span></div></article>
          <article className="tutor-card"><div className="tutor-spark"><BrainCircuit size={20} /></div><p className="eyebrow eyebrow-purple">Your AI tutor</p><h3>Make one idea clearer.</h3><p>Ask about a word, grammar point, or sentence you are shaping right now.</p><Link href="/app/ai-tutor" className="button button-dark">Open tutor <ArrowRight size={15} /></Link></article>
        </aside>
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return <div className="dashboard-page"><div className="page-header"><div><Skeleton className="skeleton-eyebrow" /><Skeleton className="skeleton-title" /><Skeleton className="skeleton-lede" /></div><Skeleton className="skeleton-button" /></div><div className="dashboard-hero-grid"><Skeleton className="skeleton-panel" /><Skeleton className="skeleton-panel" /></div><div className="stat-grid">{Array.from({ length: 4 }).map((_, index) => <Skeleton className="skeleton-stat" key={index} />)}</div></div>;
}
