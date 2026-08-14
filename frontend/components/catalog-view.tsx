"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookA, BookOpen, CheckCircle2, Clock3, GraduationCap, Layers3, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { Badge, EmptyState, SectionHeading, Skeleton, cn } from "@/components/ui";
import { api } from "@/lib/api";

export function GrammarView() {
  const [level, setLevel] = useState("");
  const query = useQuery({ queryKey: ["grammar", level], queryFn: () => api.grammar(level) });
  if (query.isLoading) return <CatalogSkeleton />;
  if (query.isError) return <div className="state-page"><EmptyState icon={BookA} title="Grammar is offline" description={query.error.message}><button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button></EmptyState></div>;
  const topics = query.data ?? [];
  return <div className="workspace-page page-enter"><div className="page-header"><div><p className="eyebrow eyebrow-blue">Grammar studio</p><h1>Make structure <em>feel natural.</em></h1><p className="page-lede">Understand the pattern, notice it in context, and use it with confidence.</p></div><Link href="/app/ai-tutor" className="button button-secondary"><Sparkles size={16} /> Ask the tutor</Link></div><div className="catalog-hero catalog-hero-grammar"><div><span className="catalog-hero-icon"><BookA size={23} /></span><p className="eyebrow eyebrow-light">Your next grammar step</p><h2>Present perfect</h2><p>Connect past actions to the present with a structure you can actually use.</p><div className="module-meta"><Badge tone="blue">B1</Badge><span>12 min</span><span>·</span><span>Explanation + practice</span></div></div><div className="grammar-equation"><span>have / has</span><strong>+</strong><span>past participle</span><small>She has studied.</small></div></div><div className="catalog-toolbar"><div className="segmented-tabs">{["", "A1", "A2", "B1", "B2", "C1"].map((item) => <button type="button" className={level === item ? "active" : ""} onClick={() => setLevel(item)} key={item}>{item || "All levels"}</button>)}</div><span className="catalog-count">{topics.length} lessons in your path</span></div><div className="topic-grid">{topics.map((topic) => <Link href={`/app/grammar/${topic.slug}`} className="topic-card" key={topic.id}><div className="topic-card-head"><Badge tone={topic.cefr === "B1" ? "blue" : topic.cefr === "B2" ? "purple" : "green"}>{topic.cefr}</Badge><span className="topic-open"><ArrowRight size={15} /></span></div><h3>{topic.title}</h3><p>{topic.summary}</p><div className="topic-card-footer"><span><CheckCircle2 size={13} /> Ready to learn</span><span>12 min</span></div></Link>)}</div></div>;
}

export function CoursesView() {
  const query = useQuery({ queryKey: ["courses"], queryFn: api.courses });
  const [filter, setFilter] = useState("All paths");
  const { notify } = useActionFeedback();
  if (query.isLoading) return <CatalogSkeleton />;
  if (query.isError) return <div className="state-page"><EmptyState icon={GraduationCap} title="Courses are offline" description={query.error.message}><button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button></EmptyState></div>;
  const courses = query.data ?? [];
  const visibleCourses = courses.filter((course) => filter === "All paths" || (filter === "English" && course.title.startsWith("English")) || (filter === "Academic" && course.title.startsWith("Academic")));
  const chooseFilter = (value: string) => {
    setFilter(value);
    if (value === "Business") notify("No business path is seeded yet. Showing the available paths.", "info");
  };
  return <div className="workspace-page page-enter"><div className="page-header"><div><p className="eyebrow eyebrow-purple">Course library</p><h1>Choose a path with <em>purpose.</em></h1><p className="page-lede">Each course threads vocabulary, grammar, and all four skills into one coherent journey.</p></div><button type="button" className="button button-secondary" onClick={() => { setFilter("All paths"); document.querySelector(".course-grid")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><Search size={16} /> Browse all</button></div><div className="course-filter-row">{["All paths", "English", "Academic", "Business"].map((item) => <button type="button" className={cn("course-pill", filter === item && "course-pill-active")} onClick={() => chooseFilter(item)} key={item}>{item}</button>)}<span className="course-filter-note">{visibleCourses.length} paths ready for you</span></div>{visibleCourses.length ? <div className="course-grid">{visibleCourses.map((course, index) => <article className={cn("course-card", index % 2 ? "course-card-lilac" : "course-card-blue")} key={course.id}><div className="course-card-top"><Badge tone={index % 2 ? "purple" : "blue"}>{course.cefr}</Badge><span className="course-progress-label">{index === 0 && filter === "All paths" ? "32% complete" : "New path"}</span></div><div className="course-illustration"><div className="course-orb" /><Layers3 size={36} strokeWidth={1.3} /></div><h2>{course.title}</h2><p>{course.description}</p><div className="course-meta"><span><BookOpen size={14} /> {course.lesson_count} lessons</span><span><Clock3 size={14} /> {Math.round(course.duration_minutes / 60)} hours</span></div><div className="course-card-footer"><div className="course-avatar-stack"><span>Q</span><span>+</span></div><Link href={`/app/courses/${course.slug}`} className="button button-dark">View path <ArrowRight size={15} /></Link></div></article>)}</div> : <EmptyState icon={Search} title="No path in this filter" description="Choose another path to continue learning." action={<button type="button" className="button button-secondary" onClick={() => setFilter("All paths")}>Show all paths</button>} />}<SectionHeading eyebrow="How it works" title="One path, four skills" description="Every unit moves from noticing to practice to review." /><div className="course-flow"><span><BookOpen size={17} /> Learn</span><ArrowRight size={15} /><span><CheckCircle2 size={17} /> Practice</span><ArrowRight size={15} /><span><Sparkles size={17} /> Reflect</span><ArrowRight size={15} /><span><GraduationCap size={17} /> Progress</span></div></div>;
}

function CatalogSkeleton() {
  return <div className="workspace-page"><Skeleton className="skeleton-title" /><Skeleton className="skeleton-lede" /><Skeleton className="skeleton-collection" /><div className="topic-grid">{Array.from({ length: 6 }).map((_, index) => <Skeleton className="skeleton-topic" key={index} />)}</div></div>;
}
