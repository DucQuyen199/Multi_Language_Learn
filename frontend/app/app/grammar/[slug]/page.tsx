import { LessonDetailView } from "@/components/lesson-detail-view";

export default async function GrammarLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LessonDetailView kind="grammar" slug={slug} />;
}
