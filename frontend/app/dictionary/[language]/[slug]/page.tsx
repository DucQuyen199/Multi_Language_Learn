import { DictionaryView } from "@/components/dictionary-view";

export default async function DictionaryEntryPage({ params }: { params: Promise<{ language: string; slug: string }> }) {
  const { language, slug } = await params;
  return <DictionaryView initialWord={slug} initialLanguage={language} />;
}
