"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Library,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { Badge, EmptyState, Skeleton, StatCard, cn } from "@/components/ui";
import { api, type AdminAccount } from "@/lib/api";

function formatDay(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function WorkspaceHeader({ eyebrow, title, lede }: { eyebrow: string; title: React.ReactNode; lede: string }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow eyebrow-blue">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-lede">{lede}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export function AdminOverviewView() {
  const query = useQuery({ queryKey: ["admin", "overview"], queryFn: api.admin.overview });

  if (query.isLoading) {
    return (
      <div className="workspace-page">
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-lede" />
        <div className="ws-stat-grid">{Array.from({ length: 4 }).map((_, index) => <Skeleton className="skeleton-topic" key={index} style={{ height: 92 }} />)}</div>
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="state-page">
        <EmptyState icon={ShieldCheck} title="Metrics are offline" description={query.error.message}>
          <button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button>
        </EmptyState>
      </div>
    );
  }

  const overview = query.data!;
  return (
    <div className="workspace-page page-enter">
      <WorkspaceHeader eyebrow="Platform overview" title={<>Platform pulse, <em>at a glance.</em></>} lede="Sức khỏe toàn hệ thống: người dùng, khóa học, tiến độ học và hoạt động hôm nay." />

      <div className="ws-stat-grid">
        <StatCard icon={Users} label="Total users" value={overview.users.total} meta={`${overview.users.new_this_week} new this week`} tone="blue" />
        <StatCard icon={GraduationCap} label="Instructors" value={overview.users.instructors} meta={`${overview.users.students} students learning`} tone="purple" />
        <StatCard icon={BookOpen} label="Courses" value={overview.courses.total} meta={`${overview.courses.published} published · ${overview.courses.draft} drafts`} tone="green" />
        <StatCard icon={Activity} label="Active today" value={overview.active_learners_today} meta="learners studied today" tone="orange" />
        <StatCard icon={Library} label="Dictionary words" value={overview.dictionary_words} meta="across all languages" tone="blue" />
        <StatCard icon={CheckCircle2} label="Lesson completions" value={overview.lesson_completions} meta={`${overview.enrollments} enrollments`} tone="green" />
      </div>

      <div className="ws-grid-2">
        <section className="ws-panel">
          <div className="ws-panel-head">
            <div>
              <h3>Newest accounts</h3>
              <p>Người dùng mới nhất tham gia nền tảng</p>
            </div>
            <Link href="/admin/users" className="button button-secondary">Manage users</Link>
          </div>
          <div className="ws-feed">
            {overview.recent_users.map((user) => (
              <div className="ws-feed-item" key={user.id}>
                <span className="avatar avatar-small">{user.first_name.slice(0, 1).toUpperCase()}</span>
                <div className="ws-feed-copy">
                  <strong>{user.first_name}</strong>
                  <small>{user.email}</small>
                </div>
                <span className={cn("role-chip", `role-chip-${user.role}`)}>{user.role}</span>
                <span className="ws-feed-time">{formatDay(user.created_at)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="ws-panel">
          <div className="ws-panel-head">
            <div>
              <h3>Latest enrollments</h3>
              <p>Học viên mới đăng ký khóa học</p>
            </div>
          </div>
          <div className="ws-feed">
            {overview.recent_enrollments.map((event) => (
              <div className="ws-feed-item" key={event.id}>
                <span className="avatar avatar-small">{event.student_name.slice(0, 1).toUpperCase()}</span>
                <div className="ws-feed-copy">
                  <strong>{event.student_name} → {event.course_title}</strong>
                  <small>with {event.instructor_name}</small>
                </div>
                <span className="ws-feed-time">{formatDay(event.enrolled_at)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

const roleFilters = [
  { value: "", label: "All roles" },
  { value: "student", label: "Students" },
  { value: "instructor", label: "Instructors" },
  { value: "admin", label: "Admins" },
];

export function AdminUsersView() {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["admin", "users", role, search],
    queryFn: () => api.admin.users({ role, q: search || undefined, limit: 50 }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, value }: { userId: string; value: string }) => api.admin.updateUser(userId, { role: value }),
    onSuccess: (account) => {
      notify(`${account.first_name} is now ${account.role}.`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.admin.deleteUser(userId),
    onSuccess: () => {
      notify("Account removed from the platform.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const users = query.data?.items ?? [];

  return (
    <div className="workspace-page page-enter">
      <WorkspaceHeader eyebrow="User management" title={<>Accounts & <em>access control.</em></>} lede="Tra cứu, thay đổi vai trò và vô hiệu hóa tài khoản trên toàn nền tảng." />

      <div className="ws-toolbar">
        <label className="ws-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search users"
          />
        </label>
        <div className="segmented-tabs">
          {roleFilters.map((filter) => (
            <button key={filter.value} type="button" className={role === filter.value ? "active" : ""} onClick={() => setRole(filter.value)}>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <section className="ws-panel">
        <div className="ws-panel-head">
          <div>
            <h3>{query.data?.total ?? 0} accounts</h3>
            <p>Role changes apply immediately. Instructors without courses keep their content safe.</p>
          </div>
        </div>
        {query.isLoading ? (
          <div className="ws-panel-body">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} style={{ height: 44, marginBottom: 10 }} />)}</div>
        ) : query.isError ? (
          <div className="ws-panel-body">
            <EmptyState icon={UserCog} title="Could not load users" description={query.error.message}>
              <button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button>
            </EmptyState>
          </div>
        ) : users.length === 0 ? (
          <div className="ws-panel-body">
            <EmptyState icon={Search} title="No accounts match" description="Thử từ khóa khác hoặc bỏ bộ lọc vai trò." />
          </div>
        ) : (
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Activity</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <UserRow
                    key={account.id}
                    account={account}
                    busy={roleMutation.isPending && roleMutation.variables?.userId === account.id}
                    onRoleChange={(value) => roleMutation.mutate({ userId: account.id, value })}
                    onDelete={() => {
                      if (window.confirm(`Remove ${account.email}? They will no longer be able to sign in.`)) {
                        deleteMutation.mutate(account.id);
                      }
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function UserRow({
  account,
  busy,
  onRoleChange,
  onDelete,
}: {
  account: AdminAccount;
  busy: boolean;
  onRoleChange: (value: string) => void;
  onDelete: () => void;
}) {
  return (
    <tr className={cn(busy && "opacity-60")}>
      <td>
        <div className="ws-user-cell">
          <span className="avatar avatar-small">{account.first_name.slice(0, 1).toUpperCase()}</span>
          <span>
            <span className="ws-table-strong">{account.first_name}</span>
            <small>{account.email}</small>
          </span>
        </div>
      </td>
      <td>
        <select
          className="ws-select ws-select-inline"
          value={account.role}
          aria-label={`Role for ${account.email}`}
          onChange={(event) => {
            if (event.target.value !== account.role) onRoleChange(event.target.value);
          }}
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="ws-table-muted">{formatDay(account.created_at)}</td>
      <td className="ws-table-muted">
        {account.role === "instructor"
          ? `${account.teaching_courses} courses`
          : `${account.enrolled_courses} enrolled · ${account.completed_lessons} lessons done`}
      </td>
      <td>
        <div className="ws-table-actions">
          <button type="button" className="button button-ghost" style={{ padding: "6px 10px" }} onClick={onDelete} aria-label={`Remove ${account.email}`}>
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */

export function AdminCoursesView() {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const query = useQuery({ queryKey: ["admin", "courses"], queryFn: api.admin.courses });

  const statusMutation = useMutation({
    mutationFn: ({ courseId, status }: { courseId: string; status: string }) => api.admin.updateCourseStatus(courseId, status),
    onSuccess: (result) => {
      notify(`Course is now ${result.status}.`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const courses = query.data ?? [];

  return (
    <div className="workspace-page page-enter">
      <WorkspaceHeader eyebrow="Course catalog" title={<>Every path, <em>under control.</em></>} lede="Xuất bản, lưu nháp hoặc lưu trữ khóa học; theo dõi giảng viên phụ trách và lượt đăng ký." />

      <section className="ws-panel">
        <div className="ws-panel-head">
          <div>
            <h3>{courses.length} courses</h3>
            <p>Published courses appear instantly in the learner library.</p>
          </div>
        </div>
        {query.isLoading ? (
          <div className="ws-panel-body">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} style={{ height: 44, marginBottom: 10 }} />)}</div>
        ) : query.isError ? (
          <div className="ws-panel-body">
            <EmptyState icon={GraduationCap} title="Could not load courses" description={query.error.message}>
              <button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button>
            </EmptyState>
          </div>
        ) : (
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Level</th>
                  <th>Lessons</th>
                  <th>Enrolled</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Lifecycle</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <span className="ws-table-strong">{course.title}</span>
                      <div className="ws-table-muted">/{course.slug} · {course.language_code.toUpperCase()}</div>
                    </td>
                    <td className="ws-table-muted">{course.instructor_name}</td>
                    <td><Badge tone="blue">{course.cefr}</Badge></td>
                    <td className="ws-table-strong">{course.lesson_count}</td>
                    <td className="ws-table-strong">{course.enrollment_count}</td>
                    <td><span className={cn("status-chip", `status-chip-${course.status}`)}>{course.status}</span></td>
                    <td>
                      <div className="ws-table-actions">
                        {course.status === "draft" ? (
                          <button type="button" className="button button-primary" style={{ padding: "6px 12px" }} onClick={() => statusMutation.mutate({ courseId: course.id, status: "published" })}>Publish</button>
                        ) : course.status === "published" ? (
                          <button type="button" className="button button-ghost" style={{ padding: "6px 12px" }} onClick={() => statusMutation.mutate({ courseId: course.id, status: "archived" })}>Archive</button>
                        ) : (
                          <button type="button" className="button button-ghost" style={{ padding: "6px 12px" }} onClick={() => statusMutation.mutate({ courseId: course.id, status: "published" })}>Republish</button>
                        )}
                        <Link className="button button-secondary" style={{ padding: "6px 12px" }} href={`/app/courses/${course.slug}`}>View</Link>
                      </div>
                    </td>
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

/* ------------------------------------------------------------------ */
/* Languages                                                           */
/* ------------------------------------------------------------------ */

export function AdminLanguagesView() {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const query = useQuery({ queryKey: ["admin", "languages"], queryFn: api.admin.languages });

  const toggleMutation = useMutation({
    mutationFn: ({ languageId, isActive }: { languageId: string; isActive: boolean }) => api.admin.updateLanguage(languageId, isActive),
    onSuccess: (result) => {
      notify(result.is_active ? "Language enabled for new learners." : "Language hidden from new learners.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "languages"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const languages = query.data ?? [];

  return (
    <div className="workspace-page page-enter">
      <WorkspaceHeader eyebrow="Languages" title={<>Eight tongues, <em>one switchboard.</em></>} lede="Bật/tắt ngôn ngữ; thống kê từ vựng, khóa học và người học đang theo." />

      {query.isLoading ? (
        <div className="lang-grid">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} style={{ height: 150 }} />)}</div>
      ) : query.isError ? (
        <div className="state-page">
          <EmptyState icon={Library} title="Could not load languages" description={query.error.message}>
            <button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button>
          </EmptyState>
        </div>
      ) : (
        <div className="lang-grid">
          {languages.map((language) => (
            <article className={cn("lang-card", !language.is_active && "lang-card-off")} key={language.id}>
              <div className="lang-card-top">
                <span className="lang-flag-lg">{language.flag_emoji}</span>
                <div>
                  <strong>{language.name}</strong>
                  <div className="ws-table-muted">{language.native_name} · {language.code.toUpperCase()}</div>
                </div>
              </div>
              <div className="lang-stats">
                <span><strong>{language.word_count}</strong> words</span>
                <span><strong>{language.course_count}</strong> courses</span>
                <span><strong>{language.learner_count}</strong> learners</span>
              </div>
              <div className="lang-toggle">
                <span className="ws-table-muted">{language.is_active ? "Available for learning" : "Hidden from learners"}</span>
                <button
                  type="button"
                  className="toggle"
                  aria-pressed={language.is_active}
                  aria-label={`Toggle ${language.name}`}
                  onClick={() => toggleMutation.mutate({ languageId: language.id, isActive: !language.is_active })}
                />
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="ws-table-muted" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <Clock3 size={13} /> Existing learner progress is preserved when a language is disabled.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Course review queue                                                 */
/* ------------------------------------------------------------------ */

export function AdminReviewsView() {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const query = useQuery({ queryKey: ["admin", "courses"], queryFn: api.admin.courses });

  const reviewMutation = useMutation({
    mutationFn: ({ courseId, action, note }: { courseId: string; action: "approve" | "reject"; note: string }) =>
      api.admin.reviewCourse(courseId, action, note),
    onSuccess: (course, variables) => {
      notify(variables.action === "approve" ? `Đã duyệt và xuất bản “${course.title}”.` : `Đã trả “${course.title}” về nháp kèm ghi chú.`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  const pending = (query.data ?? []).filter((course) => course.status === "pending");
  const others = (query.data ?? []).filter((course) => course.status !== "pending");

  return (
    <div className="workspace-page page-enter">
      <WorkspaceHeader eyebrow="Course review" title={<>Kiểm duyệt <em>khóa học.</em></>} lede="Duyệt hoặc trả về các khóa học giảng viên gửi lên. Từ chối luôn kèm ghi chú để giảng viên sửa." />

      <section className="ws-panel" style={{ marginBottom: 18 }}>
        <div className="ws-panel-head">
          <div><h3>Chờ duyệt ({pending.length})</h3><p>Khóa học đang chờ quyết định của bạn.</p></div>
        </div>
        {query.isLoading ? (
          <div className="ws-panel-body">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} style={{ height: 60, marginBottom: 10 }} />)}</div>
        ) : pending.length === 0 ? (
          <div className="ws-panel-body"><EmptyState icon={CheckCircle2} title="Hàng duyệt trống" description="Không có khóa học nào đang chờ phê duyệt." /></div>
        ) : (
          <div className="ws-feed">
            {pending.map((course) => (
              <div className="ws-feed-item" key={course.id} style={{ flexWrap: "wrap", padding: "16px 18px" }}>
                <GraduationCap size={18} style={{ color: "var(--warning)" }} />
                <div className="ws-feed-copy" style={{ minWidth: 220 }}>
                  <strong>{course.title}</strong>
                  <small>{course.instructor_name} · {course.lesson_count} bài · {course.cefr} · {course.language_code.toUpperCase()}</small>
                </div>
                <Link className="button button-secondary" style={{ padding: "6px 12px" }} href={`/app/courses/${course.slug}`}>Xem trước</Link>
                <input
                  className="ws-input"
                  style={{ flex: "1 1 240px" }}
                  placeholder="Ghi chú cho giảng viên (bắt buộc khi từ chối)"
                  value={notes[course.id] ?? ""}
                  onChange={(event) => setNotes({ ...notes, [course.id]: event.target.value })}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => reviewMutation.mutate({ courseId: course.id, action: "approve", note: notes[course.id] ?? "" })}
                    disabled={reviewMutation.isPending}
                  >
                    Duyệt & xuất bản
                  </button>
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => reviewMutation.mutate({ courseId: course.id, action: "reject", note: notes[course.id] ?? "" })}
                    disabled={reviewMutation.isPending || !(notes[course.id] ?? "").trim()}
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="ws-panel">
        <div className="ws-panel-head">
          <div><h3>Đã xử lý</h3><p>Trạng thái hiện tại của các khóa còn lại.</p></div>
        </div>
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr><th>Khóa học</th><th>Giảng viên</th><th>Trạng thái</th><th>Ghi chú duyệt</th></tr>
            </thead>
            <tbody>
              {others.map((course) => (
                <tr key={course.id}>
                  <td className="ws-table-strong">{course.title}</td>
                  <td className="ws-table-muted">{course.instructor_name}</td>
                  <td><span className={cn("status-chip", `status-chip-${course.status}`)}>{course.status}</span></td>
                  <td className="ws-table-muted">{course.review_note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
