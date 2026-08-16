import { View, Text, ScrollView, RefreshControl, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { LessonContent } from "@/components/LessonContent";
import { QuizBlock } from "@/components/QuizBlock";
import { SkillChip } from "@/components/SkillChip";

const skillLabels: Record<string, string> = {
  listening: "Nghe",
  speaking: "Nói",
  reading: "Đọc",
  writing: "Viết",
  vocabulary: "Từ vựng",
  grammar: "Ngữ pháp",
};

export default function LessonStudyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: lesson, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["lesson", id],
    queryFn: () => api.lesson(id as string),
    enabled: !!id,
  });

  if (isLoading || !lesson) {
    return (
      <View className="flex-1 bg-canvas">
        <ScreenHeader title="Bài học" />
        <View className="p-4 gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader
        title={lesson.title}
        subtitle={`${lesson.course_title} · ${lesson.duration_minutes} phút`}
        right={lesson.completed ? <Ionicons name="checkmark-circle" size={24} color="#16a34a" /> : null}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {lesson.image_url ? (
          <Image
            source={{ uri: lesson.image_url }}
            className="w-full h-44 rounded-lg"
            resizeMode="cover"
          />
        ) : null}

        <View className="flex-row items-center gap-2">
          {lesson.skill ? <SkillChip skill={lesson.skill} label={skillLabels[lesson.skill] ?? lesson.skill} /> : null}
          {lesson.completed ? <Badge tone="green" label="Đã hoàn thành" /> : null}
          {lesson.score != null ? <Badge tone="blue" label={`${lesson.score}%`} /> : null}
        </View>

        {lesson.summary ? <Text className="text-sm text-muted">{lesson.summary}</Text> : null}

        {lesson.video_url ? (
          <Card className="flex-row items-center gap-3">
            <Ionicons name="play-circle" size={28} color="#2563eb" />
            <Text className="text-sm text-primary flex-1" numberOfLines={1}>
              Video bài học (mở trong trình duyệt)
            </Text>
          </Card>
        ) : null}

        <Card>
          <LessonContent content={lesson.content} />
        </Card>

        {lesson.questions.length > 0 ? (
          <View className="gap-3">
            <Text className="text-base font-bold text-ink">Kiểm tra nhanh</Text>
            <QuizBlock
              questions={lesson.questions}
              onSubmit={(answers) => api.submitLessonQuiz(lesson.id, answers)}
              onCompleted={() => {
                queryClient.invalidateQueries({ queryKey: ["lesson", id] });
                queryClient.invalidateQueries({ queryKey: ["courseDetail"] });
                queryClient.invalidateQueries({ queryKey: ["dashboard"] });
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
