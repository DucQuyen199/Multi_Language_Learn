import { CourseDetailView } from "@/components/course-detail-view";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CourseDetailView slug={slug} />;
}
