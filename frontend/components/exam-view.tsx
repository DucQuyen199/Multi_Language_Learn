"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Clock3, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { EmptyState, Skeleton, cn } from "@/components/ui";
import { api, type ExamResult } from "@/lib/api";

export function ExamTakingView({ examId }: { examId: string }) {
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ExamResult | null>(null);

  const query = useQuery({ queryKey: ["exam", examId], queryFn: () => api.exam(examId) });

  const submitMutation = useMutation({
    mutationFn: () =>
      api.submitExam(
        examId,
        (query.data?.questions ?? []).map((question) => ({ question_id: question.id, choice: choices[question.id] ?? -1 })),
      ),
    onSuccess: (data) => {
      setResult(data);
      if (data.passed) notify(`Đạt ${data.score}% — bạn đã vượt bài kiểm tra! 🎉`);
      else notify(`${data.score}% — chưa đạt ${data.pass_score}%. Xem giải thích và thử lại nhé.`, "info");
      void queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
    onError: (error: Error) => notify(error.message, "error"),
  });

  if (query.isLoading) {
    return <div className="workspace-page"><Skeleton className="skeleton-title" /><Skeleton className="skeleton-lede" /><Skeleton className="skeleton-collection" /></div>;
  }
  if (query.isError) {
    return (
      <div className="state-page">
        <EmptyState icon={ClipboardCheck} title="Bài kiểm tra không khả dụng" description={query.error.message}>
          <Link href="/app/courses" className="button button-primary">Về khóa học</Link>
        </EmptyState>
      </div>
    );
  }

  const exam = query.data!;
  const allAnswered = exam.questions.every((question) => choices[question.id] !== undefined);

  return (
    <div className="workspace-page page-enter">
      <div className="lesson-top" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Link href={`/app/courses/${exam.course_slug}`} className="back-link"><ArrowLeft size={15} /> {exam.course_title}</Link>
        <span>{exam.questions.length} câu · {exam.duration_minutes} phút</span>
        {exam.best_score !== null ? <span className="status-chip status-chip-published">Best {exam.best_score}%</span> : null}
      </div>

      {result ? (
        <div className={cn("exam-result-hero", result.passed ? "pass" : "fail")}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.85 }}>
            {result.passed ? <Trophy size={14} /> : <RotateCcw size={14} />} {result.passed ? "Đạt" : "Chưa đạt"}
          </span>
          <h1>{result.score}%</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {result.correct}/{result.total} câu đúng · yêu cầu đạt {result.pass_score}%
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button type="button" className="button button-secondary" onClick={() => { setResult(null); setChoices({}); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <RotateCcw size={14} /> Làm lại
            </button>
            <Link href={`/app/courses/${exam.course_slug}`} className="button button-dark">Về khóa học <ArrowRight size={14} /></Link>
          </div>
        </div>
      ) : (
        <div className="exam-hero">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="ws-tag-dot" style={{ background: "var(--purple)", width: 10, height: 10, boxShadow: "0 0 0 4px var(--purple-soft)" }} />
            <div>
              <p className="eyebrow eyebrow-purple" style={{ margin: 0 }}>Bài kiểm tra cuối khóa</p>
              <h1 style={{ margin: "4px 0 0", fontSize: 26, letterSpacing: "-.03em" }}>{exam.title}</h1>
            </div>
          </div>
          {exam.description ? <p className="page-lede" style={{ margin: 0 }}>{exam.description}</p> : null}
          <p className="ws-table-muted" style={{ margin: 0, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span><Clock3 size={13} /> {exam.duration_minutes} phút</span>
            <span><ClipboardCheck size={13} /> {exam.questions.length} câu hỏi</span>
            <span><CheckCircle2 size={13} /> Đạt {exam.pass_score}% để vượt qua</span>
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 860 }}>
        {exam.questions.map((question) => {
          const detail = result?.details.find((entry) => entry.question_id === question.id);
          return (
            <div className="quiz-question-card" key={question.id} style={{ background: "var(--paper)" }}>
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
      </div>

      {!result ? (
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button
            type="button"
            className="button button-primary"
            disabled={!allAnswered || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
          >
            {submitMutation.isPending ? "Đang chấm…" : "Nộp bài kiểm tra"}
          </button>
          <span className="ws-table-muted" style={{ alignSelf: "center" }}>
            {Object.keys(choices).length}/{exam.questions.length} đã trả lời
          </span>
        </div>
      ) : null}
    </div>
  );
}
