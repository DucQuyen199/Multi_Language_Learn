"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ListChecks,
  Pencil,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { Badge, EmptyState, ProgressBar, Skeleton, cn } from "@/components/ui";
import { api, type AuthorQuestion, type InstructorExam, type InstructorLesson, type QuestionInput } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const SKILL_OPTIONS = [
  { value: "listening", label: "Listening" },
  { value: "speaking", label: "Speaking" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "grammar", label: "Grammar" },
];

/* ------------------------------------------------------------------ */
/* Course studio (single page: status, skills, lessons, exams)         */
/* ------------------------------------------------------------------ */

export function CourseStudioView({ courseId }: { courseId: string }) {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [editingLesson, setEditingLesson] = useState<InstructorLesson | null>(null);
  const [creatingLesson, setCreatingLesson] = useState(false);

  const coursesQuery = useQuery({ queryKey: ["instructor", "courses"], queryFn: api.instructor.courses });
  const course = coursesQuery.data?.find((item) => item.id === courseId) ?? null;
  const lessonsQuery = useQuery({
    queryKey: ["instructor", "lessons", courseId],
    queryFn: () => api.instructor.lessons(courseId),
    enabled: Boolean(courseId),
  });

  const refreshAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
    void queryClient.invalidateQueries({ queryKey: ["instructor", "lessons", courseId] });
    void queryClient.invalidateQueries({ queryKey: ["instructor", "overview"] });
    void queryClient.invalidateQueries({ queryKey: ["courses"] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.instructor.updateCourse(courseId, { status }),
    onSuccess: (updated) => {
      notify(
        updated.status === "pending" ? "Đã gửi yêu cầu duyệt — quản trị viên sẽ xem xét."
        : updated.status === "published" ? "Khóa học đã được xuất bản."
        : "Đã chuyển về bản nháp.",
      );
      refreshAll();
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  if (coursesQuery.isLoading) {
    return <div className="workspace-page"><Skeleton className="skeleton-title" /><Skeleton className="skeleton-lede" /></div>;
  }
  if (!course) {
    return (
      <div className="state-page">
        <EmptyState icon={BookOpen} title="Course not found" description="Khóa học không tồn tại hoặc bạn không có quyền.">
          <Link href="/instructor/courses" className="button button-primary">Back to courses</Link>
        </EmptyState>
      </div>
    );
  }

  const lessons = lessonsQuery.data ?? [];
  const questionsTotal = lessons.reduce((sum, lesson) => sum + lesson.question_count, 0);

  return (
    <div className="workspace-page page-enter">
      <div className="lesson-top" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Link href="/instructor/courses" className="back-link"><ArrowLeft size={15} /> My courses</Link>
        <span>{course.flag_emoji} {course.language_name}</span>
        <span className={cn("status-chip", `status-chip-${course.status}`)}>{course.status}</span>
      </div>

      <div className="page-header">
        <div>
          <p className="eyebrow eyebrow-purple">Course studio</p>
          <h1>{course.title}</h1>
          <p className="page-lede">
            {course.lesson_count} bài giảng · {questionsTotal} câu hỏi nhỏ · {course.exam_count} bài kiểm tra · {course.enrollment_count} học viên
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 190 }}>
          {course.status === "draft" ? (
            <button type="button" className="button button-primary" onClick={() => statusMutation.mutate("pending")} disabled={statusMutation.isPending}>
              <Send size={15} /> Gửi duyệt
            </button>
          ) : course.status === "pending" ? (
            <button type="button" className="button button-ghost" onClick={() => statusMutation.mutate("draft")} disabled={statusMutation.isPending}>
              <Undo2 size={15} /> Rút về nháp
            </button>
          ) : null}
          {isAdmin && course.status !== "published" ? (
            <button type="button" className="button button-dark" onClick={() => statusMutation.mutate("published")} disabled={statusMutation.isPending}>
              <ShieldCheck size={15} /> Xuất bản (admin)
            </button>
          ) : null}
        </div>
      </div>

      {course.review_note ? (
        <div className="review-note-banner" style={{ marginBottom: 16 }}>
          <ClipboardCheck size={16} />
          <span><strong>Ghi chú từ quản trị viên</strong>{course.review_note}</span>
        </div>
      ) : null}

      <SkillsEditor courseId={courseId} initialSkills={course.skills} />

      <LessonSection
        courseId={courseId}
        lessons={lessons}
        isLoading={lessonsQuery.isLoading}
        editing={editingLesson}
        creating={creatingLesson}
        onEdit={(lesson) => { setEditingLesson(lesson); setCreatingLesson(false); }}
        onCreate={() => { setCreatingLesson(true); setEditingLesson(null); }}
        onClose={() => { setEditingLesson(null); setCreatingLesson(false); }}
      />

      <ExamsEditor courseId={courseId} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skills editor                                                       */
/* ------------------------------------------------------------------ */

function SkillsEditor({ courseId, initialSkills }: { courseId: string; initialSkills: string[] }) {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const initialized = useState(() => {
    const map: Record<string, string> = {};
    initialSkills.forEach((skill) => { map[skill] = ""; });
    return map;
  })[0];

  const state = { ...initialized, ...selected };
  const toggle = (skill: string) => {
    const next = { ...state };
    if (next[skill] !== undefined) delete next[skill];
    else next[skill] = "";
    setSelected(next);
  };
  const setNote = (skill: string, note: string) => setSelected({ ...state, [skill]: note });

  const saveMutation = useMutation({
    mutationFn: () => {
      const skills = Object.entries(state).map(([skill, note]) => ({ skill, note }));
      return api.instructor.setSkills(courseId, skills);
    },
    onSuccess: () => {
      notify("Đã lưu kỹ năng đào tạo của khóa học.");
      void queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  return (
    <section className="ws-panel" style={{ marginBottom: 18 }}>
      <div className="ws-panel-head">
        <div><h3>Kỹ năng đào tạo</h3><p>Chọn kỹ năng khóa học này tập trung rèn luyện.</p></div>
        <button type="button" className="button button-primary" style={{ padding: "7px 14px" }} onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Đang lưu…" : "Lưu kỹ năng"}
        </button>
      </div>
      <div className="ws-panel-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
        {SKILL_OPTIONS.map((option) => {
          const active = state[option.value] !== undefined;
          return (
            <div key={option.value} className={cn("ws-field", active && "quiz-option-correct")} style={{ padding: 12, borderRadius: 12, border: "1.5px solid var(--line)", background: active ? "var(--success-soft)" : "var(--paper)", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textTransform: "none", color: "var(--ink)", fontSize: 13 }}>
                <input type="checkbox" checked={active} onChange={() => toggle(option.value)} />
                {option.label}
              </label>
              {active ? (
                <input className="ws-input" style={{ fontSize: 12 }} placeholder="Ghi chú (tùy chọn)" value={state[option.value]} onChange={(event) => setNote(option.value, event.target.value)} />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Lessons + per-lesson quiz editor                                    */
/* ------------------------------------------------------------------ */

type LessonForm = {
  title: string; summary: string; content: string; video_url: string; image_url: string;
  skill: string; duration_minutes: number; lesson_order: number; status: string;
};

const emptyLessonForm: LessonForm = { title: "", summary: "", content: "", video_url: "", image_url: "", skill: "", duration_minutes: 10, lesson_order: 0, status: "draft" };

function LessonSection({
  courseId, lessons, isLoading, editing, creating, onEdit, onCreate, onClose,
}: {
  courseId: string;
  lessons: InstructorLesson[];
  isLoading: boolean;
  editing: InstructorLesson | null;
  creating: boolean;
  onEdit: (lesson: InstructorLesson) => void;
  onCreate: () => void;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const [form, setForm] = useState<LessonForm>(emptyLessonForm);
  const [formFor, setFormFor] = useState<string | null>(null);

  const editingKey = editing?.id ?? (creating ? "new" : null);
  if (editingKey !== formFor) {
    setFormFor(editingKey);
    if (editing) {
      setForm({
        title: editing.title, summary: editing.summary, content: editing.content,
        video_url: editing.video_url, image_url: editing.image_url, skill: editing.skill,
        duration_minutes: editing.duration_minutes, lesson_order: editing.lesson_order, status: editing.status,
      });
    } else if (creating) {
      setForm(emptyLessonForm);
    }
  }

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["instructor", "lessons", courseId] });
    void queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
  };

  const createMutation = useMutation({
    mutationFn: () => api.instructor.createLesson(courseId, form),
    onSuccess: (lesson) => { notify(`Đã thêm bài “${lesson.title}”.`); onClose(); refresh(); },
    onError: (error: Error) => notify(error.message, "error"),
  });
  const updateMutation = useMutation({
    mutationFn: () => api.instructor.updateLesson(editing!.id, form),
    onSuccess: (lesson) => { notify(`Đã lưu “${lesson.title}”.`); onClose(); refresh(); },
    onError: (error: Error) => notify(error.message, "error"),
  });
  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) => api.instructor.deleteLesson(lessonId),
    onSuccess: () => { notify("Đã xóa bài giảng."); onClose(); refresh(); },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const editorOpen = creating || editing !== null;

  return (
    <section className="ws-panel" style={{ marginBottom: 18 }}>
      <div className="ws-panel-head">
        <div><h3>Bài giảng ({lessons.length})</h3><p>Mỗi bài có ảnh minh họa, video, kỹ năng và câu hỏi nhỏ.</p></div>
        <button type="button" className="button button-primary" style={{ padding: "7px 14px" }} onClick={editorOpen ? onClose : onCreate}>
          <Plus size={15} /> {editorOpen ? "Đóng" : "Bài mới"}
        </button>
      </div>

      {editorOpen ? (
        <div className="ws-panel-body">
          <form
            className="ws-form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              if (editing) updateMutation.mutate();
              else createMutation.mutate();
            }}
          >
            <div className="ws-field">
              <label htmlFor="lesson-title">Tiêu đề</label>
              <input id="lesson-title" className="ws-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={3} maxLength={160} />
            </div>
            <div className="ws-field">
              <label htmlFor="lesson-summary">Tóm tắt</label>
              <input id="lesson-summary" className="ws-input" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} maxLength={500} />
            </div>
            <div className="ws-field ws-field-full">
              <label htmlFor="lesson-content">Nội dung (## tiêu đề, - gạch đầu dòng, 1. bước, **đậm**)</label>
              <textarea id="lesson-content" className="ws-textarea" style={{ minHeight: 180 }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required minLength={10} />
            </div>
            <div className="ws-field">
              <label htmlFor="lesson-image">Ảnh minh họa (URL http/s)</label>
              <input id="lesson-image" className="ws-input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" />
            </div>
            <div className="ws-field">
              <label htmlFor="lesson-video">Video (URL http/s)</label>
              <input id="lesson-video" className="ws-input" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://…" />
            </div>
            <div className="ws-field">
              <label htmlFor="lesson-skill">Kỹ năng</label>
              <select id="lesson-skill" className="ws-select" value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })}>
                <option value="">— Tổng hợp —</option>
                {SKILL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="ws-field">
              <label htmlFor="lesson-duration">Thời lượng (phút)</label>
              <input id="lesson-duration" className="ws-input" type="number" min={1} max={180} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) || 10 })} />
            </div>
            <div className="ws-field">
              <label htmlFor="lesson-order">Thứ tự (0 = tự động)</label>
              <input id="lesson-order" className="ws-input" type="number" min={0} max={999} value={form.lesson_order} onChange={(e) => setForm({ ...form, lesson_order: Number(e.target.value) || 0 })} />
            </div>
            <div className="ws-field">
              <label htmlFor="lesson-status">Trạng thái</label>
              <select id="lesson-status" className="ws-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Nháp</option>
                <option value="published">Công khai</option>
              </select>
            </div>
            <div className="ws-form-footer ws-field-full">
              {editing ? (
                <button type="button" className="button button-danger" onClick={() => { if (window.confirm(`Xóa “${editing.title}”?`)) deleteMutation.mutate(editing.id); }}>
                  <Trash2 size={14} /> Xóa
                </button>
              ) : null}
              <button type="button" className="button button-ghost" onClick={onClose}>Hủy</button>
              <button type="submit" className="button button-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                <CheckCircle2 size={15} /> {editing ? "Lưu bài" : "Thêm bài"}
              </button>
            </div>
          </form>
          {editing ? <QuestionsEditor mode="lesson" ownerId={editing.id} /> : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className="ws-panel-body">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: 52, marginBottom: 8 }} />)}</div>
      ) : lessons.length === 0 ? (
        <div className="ws-panel-body"><EmptyState icon={Sparkles} title="Chưa có bài giảng" description="Thêm bài đầu tiên cho khóa học." /></div>
      ) : (
        <div className="ws-feed">
          {lessons.map((lesson) => (
            <div className="ws-feed-item" key={lesson.id} style={{ cursor: "default" }}>
              <span className="pathway-order">{lesson.lesson_order}</span>
              <div className="ws-feed-copy">
                <strong>{lesson.title}</strong>
                <small>
                  {lesson.skill ? `${lesson.skill} · ` : ""}{lesson.duration_minutes} phút
                  {lesson.image_url ? " · có ảnh" : ""} · {lesson.question_count} câu hỏi
                </small>
              </div>
              <span className={cn("status-chip", `status-chip-${lesson.status}`)}>{lesson.status}</span>
              <button type="button" className="button button-secondary" style={{ padding: "6px 10px" }} onClick={() => onEdit(lesson)} aria-label={`Sửa ${lesson.title}`}>
                <Pencil size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Questions editor (shared by lesson quiz & exam)                     */
/* ------------------------------------------------------------------ */

export function QuestionsEditor({ mode, ownerId, title }: { mode: "lesson" | "exam"; ownerId: string; title?: string }) {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const [form, setForm] = useState({ question: "", options: ["", "", "", ""], correct_index: 0, explanation: "" });
  const [open, setOpen] = useState(false);

  const queryKey = ["instructor", mode === "lesson" ? "lesson-questions" : "exam-questions", ownerId];
  const questionsQuery = useQuery({
    queryKey,
    queryFn: mode === "lesson"
      ? () => api.instructor.lessonQuestions(ownerId)
      : () => api.instructor.examQuestions(ownerId),
  });
  const questions = questionsQuery.data ?? [];

  const addMutation = useMutation({
    mutationFn: (input: QuestionInput) =>
      mode === "lesson"
        ? api.instructor.addLessonQuestion(ownerId, input)
        : api.instructor.addExamQuestion(ownerId, input),
    onSuccess: () => {
      notify("Đã thêm câu hỏi.");
      setForm({ question: "", options: ["", "", "", ""], correct_index: 0, explanation: "" });
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });
  const deleteMutation = useMutation({
    mutationFn: (questionId: string) =>
      mode === "lesson"
        ? api.instructor.deleteLessonQuestion(questionId)
        : api.instructor.deleteExamQuestion(questionId),
    onSuccess: () => { notify("Đã xóa câu hỏi."); void queryClient.invalidateQueries({ queryKey }); },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const submit = () => {
    const options = form.options.map((option) => option.trim()).filter(Boolean);
    addMutation.mutate({ question: form.question, options, correct_index: form.correct_index, explanation: form.explanation });
  };

  return (
    <div style={{ marginTop: 18, padding: 16, background: "var(--canvas)", borderRadius: 12, border: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <strong style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
          <ListChecks size={15} /> {title ?? "Câu hỏi"} ({questions.length})
        </strong>
        <button type="button" className="button button-secondary" style={{ padding: "6px 12px" }} onClick={() => setOpen((value) => !value)}>
          <Plus size={14} /> {open ? "Đóng" : "Thêm câu hỏi"}
        </button>
      </div>

      {questions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {questions.map((question: AuthorQuestion) => (
            <div key={question.id} className="ws-feed-item" style={{ padding: "10px 12px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 10 }}>
              <div className="ws-feed-copy">
                <strong>{question.order}. {question.question}</strong>
                <small>Đáp án: {String.fromCharCode(65 + question.correct_index)}. {question.options[question.correct_index]}</small>
              </div>
              <button type="button" className="button button-ghost" style={{ padding: "5px 8px", color: "var(--danger)" }} onClick={() => deleteMutation.mutate(question.id)} aria-label="Xóa câu hỏi">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="ws-table-muted" style={{ margin: "4px 0 0" }}>Chưa có câu hỏi nào.</p>
      )}

      {open ? (
        <div className="ws-form-grid" style={{ marginTop: 12 }}>
          <div className="ws-field ws-field-full">
            <label>Câu hỏi</label>
            <input className="ws-input" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Which sentence…?" />
          </div>
          {form.options.map((option, index) => (
            <div className="ws-field" key={index}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="radio" name={`correct-${mode}-${ownerId}`} checked={form.correct_index === index} onChange={() => setForm({ ...form, correct_index: index })} />
                Đáp án {String.fromCharCode(65 + index)} {form.correct_index === index ? "· đúng" : ""}
              </label>
              <input className="ws-input" value={option} onChange={(e) => {
                const options = [...form.options];
                options[index] = e.target.value;
                setForm({ ...form, options });
              }} placeholder={`Phương án ${String.fromCharCode(65 + index)}`} />
            </div>
          ))}
          <div className="ws-field ws-field-full">
            <label>Giải thích (hiện sau khi trả lời)</label>
            <input className="ws-input" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
          </div>
          <div className="ws-form-footer ws-field-full">
            <button type="button" className="button button-primary" onClick={submit} disabled={addMutation.isPending || form.question.trim().length < 5}>
              {addMutation.isPending ? "Đang thêm…" : "Thêm câu hỏi"} <CheckCircle2 size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exams editor                                                        */
/* ------------------------------------------------------------------ */

function ExamsEditor({ courseId }: { courseId: string }) {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const [creating, setCreating] = useState(false);
  const [openExam, setOpenExam] = useState<InstructorExam | null>(null);
  const [form, setForm] = useState({ title: "", description: "", pass_score: 70, duration_minutes: 20 });

  const examsQuery = useQuery({ queryKey: ["instructor", "exams", courseId], queryFn: () => api.instructor.exams(courseId) });
  const exams = examsQuery.data ?? [];
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["instructor", "exams", courseId] });

  const createMutation = useMutation({
    mutationFn: () => api.instructor.createExam(courseId, form),
    onSuccess: (exam) => { notify(`Đã tạo bài kiểm tra “${exam.title}”.`); setCreating(false); setForm({ title: "", description: "", pass_score: 70, duration_minutes: 20 }); refresh(); },
    onError: (error: Error) => notify(error.message, "error"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ examId, status }: { examId: string; status: string }) => api.instructor.updateExam(examId, { status }),
    onSuccess: (exam) => { notify(`Bài kiểm tra hiện ở trạng thái ${exam.status}.`); refresh(); },
    onError: (error: Error) => notify(error.message, "error"),
  });
  const deleteMutation = useMutation({
    mutationFn: (examId: string) => api.instructor.deleteExam(examId),
    onSuccess: () => { notify("Đã xóa bài kiểm tra."); setOpenExam(null); refresh(); },
    onError: (error: Error) => notify(error.message, "error"),
  });

  return (
    <section className="ws-panel">
      <div className="ws-panel-head">
        <div><h3>Bài kiểm tra cuối khóa ({exams.length})</h3><p>Điểm đạt mặc định 70%. Bài kiểm tra công khai mới hiện cho học viên.</p></div>
        <button type="button" className="button button-primary" style={{ padding: "7px 14px" }} onClick={() => setCreating((value) => !value)}>
          <Plus size={15} /> {creating ? "Đóng" : "Tạo bài kiểm tra"}
        </button>
      </div>

      {creating ? (
        <div className="ws-panel-body">
          <div className="ws-form-grid">
            <div className="ws-field">
              <label>Tiêu đề</label>
              <input className="ws-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Final Check" />
            </div>
            <div className="ws-field">
              <label>Mô tả</label>
              <input className="ws-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="ws-field">
              <label>Điểm đạt (%)</label>
              <input className="ws-input" type="number" min={10} max={100} value={form.pass_score} onChange={(e) => setForm({ ...form, pass_score: Number(e.target.value) || 70 })} />
            </div>
            <div className="ws-field">
              <label>Thời lượng (phút)</label>
              <input className="ws-input" type="number" min={1} max={180} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) || 20 })} />
            </div>
            <div className="ws-form-footer ws-field-full">
              <button type="button" className="button button-primary" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || form.title.trim().length < 3}>
                {createMutation.isPending ? "Đang tạo…" : "Tạo bài kiểm tra"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {examsQuery.isLoading ? (
        <div className="ws-panel-body"><Skeleton style={{ height: 48 }} /></div>
      ) : exams.length === 0 ? (
        <div className="ws-panel-body"><EmptyState icon={ClipboardCheck} title="Chưa có bài kiểm tra" description="Tạo bài kiểm tra cuối khóa để hoàn chỉnh lộ trình." /></div>
      ) : (
        <div className="ws-feed">
          {exams.map((exam) => (
            <div className="ws-feed-item" key={exam.id} style={{ cursor: "default", flexWrap: "wrap" }}>
              <ClipboardCheck size={17} style={{ color: "var(--purple)" }} />
              <div className="ws-feed-copy">
                <strong>{exam.title}</strong>
                <small>{exam.question_count} câu · đạt {exam.pass_score}% · {exam.duration_minutes} phút</small>
              </div>
              <span className={cn("status-chip", `status-chip-${exam.status}`)}>{exam.status}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {exam.status === "draft" ? (
                  <button type="button" className="button button-primary" style={{ padding: "6px 12px" }} onClick={() => updateMutation.mutate({ examId: exam.id, status: "published" })}>Công khai</button>
                ) : (
                  <button type="button" className="button button-ghost" style={{ padding: "6px 12px" }} onClick={() => updateMutation.mutate({ examId: exam.id, status: "draft" })}>Ẩn</button>
                )}
                <button type="button" className="button button-secondary" style={{ padding: "6px 10px" }} onClick={() => setOpenExam(openExam?.id === exam.id ? null : exam)}>
                  <ListChecks size={14} />
                </button>
                <button type="button" className="button button-ghost" style={{ padding: "6px 10px", color: "var(--danger)" }} onClick={() => { if (window.confirm(`Xóa “${exam.title}”?`)) deleteMutation.mutate(exam.id); }}>
                  <Trash2 size={14} />
                </button>
              </div>
              {openExam?.id === exam.id ? (
                <div style={{ flex: "1 1 100%" }}>
                  <QuestionsEditor mode="exam" ownerId={exam.id} title={`Câu hỏi — ${exam.title}`} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
