import { View, Text } from "react-native";
import React from "react";

/**
 * Minimal markdown renderer for lesson content.
 * Supports: ## headings, - bullets, 1. numbered lists, **bold** inline.
 */
function renderInline(text: string, keyPrefix: string, baseClass: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={`${keyPrefix}-${i}`} className={`${baseClass} font-bold`}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return (
      <Text key={`${keyPrefix}-${i}`} className={baseClass}>
        {part}
      </Text>
    );
  });
}

export function LessonContent({ content }: { content: string }) {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);

  return (
    <View className="gap-2.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <Text key={idx} className="text-lg font-bold text-ink mt-2">
              {trimmed.slice(3)}
            </Text>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <Text key={idx} className="text-xl font-bold text-ink mt-2">
              {trimmed.slice(2)}
            </Text>
          );
        }
        if (trimmed.startsWith("- ")) {
          return (
            <View key={idx} className="flex-row gap-2 pl-1">
              <Text className="text-primary font-bold">•</Text>
              <View className="flex-1 flex-row flex-wrap">
                {renderInline(trimmed.slice(2), `b${idx}`, "text-sm text-navy")}
              </View>
            </View>
          );
        }
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <View key={idx} className="flex-row gap-2 pl-1">
              <Text className="text-primary font-bold text-sm">{numberedMatch[1]}.</Text>
              <View className="flex-1 flex-row flex-wrap">
                {renderInline(numberedMatch[2], `n${idx}`, "text-sm text-navy")}
              </View>
            </View>
          );
        }
        return (
          <View key={idx} className="flex-row flex-wrap">
            {renderInline(trimmed, `p${idx}`, "text-sm text-navy leading-5")}
          </View>
        );
      })}
    </View>
  );
}
