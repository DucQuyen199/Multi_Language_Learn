"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Filter, Library, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { api, type VocabularyItem } from "@/lib/api";
import { Badge, EmptyState, Skeleton, cn } from "@/components/ui";
import { t } from "@/lib/i18n";

export function VocabularyView() {
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "due">("all");
  const queryClient = useQueryClient();
  const { notify } = useActionFeedback();
  const query = useQuery({ queryKey: ["vocabulary"], queryFn: api.vocabulary });
  const removeMutation = useMutation({ mutationFn: api.removeVocabulary, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vocabulary"] }); notify("Word removed from your vocabulary."); }, onError: (error) => notify(error.message, "info") });
  const items = useMemo(() => (query.data ?? []).filter((item) => item.word.toLowerCase().includes(filter.toLowerCase()) && (activeTab === "all" || item.mastery < 0.7)), [activeTab, filter, query.data]);
  const averageMastery = Math.round(((query.data ?? []).reduce((total, item) => total + item.mastery, 0) / Math.max(query.data?.length ?? 1, 1)) * 100);

  if (query.isLoading) return <VocabularySkeleton />;
  if (query.isError) {
    return <div className="state-page"><EmptyState icon={Library} title="Vocabulary is offline" description={query.error.message}><button type="button" className="button button-primary" onClick={() => query.refetch()}>{t("common.retry")}</button></EmptyState></div>;
  }

  return (
    <div className="workspace-page page-enter">
      <div className="page-header"><div><p className="eyebrow eyebrow-blue">Your collection</p><h1>Vocabulary, <em>made yours.</em></h1><p className="page-lede">Save the words that matter, then let spaced repetition do the remembering.</p></div><Link href="/dictionary" className="button button-primary"><Search size={16} /> Find a word</Link></div>
      <div className="collection-overview"><div className="collection-number"><strong>{query.data?.length ?? 0}</strong><span>saved words</span></div><div className="collection-copy"><span className="eyebrow">Personal lexicon</span><p>Small, deliberate collections create stronger recall than endless lists.</p></div><div className="collection-meter"><div><span>Mastery average</span><strong>{averageMastery}%</strong></div><div className="meter-line"><span style={{ width: `${averageMastery}%` }} /></div></div></div>
      <div className="collection-toolbar"><div className="segmented-tabs"><button type="button" className={cn(activeTab === "all" && "active")} onClick={() => setActiveTab("all")}>All words <span>{query.data?.length ?? 0}</span></button><button type="button" className={cn(activeTab === "due" && "active")} onClick={() => setActiveTab("due")}>Due to review <span>{query.data?.filter((item) => item.mastery < 0.7).length ?? 0}</span></button></div><div className="toolbar-actions"><label className="inline-search"><Search size={15} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter words" aria-label="Filter saved words" /></label><button type="button" className={cn("icon-button", activeTab === "due" && "icon-button-active")} aria-label="Toggle due vocabulary filter" onClick={() => { setActiveTab((value) => value === "all" ? "due" : "all"); notify(activeTab === "all" ? "Showing words due for review." : "Showing all saved words.", "info"); }}><Filter size={16} /></button></div></div>
      {items.length ? <div className="vocabulary-table"><div className="vocabulary-table-head"><span>Word</span><span>Meaning</span><span>Mastery</span><span>Next review</span><span /></div>{items.map((item) => <VocabularyRow key={item.id} item={item} onRemove={() => removeMutation.mutate(item.entry_id)} />)}</div> : <EmptyState icon={Bookmark} title={filter ? "No word matches that filter" : "Your vocabulary list is empty"} description={filter ? "Try a different spelling or clear the filter." : "Start by searching for a useful word in the dictionary."} action={!filter ? <Link href="/dictionary" className="button button-secondary">{t("common.explore")}</Link> : null} />}
    </div>
  );
}

function VocabularyRow({ item, onRemove }: { item: VocabularyItem; onRemove: () => void }) {
  const mastery = Math.round(item.mastery * 100);
  return <div className="vocabulary-table-row"><Link href={`/dictionary/en/${item.word}`} className="table-word"><span className="word-initial word-initial-small">{item.word.slice(0, 1).toUpperCase()}</span><span><strong>{item.word}</strong><small>{item.ipa} · {item.part_of_speech}</small></span></Link><span className="table-meaning">{item.translation || "Open dictionary for translation"}</span><span className="table-mastery"><div className="mastery-bar"><span style={{ width: `${mastery}%` }} /></div><strong>{mastery}%</strong></span><span className="table-review">{item.mastery < 0.7 ? <Badge tone="orange">Due soon</Badge> : <Badge tone="green">In rhythm</Badge>}</span><button type="button" className="icon-button table-menu" onClick={onRemove} aria-label={`Remove ${item.word}`}><MoreHorizontal size={16} /></button></div>;
}

function VocabularySkeleton() {
  return <div className="workspace-page"><div className="page-header"><div><Skeleton className="skeleton-eyebrow" /><Skeleton className="skeleton-title" /><Skeleton className="skeleton-lede" /></div><Skeleton className="skeleton-button" /></div><Skeleton className="skeleton-collection" /><Skeleton className="skeleton-table" /></div>;
}
