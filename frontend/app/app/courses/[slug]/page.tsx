import { LessonDetailView } from "@/components/lesson-detail-view";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LessonDetailView kind="course" slug={slug} />;
}
