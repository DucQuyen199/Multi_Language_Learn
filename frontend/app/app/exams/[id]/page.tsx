import { ExamTakingView } from "@/components/exam-view";

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExamTakingView examId={id} />;
}
