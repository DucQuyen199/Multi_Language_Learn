import { CourseStudioView } from "@/components/instructor-studio";

export default async function InstructorCourseStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseStudioView courseId={id} />;
}
