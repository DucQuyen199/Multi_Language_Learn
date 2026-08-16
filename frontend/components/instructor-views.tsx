"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Layers3,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { Badge, EmptyState, ProgressBar, Skeleton, StatCard, cn } from "@/components/ui";
import { api, type InstructorLesson } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const languageOptions = [
  { code: "en", label: "🇬🇧 English" },
  { code: "vi", label: "🇻🇳 Tiếng Việt" },
  { code: "zh", label: "🇨🇳 中文" },
  { code: "ja", label: "🇯🇵 日本語" },
  { code: "ko", label: "🇰🇷 한국어" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "es", label: "🇪🇸 Español" },
];

const cefrOptions = ["A1", "A2", "B1", "B2", "C1", "C2"];

function StudioHeader({ eyebrow, title, lede, action }: { eyebrow: string; title: React.ReactNode; lede: string; action?: React.ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow eyebrow-purple">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-lede">{lede}</p>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export function InstructorOverviewView() {
  const query = useQuery({ queryKey: ["instructor", "overview"], queryFn: api.instructor.overview });

  if (query.isLoading) {
    return (
      <div className="workspace-page">
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-lede" />
        <div className="ws-stat-grid">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} style={{ height: 92 }} />)}</div>
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="state-page">
        <EmptyState icon={GraduationCap} title="Studio metrics are offline" description={query.error.message}>
          <button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button>
        </EmptyState>
      </div>
    );
  }

  const overview = query.data!;
  return (
    <div className="workspace-page page-enter">
      <StudioHeader
        eyebrow="Studio overview"
        title={<>Teach with <em>momentum.</em></>}
        lede="Số liệu lớp học của bạn: khóa học, bài giảng, học viên và mức độ hoàn thành trung bình."
        action={<Link href="/instructor/courses" className="button button-primary"><Plus size={15} /> New course</Link>}
      />

      <div className="ws-stat-grid">
        <StatCard icon={BookOpen} label="Courses" value={overview.course_count} meta={`${overview.published_count} published`} tone="purple" />
        <StatCard icon={Layers3} label="Lessons authored" value={overview.lesson_count} meta="across your paths" tone="blue" />
        <StatCard icon={Users} label="Students" value={overview.student_count} meta="enrolled with you" tone="green" />
        <StatCard icon={TrendingUp} label="Avg completion" value={`${Math.round(overview.avg_progress * 100)}%`} meta={`${overview.total_completions} lessons done`} tone="orange" />
      </div>

      <div className="ws-grid-2">
        <section className="ws-panel">
          <div className="ws-panel-head">
            <div>
              <h3>Most enrolled paths</h3>
              <p>Khóa học thu hút nhiều học viên nhất</p>
            </div>
            <Link href="/instructor/courses" className="button button-secondary">Manage</Link>
          </div>
          <div className="ws-feed">
            {overview.top_courses.length === 0 ? (
              <div className="ws-panel-body">
                <EmptyState icon={Sparkles} title="No courses yet" description="Tạo khóa học đầu tiên và mời học viên đăng ký." />
              </div>
            ) : overview.top_courses.map((course) => (
              <div className="ws-feed-item" key={course.id}>
                <span className="lang-flag-lg" style={{ width: 34, height: 34, fontSize: 17 }}>{course.flag_emoji}</span>
                <div className="ws-feed-copy">
                  <strong>{course.title}</strong>
                  <small>{course.lesson_count} lessons · {course.enrollment_count} students</small>
                </div>
                <div style={{ minWidth: 120 }}>
                  <ProgressBar value={Math.round(course.avg_progress * 100)} tone="purple" label="completion" />
                  <small className="ws-table-muted">{Math.round(course.avg_progress * 100)}% avg done</small>
                </div>
                <Link className="button button-secondary" style={{ padding: "6px 12px" }} href={`/instructor/courses/${course.id}`}>Open</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="ws-panel">
          <div className="ws-panel-head">
            <div>
              <h3>Newest students</h3>
              <p>Học viên mới nhất của bạn</p>
            </div>
            <Link href="/instructor/students" className="button button-secondary">All students</Link>
          </div>
          <div className="ws-feed">
            {overview.recent_students.length === 0 ? (
              <div className="ws-panel-body">
                <EmptyState icon={Users} title="No students yet" description="Xuất bản khóa học để học viên bắt đầu ghi danh." />
              </div>
            ) : overview.recent_students.map((student, index) => (
              <div className="ws-feed-item" key={`${student.id}-${index}`}>
                <span className="avatar avatar-small">{student.name.slice(0, 1).toUpperCase()}</span>
                <div className="ws-feed-copy">
                  <strong>{student.name}</strong>
                  <small>{student.course_title}</small>
                </div>
                <span className="ws-feed-time">{student.lessons_completed}/{student.lessons_total} done</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */

export function InstructorCoursesView() {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ language_code: "en", title: "", description: "", cefr: "B1" });

  const query = useQuery({ queryKey: ["instructor", "courses"], queryFn: api.instructor.courses });

  const createMutation = useMutation({
    mutationFn: () => api.instructor.createCourse(form),
    onSuccess: (course) => {
      notify(`“${course.title}” đã tạo ở dạng nháp.`);
      setCreating(false);
      setForm({ language_code: "en", title: "", description: "", cefr: "B1" });
      void queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["instructor", "overview"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ courseId, status }: { courseId: string; status: string }) => api.instructor.updateCourse(courseId, { status }),
    onSuccess: (course) => {
      notify(
        course.status === "pending" ? "Đã gửi duyệt — quản trị viên sẽ xem xét."
        : course.status === "published" ? "Khóa học đã xuất bản."
        : "Khóa học đã lưu trữ.",
      );
      void queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["instructor", "overview"] });
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const courses = query.data ?? [];

  return (
    <div className="workspace-page page-enter">
      <StudioHeader
        eyebrow="My courses"
        title={<>Author paths <em>learners love.</em></>}
        lede="Tạo khóa học mới, soạn bài giảng và xuất bản khi sẵn sàng."
        action={
          <button type="button" className="button button-primary" onClick={() => setCreating((value) => !value)}>
            <Plus size={15} /> {creating ? "Close" : "New course"}
          </button>
        }
      />

      {creating ? (
        <section className="ws-panel" style={{ marginBottom: 18 }}>
          <div className="ws-panel-head">
            <div><h3>Create a course</h3><p>Khóa học mới bắt đầu ở trạng thái nháp cho đến khi bạn xuất bản.</p></div>
          </div>
          <div className="ws-panel-body">
            <form
              className="ws-form-grid"
              onSubmit={(event) => {
                event.preventDefault();
                createMutation.mutate();
              }}
            >
              <div className="ws-field">
                <label htmlFor="course-language">Language</label>
                <select id="course-language" className="ws-select" value={form.language_code} onChange={(event) => setForm({ ...form, language_code: event.target.value })}>
                  {languageOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
                </select>
              </div>
              <div className="ws-field">
                <label htmlFor="course-cefr">Level</label>
                <select id="course-cefr" className="ws-select" value={form.cefr} onChange={(event) => setForm({ ...form, cefr: event.target.value })}>
                  {cefrOptions.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
              <div className="ws-field ws-field-full">
                <label htmlFor="course-title">Title</label>
                <input id="course-title" className="ws-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="English B2 · Speak with precision" required minLength={3} maxLength={160} />
              </div>
              <div className="ws-field ws-field-full">
                <label htmlFor="course-description">Description</label>
                <textarea id="course-description" className="ws-textarea" style={{ minHeight: 84 }} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Học viên sẽ đạt được gì sau khóa học này?" required maxLength={1000} />
              </div>
              <div className="ws-form-footer ws-field-full">
                <button type="button" className="button button-ghost" onClick={() => setCreating(false)}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating…" : "Create course"} <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : null}

      {query.isLoading ? (
        <div className="topic-grid">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="skeleton-topic" />)}</div>
      ) : query.isError ? (
        <div className="state-page">
          <EmptyState icon={BookOpen} title="Could not load your courses" description={query.error.message}>
            <button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button>
          </EmptyState>
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={Sparkles} title="Your studio is empty" description="Tạo khóa học đầu tiên — chỉ cần tên, mô tả và trình độ." action={<button type="button" className="button button-primary" onClick={() => setCreating(true)}><Plus size={15} /> New course</button>} />
      ) : (
        <div className="topic-grid">
          {courses.map((course) => (
            <article className={cn("topic-card", course.status === "draft" && "opacity-80")} key={course.id}>
              <div className="topic-card-head">
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Badge tone="purple">{course.cefr}</Badge>
                  <span className={cn("status-chip", `status-chip-${course.status}`)}>{course.status}</span>
                </div>
                <span className="topic-open" style={{ fontSize: 16 }}>{course.flag_emoji}</span>
              </div>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              {course.review_note && course.status === "draft" ? (
                <p className="review-note-banner" style={{ padding: "8px 10px", fontSize: 11.5 }}><ClipboardCheck size={13} /><span><strong style={{ fontSize: 11 }}>Admin:</strong>{course.review_note}</span></p>
              ) : null}
              <div className="topic-card-footer" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ display: "flex", gap: 12 }}>
                  <span><BookOpen size={13} /> {course.lesson_count} bài</span>
                  <span><Users size={13} /> {course.enrollment_count} HV</span>
                  <span><ClipboardCheck size={13} /> {course.exam_count} test</span>
                </span>
                <ProgressBar value={Math.round(course.avg_progress * 100)} tone="purple" label="avg completion" />
                <span style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <Link href={`/instructor/courses/${course.id}`} className="button button-dark" style={{ flex: 1, justifyContent: "center" }}>
                    <Pencil size={14} /> Studio
                  </Link>
                  {course.status === "draft" ? (
                    <button type="button" className="button button-primary" onClick={() => statusMutation.mutate({ courseId: course.id, status: "pending" })}>Gửi duyệt</button>
                  ) : course.status === "pending" ? (
                    <button type="button" className="button button-ghost" onClick={() => statusMutation.mutate({ courseId: course.id, status: "draft" })}>Rút</button>
                  ) : isAdmin && course.status === "published" ? (
                    <button type="button" className="button button-ghost" onClick={() => statusMutation.mutate({ courseId: course.id, status: "archived" })}>Lưu trữ</button>
                  ) : isAdmin && course.status === "archived" ? (
                    <button type="button" className="button button-ghost" onClick={() => statusMutation.mutate({ courseId: course.id, status: "published" })}>Mở lại</button>
                  ) : null}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lessons management                                                  */
/* ------------------------------------------------------------------ */

type LessonForm = {
  title: string;
  summary: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  lesson_order: number;
  status: string;
};

const emptyLessonForm: LessonForm = { title: "", summary: "", content: "", video_url: "", duration_minutes: 10, lesson_order: 0, status: "draft" };

export function InstructorLessonsView({ courseId }: { courseId: string }) {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const [editing, setEditing] = useState<InstructorLesson | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<LessonForm>(emptyLessonForm);

  const coursesQuery = useQuery({ queryKey: ["instructor", "courses"], queryFn: api.instructor.courses });
  const course = coursesQuery.data?.find((item) => item.id === courseId) ?? null;
  const lessonsQuery = useQuery({ queryKey: ["instructor", "lessons", courseId], queryFn: () => api.instructor.lessons(courseId), enabled: Boolean(courseId) });

  const resetEditor = () => {
    setCreating(false);
    setEditing(null);
    setForm(emptyLessonForm);
  };

  const createMutation = useMutation({
    mutationFn: () => api.instructor.createLesson(courseId, form),
    onSuccess: (lesson) => {
      notify(`Lesson “${lesson.title}” added.`);
      resetEditor();
      void queryClient.invalidateQueries({ queryKey: ["instructor", "lessons", courseId] });
      void queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["instructor", "overview"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ lessonId }: { lessonId: string }) => api.instructor.updateLesson(lessonId, form),
    onSuccess: (lesson) => {
      notify(`Lesson “${lesson.title}” updated.`);
      resetEditor();
      void queryClient.invalidateQueries({ queryKey: ["instructor", "lessons", courseId] });
      void queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) => api.instructor.deleteLesson(lessonId),
    onSuccess: () => {
      notify("Lesson removed.");
      void queryClient.invalidateQueries({ queryKey: ["instructor", "lessons", courseId] });
      void queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const openEditor = () => {
    setEditing(null);
    setCreating(true);
    setForm(emptyLessonForm);
  };

  const openEdit = (lesson: InstructorLesson) => {
    setCreating(false);
    setEditing(lesson);
    setForm({
      title: lesson.title,
      summary: lesson.summary,
      content: lesson.content,
      video_url: lesson.video_url,
      duration_minutes: lesson.duration_minutes,
      lesson_order: lesson.lesson_order,
      status: lesson.status,
    });
  };

  const lessons = lessonsQuery.data ?? [];
  const editorOpen = creating || editing !== null;

  return (
    <div className="workspace-page page-enter">
      <div className="lesson-top" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Link href="/instructor/courses" className="back-link"><ArrowLeft size={15} /> My courses</Link>
        {course ? <span>{course.flag_emoji} {course.language_name}</span> : null}
        {course ? <span className={cn("status-chip", `status-chip-${course.status}`)}>{course.status}</span> : null}
      </div>

      <StudioHeader
        eyebrow="Lesson studio"
        title={course ? course.title : "Lessons"}
        lede="Soạn bài giảng với nội dung Markdown-lite: ## tiêu đề, gạch đầu dòng và đoạn văn."
        action={<button type="button" className="button button-primary" onClick={editorOpen ? resetEditor : openEditor}><Plus size={15} /> {editorOpen ? "Close editor" : "New lesson"}</button>}
      />

      {editorOpen ? (
        <section className="ws-panel" style={{ marginBottom: 18 }}>
          <div className="ws-panel-head">
            <div><h3>{editing ? `Edit: ${editing.title}` : "New lesson"}</h3><p>Bài học ở trạng thái nháp chỉ hiển thị với bạn.</p></div>
          </div>
          <div className="ws-panel-body">
            <form
              className="ws-form-grid"
              onSubmit={(event) => {
                event.preventDefault();
                if (editing) updateMutation.mutate({ lessonId: editing.id });
                else createMutation.mutate();
              }}
            >
              <div className="ws-field">
                <label htmlFor="lesson-title">Title</label>
                <input id="lesson-title" className="ws-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required minLength={3} maxLength={160} placeholder="Present perfect in real life" />
              </div>
              <div className="ws-field">
                <label htmlFor="lesson-summary">Summary</label>
                <input id="lesson-summary" className="ws-input" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} maxLength={500} placeholder="One sentence learners see in the list" />
              </div>
              <div className="ws-field ws-field-full">
                <label htmlFor="lesson-content">Content (supports ## headings, - bullets, 1. steps, **bold**)</label>
                <textarea id="lesson-content" className="ws-textarea" style={{ minHeight: 220 }} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required minLength={10} placeholder={"## Notice\n...\n\n## Practice\n- ...\n\n## Quick check\n..."} />
              </div>
              <div className="ws-field">
                <label htmlFor="lesson-duration">Duration (minutes)</label>
                <input id="lesson-duration" className="ws-input" type="number" min={1} max={180} value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: Number(event.target.value) || 10 })} />
              </div>
              <div className="ws-field">
                <label htmlFor="lesson-order">Order (0 = auto)</label>
                <input id="lesson-order" className="ws-input" type="number" min={0} max={999} value={form.lesson_order} onChange={(event) => setForm({ ...form, lesson_order: Number(event.target.value) || 0 })} />
              </div>
              <div className="ws-field">
                <label htmlFor="lesson-video">Video URL (optional)</label>
                <input id="lesson-video" className="ws-input" value={form.video_url} onChange={(event) => setForm({ ...form, video_url: event.target.value })} placeholder="https://…" />
              </div>
              <div className="ws-field">
                <label htmlFor="lesson-status">Status</label>
                <select id="lesson-status" className="ws-select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="ws-form-footer ws-field-full">
                <button type="button" className="button button-ghost" onClick={resetEditor}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Saving…" : editing ? "Save lesson" : "Add lesson"} <CheckCircle2 size={15} />
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : null}

      {lessonsQuery.isLoading ? (
        <div className="pathway-list">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} style={{ height: 58 }} />)}</div>
      ) : lessonsQuery.isError ? (
        <div className="state-page">
          <EmptyState icon={BookOpen} title="Could not load lessons" description={lessonsQuery.error.message}>
            <button type="button" className="button button-primary" onClick={() => lessonsQuery.refetch()}>Try again</button>
          </EmptyState>
        </div>
      ) : lessons.length === 0 ? (
        <EmptyState icon={Sparkles} title="No lessons yet" description="Thêm bài giảng đầu tiên cho khóa học này." action={<button type="button" className="button button-primary" onClick={openEditor}><Plus size={15} /> New lesson</button>} />
      ) : (
        <div className="pathway-list">
          {lessons.map((lesson) => (
            <div className={cn("pathway-item")} key={lesson.id} style={{ cursor: "default" }}>
              <span className="pathway-order">{lesson.lesson_order}</span>
              <span className="pathway-copy">
                <strong>{lesson.title}</strong>
                <small>{lesson.summary || lesson.slug}</small>
              </span>
              <span className="pathway-meta">
                <span><Clock3 size={13} /> {lesson.duration_minutes} min</span>
                <span><CheckCircle2 size={13} /> {lesson.completion_count} done</span>
                <span className={cn("status-chip", `status-chip-${lesson.status}`)}>{lesson.status}</span>
              </span>
              <span style={{ display: "flex", gap: 6 }}>
                <button type="button" className="button button-secondary" style={{ padding: "6px 10px" }} onClick={() => openEdit(lesson)} aria-label={`Edit ${lesson.title}`}><Pencil size={14} /></button>
                <button
                  type="button"
                  className="button button-ghost"
                  style={{ padding: "6px 10px", color: "var(--danger)" }}
                  onClick={() => {
                    if (window.confirm(`Delete “${lesson.title}”? Learner completions for this lesson are removed too.`)) deleteMutation.mutate(lesson.id);
                  }}
                  aria-label={`Delete ${lesson.title}`}
                >
                  <Trash2 size={14} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Students                                                            */
/* ------------------------------------------------------------------ */

export function InstructorStudentsView() {
  const query = useQuery({ queryKey: ["instructor", "students"], queryFn: api.instructor.students });

  const students = query.data ?? [];

  return (
    <div className="workspace-page page-enter">
      <StudioHeader eyebrow="Students" title={<>Follow every <em>learner.</em></>} lede="Tiến độ của từng học viên trong các khóa học bạn phụ trách." />

      <section className="ws-panel">
        <div className="ws-panel-head">
          <div>
            <h3>{students.length} enrollments</h3>
            <p>Progress compares completed lessons against published lessons per course.</p>
          </div>
        </div>
        {query.isLoading ? (
          <div className="ws-panel-body">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} style={{ height: 44, marginBottom: 10 }} />)}</div>
        ) : query.isError ? (
          <div className="ws-panel-body">
            <EmptyState icon={Users} title="Could not load students" description={query.error.message}>
              <button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button>
            </EmptyState>
          </div>
        ) : students.length === 0 ? (
          <div className="ws-panel-body">
            <EmptyState icon={Users} title="No students yet" description="Xuất bản khóa học để học viên bắt đầu ghi danh." />
          </div>
        ) : (
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th style={{ minWidth: 180 }}>Progress</th>
                  <th>Last activity</th>
                  <th>Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={`${student.id}-${student.course_id}-${index}`}>
                    <td>
                      <div className="ws-user-cell">
                        <span className="avatar avatar-small">{student.name.slice(0, 1).toUpperCase()}</span>
                        <span>
                          <span className="ws-table-strong">{student.name}</span>
                          <small>{student.email}</small>
                        </span>
                      </div>
                    </td>
                    <td className="ws-table-muted">{student.course_title}</td>
                    <td>
                      <ProgressBar value={Math.round(student.progress * 100)} tone="green" label="progress" />
                      <small className="ws-table-muted">{student.lessons_completed}/{student.lessons_total} lessons</small>
                    </td>
                    <td className="ws-table-muted">
                      {student.last_activity ? new Date(student.last_activity).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "Not started"}
                    </td>
                    <td className="ws-table-muted">{new Date(student.enrolled_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
