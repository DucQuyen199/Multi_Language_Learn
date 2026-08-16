"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BookA, BookOpen, CheckCircle2, Circle, Clock3, GraduationCap, Layers3, Search, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { Badge, EmptyState, ProgressBar, SectionHeading, Skeleton, cn } from "@/components/ui";
import { api, type CourseCard } from "@/lib/api";

export function GrammarView() {
  const [level, setLevel] = useState("");
  const query = useQuery({ queryKey: ["grammar", level], queryFn: () => api.grammar(level) });
  if (query.isLoading) return <CatalogSkeleton />;
  if (query.isError) return <div className="state-page"><EmptyState icon={BookA} title="Grammar is offline" description={query.error.message}><button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button></EmptyState></div>;
  const topics = query.data ?? [];
  return <div className="workspace-page page-enter"><div className="page-header"><div><p className="eyebrow eyebrow-blue">Grammar studio</p><h1>Make structure <em>feel natural.</em></h1><p className="page-lede">Understand the pattern, notice it in context, and use it with confidence.</p></div><Link href="/app/ai-tutor" className="button button-secondary"><Sparkles size={16} /> Ask the tutor</Link></div><div className="catalog-hero catalog-hero-grammar"><div><span className="catalog-hero-icon"><BookA size={23} /></span><p className="eyebrow eyebrow-light">Your next grammar step</p><h2>Present perfect</h2><p>Connect past actions to the present with a structure you can actually use.</p><div className="module-meta"><Badge tone="blue">B1</Badge><span>12 min</span><span>·</span><span>Explanation + practice</span></div></div><div className="grammar-equation"><span>have / has</span><strong>+</strong><span>past participle</span><small>She has studied.</small></div></div><div className="catalog-toolbar"><div className="segmented-tabs">{["", "A1", "A2", "B1", "B2", "C1"].map((item) => <button type="button" className={level === item ? "active" : ""} onClick={() => setLevel(item)} key={item}>{item || "All levels"}</button>)}</div><span className="catalog-count">{topics.length} lessons in your path</span></div><div className="topic-grid">{topics.map((topic) => <Link href={`/app/grammar/${topic.slug}`} className="topic-card" key={topic.id}><div className="topic-card-head"><Badge tone={topic.cefr === "B1" ? "blue" : topic.cefr === "B2" ? "purple" : "green"}>{topic.cefr}</Badge><span className="topic-open"><ArrowRight size={15} /></span></div><h3>{topic.title}</h3><p>{topic.summary}</p><div className="topic-card-footer"><span><CheckCircle2 size={13} /> Ready to learn</span><span>12 min</span></div></Link>)}</div></div>;
}

export function CoursesView() {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const coursesQuery = useQuery({ queryKey: ["courses"], queryFn: () => api.courses() });
  const mineQuery = useQuery({ queryKey: ["enrollments"], queryFn: api.myCourses });

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => api.enroll(courseId),
    onSuccess: (course) => {
      notify(`You are enrolled in “${course.title}”. Chúc mừng!`);
      void queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
    onSettled: () => setEnrolling(null),
  });

  if (coursesQuery.isLoading) return <CatalogSkeleton />;
  if (coursesQuery.isError) {
    return (
      <div className="state-page">
        <EmptyState icon={GraduationCap} title="Courses are offline" description={coursesQuery.error.message}>
          <button type="button" className="button button-primary" onClick={() => coursesQuery.refetch()}>Try again</button>
        </EmptyState>
      </div>
    );
  }

  const courses = coursesQuery.data ?? [];
  const mine = mineQuery.data ?? [];
  const catalog = courses.filter((course) => !course.is_enrolled);

  return (
    <div className="workspace-page page-enter">
      <div className="page-header">
        <div>
          <p className="eyebrow eyebrow-purple">Course library</p>
          <h1>Choose a path with <em>purpose.</em></h1>
          <p className="page-lede">Mỗi khóa học là một hành trình gắn kết từ vựng, ngữ pháp và cả bốn kỹ năng.</p>
        </div>
      </div>

      {mine.length > 0 ? (
        <>
          <SectionHeading eyebrow="Continue learning" title="My paths" description="Các khóa học bạn đã đăng ký — tiếp tục ngay nơi bạn dừng lại." />
          <div className="course-grid" style={{ marginBottom: 34 }}>
            {mine.map((course, index) => (
              <CourseCardTile course={course} index={index} enrolled={true} onEnroll={undefined} enrolling={false} />
            ))}
          </div>
        </>
      ) : null}

      <SectionHeading eyebrow="Catalog" title="Open paths" description={`${catalog.length} khóa học đang mở rộng cho bạn.`} />
      {catalog.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="You joined everything" description="Bạn đã đăng ký mọi khóa học đang mở. Hãy học hết và quay lại!" />
      ) : (
        <div className="course-grid">
          {catalog.map((course, index) => (
            <CourseCardTile
              course={course}
              index={index}
              enrolled={false}
              onEnroll={(courseId) => {
                setEnrolling(courseId);
                enrollMutation.mutate(courseId);
              }}
              enrolling={enrolling === course.id ? true : false}
            />
          ))}
        </div>
      )}

      <SectionHeading eyebrow="How it works" title="One path, four skills" description="Every unit moves from noticing to practice to review." />
      <div className="course-flow">
        <span><BookOpen size={17} /> Learn</span>
        <ArrowRight size={15} />
        <span><CheckCircle2 size={17} /> Practice</span>
        <ArrowRight size={15} />
        <span><Sparkles size={17} /> Reflect</span>
        <ArrowRight size={15} />
        <span><GraduationCap size={17} /> Progress</span>
      </div>
    </div>
  );
}

function CourseCardTile({
  course,
  index,
  enrolled,
  onEnroll,
  enrolling,
}: {
  course: CourseCard;
  index: number;
  enrolled: boolean;
  onEnroll?: (courseId: string) => void;
  enrolling?: boolean;
}) {
  const progressPercent = Math.round(course.progress * 100);
  return (
    <article className={cn("course-card", index % 2 ? "course-card-lilac" : "course-card-blue")} key={course.id}>
      <div className="course-card-top">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Badge tone={index % 2 ? "purple" : "blue"}>{course.cefr}</Badge>
          <span style={{ fontSize: 15 }}>{course.flag_emoji}</span>
        </div>
        <span className="course-progress-label">
          {enrolled ? (progressPercent > 0 ? `${progressPercent}% complete` : "Just started") : `${course.enrollment_count} learners`}
        </span>
      </div>
      <div className="course-illustration"><div className="course-orb" /><Layers3 size={36} strokeWidth={1.3} /></div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      {course.instructor_name ? (
        <p style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 12, margin: "-6px 0 8px" }}>
          <UserRound size={13} /> {course.instructor_name}
        </p>
      ) : null}
      <div className="course-meta">
        <span><BookOpen size={14} /> {course.lesson_count} lessons</span>
        <span><Clock3 size={14} /> {Math.max(1, Math.round(course.duration_minutes / 60))} hours</span>
      </div>
      {enrolled ? (
        <div style={{ marginBottom: 12 }}>
          <ProgressBar value={progressPercent} tone={index % 2 ? "purple" : "primary"} label="course progress" />
          <small className="course-progress-label" style={{ marginTop: 4, display: "block" }}>
            {course.completed_lessons}/{course.lesson_count} lessons done
          </small>
        </div>
      ) : null}
      <div className="course-card-footer">
        <div className="course-avatar-stack">
          <span>{(course.instructor_name || "L").slice(0, 1).toUpperCase()}</span>
          <span>+</span>
        </div>
        {enrolled ? (
          <Link href={`/app/courses/${course.slug}`} className="button button-dark">Continue <ArrowRight size={15} /></Link>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className="button button-primary" disabled={enrolling} onClick={() => onEnroll?.(course.id)}>
              {enrolling ? "Joining…" : "Enroll"} <CheckCircle2 size={15} />
            </button>
            <Link href={`/app/courses/${course.slug}`} className="button button-secondary">Preview</Link>
          </div>
        )}
      </div>
    </article>
  );
}

function CatalogSkeleton() {
  return <div className="workspace-page"><Skeleton className="skeleton-title" /><Skeleton className="skeleton-lede" /><Skeleton className="skeleton-collection" /><div className="topic-grid">{Array.from({ length: 6 }).map((_, index) => <Skeleton className="skeleton-topic" key={index} />)}</div></div>;
}

export function EnrolledMiniList() {
  const query = useQuery({ queryKey: ["enrollments"], queryFn: api.myCourses });
  if (query.isLoading || query.isError) return null;
  const mine = query.data ?? [];
  if (mine.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {mine.slice(0, 4).map((course) => (
        <Link href={`/app/courses/${course.slug}`} className="path-card" key={course.id} style={{ padding: "10px 12px" }}>
          <Circle size={14} style={{ color: course.progress > 0 ? "var(--success)" : "var(--muted)" }} />
          <span style={{ fontWeight: 650 }}>{course.title}</span>
          <small style={{ marginLeft: "auto", color: "var(--muted)" }}>{Math.round(course.progress * 100)}%</small>
        </Link>
      ))}
    </div>
  );
}
