"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Layers3,
  Lock,
  Trophy,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { Badge, EmptyState, ProgressBar, Skeleton, cn } from "@/components/ui";
import { api, type GradedAnswer, type LearnerQuestion, type QuizResult } from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Course detail                                                       */
/* ------------------------------------------------------------------ */

export function CourseDetailView({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();

  const query = useQuery({ queryKey: ["course", slug], queryFn: () => api.courseDetail(slug) });

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => api.enroll(courseId),
    onSuccess: (course) => {
      notify(`You are enrolled in “${course.title}”. Chúc mừng!`);
      void queryClient.invalidateQueries({ queryKey: ["course", slug] });
      void queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const unenrollMutation = useMutation({
    mutationFn: (courseId: string) => api.unenroll(courseId),
    onSuccess: () => {
      notify("You left this course. You can rejoin anytime.", "info");
      void queryClient.invalidateQueries({ queryKey: ["course", slug] });
      void queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  if (query.isLoading) {
    return (
      <div className="workspace-page">
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-lede" />
        <Skeleton className="skeleton-collection" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="state-page">
        <EmptyState icon={GraduationCap} title="Course not found" description={query.error.message}>
          <Link href="/app/courses" className="button button-primary">Back to courses</Link>
        </EmptyState>
      </div>
    );
  }

  const { course, lessons, next_lesson: nextLesson } = query.data!;
  const progressPercent = Math.round(course.progress * 100);

  return (
    <div className="workspace-page page-enter">
      <div className="lesson-top" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Link href="/app/courses" className="back-link"><ArrowLeft size={15} /> Courses</Link>
        <span>{course.flag_emoji} {course.language_name}</span>
        {course.is_enrolled ? <span className="status-chip status-chip-published">Enrolled</span> : null}
      </div>

      <div className="course-hero" style={{ marginBottom: 22 }}>
        <div className="course-hero-head">
          <div>
            <p className="eyebrow eyebrow-purple">Course path · {course.cefr}</p>
            <h1 style={{ margin: "4px 0 6px" }}>{course.title}</h1>
            <p className="page-lede" style={{ margin: 0 }}>{course.description}</p>
          </div>
          {course.is_enrolled ? (
            nextLesson ? (
              <Link href={`/app/lessons/${nextLesson.id}`} className="button button-primary">
                {course.completed_lessons > 0 ? "Continue" : "Start learning"} <ArrowRight size={15} />
              </Link>
            ) : (
              <span className="status-chip status-chip-published"><CheckCircle2 size={14} /> All lessons done</span>
            )
          ) : (
            <button type="button" className="button button-primary" onClick={() => enrollMutation.mutate(course.id)} disabled={enrollMutation.isPending}>
              {enrollMutation.isPending ? "Joining…" : "Enroll now"} <GraduationCap size={15} />
            </button>
          )}
        </div>

        <div className="course-hero-meta">
          <span><UserRound size={14} /> {course.instructor_name || "LinguaAtlas team"}</span>
          <span><Layers3 size={14} /> {course.lesson_count} lessons</span>
          <span><Clock3 size={14} /> ~{Math.max(1, Math.round(course.duration_minutes / 60))} hours</span>
          <span><BookOpen size={14} /> {course.enrollment_count} learners</span>
        </div>

        {course.skills.length > 0 ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {course.skills.map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}
          </div>
        ) : null}

        {course.is_enrolled ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
              <span>Your progress</span>
              <strong style={{ color: "var(--ink)" }}>{course.completed_lessons}/{course.lesson_count} · {progressPercent}%</strong>
            </div>
            <ProgressBar value={progressPercent} tone="purple" label="course progress" />
          </div>
        ) : null}
      </div>

      <SectionLabel title="Lessons" note={`${lessons.filter((lesson) => lesson.completed).length} of ${lessons.length} completed`} />

      {lessons.length === 0 ? (
        <EmptyState icon={BookOpen} title="Lessons are coming" description="Giảng viên đang soạn nội dung cho khóa học này." />
      ) : (
        <div className="pathway-list" style={{ maxWidth: 860 }}>
          {lessons.map((lesson) => (
            <Link
              href={`/app/lessons/${lesson.id}`}
              className={cn("pathway-item", lesson.completed && "pathway-item-done")}
              key={lesson.id}
            >
              <span className="pathway-order">{lesson.lesson_order}</span>
              <span className="pathway-copy">
                <strong>{lesson.title}</strong>
                <small>{lesson.summary || `${lesson.duration_minutes} min lesson`}</small>
              </span>
              <span className="pathway-meta">
                <span><Clock3 size={13} /> {lesson.duration_minutes} min</span>
                {lesson.completed ? (
                  <span className="pathway-check"><CheckCircle2 size={16} /></span>
                ) : (
                  <Circle size={15} style={{ opacity: 0.45 }} />
                )}
              </span>
            </Link>
          ))}
        </div>
      )}

      {course.exam_id ? (
        <div className="exam-hero" style={{ marginTop: 22, maxWidth: 860 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="ws-tag-dot" style={{ background: "var(--purple)", width: 10, height: 10, boxShadow: "0 0 0 4px var(--purple-soft)" }} />
            <div>
              <p className="eyebrow eyebrow-purple" style={{ margin: 0 }}>Bài kiểm tra cuối khóa</p>
              <strong style={{ fontSize: 16 }}>{course.exam_title}</strong>
            </div>
          </div>
          <p className="ws-table-muted" style={{ margin: 0 }}>
            Đạt {course.exam_pass_score}% để hoàn thành khóa học. Làm lại được nhiều lần — hệ thống giữ điểm cao nhất.
          </p>
          <Link href={`/app/exams/${course.exam_id}`} className="button button-dark" style={{ alignSelf: "flex-start" }}>
            <ClipboardCheck size={15} /> {course.is_enrolled ? "Làm bài kiểm tra" : "Xem bài kiểm tra"}
          </Link>
        </div>
      ) : null}

      {course.is_enrolled ? (
        <p style={{ marginTop: 18 }}>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => unenrollMutation.mutate(course.id)}
            disabled={unenrollMutation.isPending}
          >
            Leave this course
          </button>
        </p>
      ) : null}
    </div>
  );
}

function SectionLabel({ title, note }: { title: string; note: string }) {
  return (
    <div className="section-heading" style={{ marginBottom: 14 }}>
      <div>
        <h2>{title}</h2>
        <p className="section-description">{note}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lesson study                                                        */
/* ------------------------------------------------------------------ */

export function LessonStudyView({ lessonId }: { lessonId: string }) {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();

  const query = useQuery({ queryKey: ["lesson", lessonId], queryFn: () => api.lesson(lessonId) });

  const completeMutation = useMutation({
    mutationFn: () => api.completeLesson(lessonId),
    onSuccess: () => {
      notify("Lesson complete — +10 XP. Tuyệt vời!");
      void queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
      void queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  if (query.isLoading) {
    return (
      <div className="workspace-page">
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-lede" />
        <Skeleton className="skeleton-collection" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="state-page">
        <EmptyState icon={Lock} title="Lesson unavailable" description={query.error.message}>
          <Link href="/app/courses" className="button button-primary">Back to courses</Link>
        </EmptyState>
      </div>
    );
  }

  const lesson = query.data!;

  return (
    <div className="workspace-page page-enter">
      <div className="lesson-top" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Link href={`/app/courses/${lesson.course_slug}`} className="back-link"><ArrowLeft size={15} /> {lesson.course_title}</Link>
        <span>Lesson {String(lesson.lesson_order).padStart(2, "0")}</span>
        {lesson.skill ? <span className="lesson-skill-badge">{lesson.skill}</span> : null}
      </div>

      <div className="ws-grid-2" style={{ gridTemplateColumns: "minmax(0, 3fr) minmax(0, 1fr)" }}>
        <main>
          <div className="lesson-heading" style={{ marginBottom: 18 }}>
            <div>
              <p className="eyebrow eyebrow-blue">Guided lesson · {lesson.duration_minutes} min</p>
              <h1>{lesson.title}</h1>
              {lesson.summary ? <p className="page-lede">{lesson.summary}</p> : null}
            </div>
            {lesson.completed ? <Badge tone="green">Completed{lesson.score !== null ? ` · ${lesson.score}%` : ""}</Badge> : <Badge tone="blue">In progress</Badge>}
          </div>

          {lesson.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="lesson-image" src={lesson.image_url} alt={`Minh họa cho ${lesson.title}`} style={{ marginBottom: 18 }} />
          ) : null}

          <article className="ws-panel" style={{ padding: "22px 24px" }}>
            <LessonMarkdown content={lesson.content} />
          </article>

          {lesson.questions.length > 0 ? (
            <QuizBlock lessonId={lesson.id} questions={lesson.questions} />
          ) : null}

          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {lesson.completed ? (
              <span className="status-chip status-chip-published" style={{ padding: "9px 14px" }}><CheckCircle2 size={15} /> Already completed</span>
            ) : (
              <button type="button" className="button button-primary" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
                {completeMutation.isPending ? "Saving…" : "Mark complete · +10 XP"} <Check size={15} />
              </button>
            )}
            <Link href={`/app/courses/${lesson.course_slug}`} className="button button-secondary">Back to course <ArrowRight size={15} /></Link>
          </div>
        </main>

        <aside className="ws-panel" style={{ padding: 18, position: "sticky", top: 92 }}>
          <p className="eyebrow">This lesson</p>
          <h3 style={{ margin: "6px 0 10px", fontSize: 15 }}>{lesson.course_title}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, color: "var(--muted)", fontSize: 12.5 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Clock3 size={14} /> {lesson.duration_minutes} minutes</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Layers3 size={14} /> Lesson {lesson.lesson_order} in path</span>
            {lesson.questions.length > 0 ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><ClipboardCheck size={14} /> {lesson.questions.length} quiz questions</span>
            ) : null}
            {lesson.video_url ? (
              <a className="button button-secondary" href={lesson.video_url} target="_blank" rel="noreferrer">Open video <ArrowRight size={14} /></a>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline mini quiz                                                    */
/* ------------------------------------------------------------------ */

export function QuizBlock({ lessonId, questions }: { lessonId: string; questions: LearnerQuestion[] }) {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const submitMutation = useMutation({
    mutationFn: () =>
      api.submitLessonQuiz(
        lessonId,
        questions.map((question) => ({ question_id: question.id, choice: choices[question.id] ?? -1 })),
      ),
    onSuccess: (data) => {
      setResult(data);
      if (data.score >= 60) {
        notify(`Quiz ${data.score}% — bài học được tính hoàn thành!`);
      } else {
        notify(`Quiz ${data.score}% — xem giải thích rồi thử lại nhé.`, "info");
      }
      void queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
      void queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const allAnswered = questions.every((question) => choices[question.id] !== undefined);
  const detailFor = (id: string): GradedAnswer | undefined => result?.details.find((detail) => detail.question_id === id);

  return (
    <section className="quiz-block" aria-label="Kiểm tra nhanh">
      <div className="quiz-block-head">
        <strong style={{ display: "flex", alignItems: "center", gap: 8 }}><ClipboardCheck size={16} /> Kiểm tra nhanh</strong>
        {result ? (
          <span className={cn("quiz-score-banner", result.score >= 60 ? "quiz-score-pass" : "quiz-score-fail")} style={{ padding: "6px 12px" }}>
            {result.score}% · {result.correct}/{result.total} đúng
          </span>
        ) : null}
      </div>

      {questions.map((question) => {
        const detail = detailFor(question.id);
        return (
          <div className="quiz-question-card" key={question.id}>
            <strong>{question.order}. {question.question}</strong>
            <div className="quiz-options">
              {question.options.map((option, index) => {
                const selected = choices[question.id] === index;
                const state = detail
                  ? detail.correct_index === index ? "quiz-option-correct" : detail.choice === index ? "quiz-option-wrong" : ""
                  : selected ? "quiz-option-selected" : "";
                return (
                  <button
                    type="button"
                    key={index}
                    className={cn("quiz-option", state)}
                    onClick={() => !result && setChoices({ ...choices, [question.id]: index })}
                    disabled={Boolean(result)}
                  >
                    <span className="quiz-option-key">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
            {detail && detail.explanation ? <p className="quiz-explanation">{detail.explanation}</p> : null}
          </div>
        );
      })}

      {result ? (
        <button
          type="button"
          className="button button-secondary"
          onClick={() => { setResult(null); setChoices({}); }}
        >
          Làm lại quiz
        </button>
      ) : (
        <button
          type="button"
          className="button button-primary"
          disabled={!allAnswered || submitMutation.isPending}
          onClick={() => submitMutation.mutate()}
        >
          {submitMutation.isPending ? "Đang chấm…" : "Nộp đáp án"}
        </button>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Minimal markdown renderer: ##, -, 1., **bold**, paragraphs          */
/* ------------------------------------------------------------------ */

export function LessonMarkdown({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return (
    <div className="lesson-content">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) {
          return <h2 key={index}>{inline(block.slice(3))}</h2>;
        }
        if (block.startsWith("- ") || block.startsWith("* ")) {
          const items = block.split("\n").map((line) => line.replace(/^[-*]\s+/, ""));
          return (
            <ul key={index}>
              {items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}
            </ul>
          );
        }
        if (/^\d+[.)]\s/.test(block)) {
          const items = block.split("\n").map((line) => line.replace(/^\d+[.)]\s+/, ""));
          return (
            <ol key={index}>
              {items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}
            </ol>
          );
        }
        return <p key={index}>{inline(block)}</p>;
      })}
    </div>
  );
}

function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}
