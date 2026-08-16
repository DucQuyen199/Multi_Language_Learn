import { LessonStudyView } from "@/components/course-detail-view";

export default async function LessonStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonStudyView lessonId={id} />;
}
