"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  Copy,
  Keyboard,
  Lightbulb,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Search,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { Badge, EmptyState, ProgressBar, SectionHeading, cn } from "@/components/ui";
import { api, type DictionaryEntry, type SearchResult } from "@/lib/api";
import { t } from "@/lib/i18n";

const popularWords = ["development", "research", "evidence", "significant", "approach"];

export function DictionaryView({ initialWord, initialLanguage = "en" }: { initialWord?: string; initialLanguage?: string }) {
  const searchParams = useSearchParams();
  const queryWord = searchParams.get("word") ?? "";
  const [search, setSearch] = useState(initialWord ?? queryWord);
  const [selectedSlug, setSelectedSlug] = useState(initialWord ?? queryWord);
  const [history, setHistory] = useState<string[]>(["development", "context", "research"]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useActionFeedback();
  const resultsQuery = useQuery({ queryKey: ["dictionary-search", initialLanguage, search], queryFn: () => api.search(search, initialLanguage), enabled: search.trim().length > 1 });
  const entryQuery = useQuery({ queryKey: ["dictionary-entry", initialLanguage, selectedSlug], queryFn: () => api.entry(initialLanguage, selectedSlug), enabled: Boolean(selectedSlug) });
  const vocabularyQuery = useQuery({ queryKey: ["vocabulary"], queryFn: api.vocabulary });
  const saveMutation = useMutation({
    mutationFn: (entry: DictionaryEntry) => api.saveVocabulary(entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      notify("Word saved to your vocabulary.");
    },
    onError: (error) => notify(error.message, "info"),
  });
  const savedIds = useMemo(() => new Set(vocabularyQuery.data?.map((item) => item.entry_id) ?? []), [vocabularyQuery.data]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const selectWord = (word: string) => {
    setSelectedSlug(word);
    setSearch(word);
    setHistory((items) => [word, ...items.filter((item) => item !== word)].slice(0, 5));
  };

  const speak = (value: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(value));
      return;
    }
    notify("Speech playback is not available in this browser.", "info");
  };

  const copyWord = async (value: string) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const helper = document.createElement("textarea");
        helper.value = value;
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      }
      notify(`Copied “${value}” to your clipboard.`);
    } catch {
      notify("Clipboard access was blocked by the browser.", "info");
    }
  };

  return (
    <div className="dictionary-page page-enter">
      <div className="dictionary-topbar"><Link href="/" className="brand-lockup"><span className="brand-mark"><Sparkles size={17} /></span><span><strong>Lingua</strong><small>ATLAS</small></span></Link><div className="dictionary-top-links"><Link href="/app/dashboard">Workspace</Link><Link href="/app/ai-tutor">AI Tutor</Link><button type="button" className="icon-button" aria-label="Close dictionary" onClick={() => router.push("/")}><X size={18} /></button></div></div>
      <div className="dictionary-intro"><div><p className="eyebrow eyebrow-blue">Academic dictionary</p><h1>Find the word<br /><em>behind the idea.</em></h1><p>Meaning, usage, and context — in one calm place.</p></div><div className="dictionary-intro-note"><Lightbulb size={17} /><span>Search a word, phrase, or idiom<br /><small>Try <button type="button" onClick={() => selectWord("development")}>development</button></small></span></div></div>

      <div className="dictionary-search-wrap"><div className="dictionary-search"><Search size={20} /><input ref={searchInputRef} value={search} onChange={(event) => { setSearch(event.target.value); if (!event.target.value) setSelectedSlug(""); }} onKeyDown={(event) => { if (event.key === "Enter" && search.trim()) selectWord(search.trim().toLowerCase()); }} placeholder="Search words, phrases or examples…" aria-label="Search dictionary" autoFocus={!initialWord} /><kbd><Keyboard size={13} /> ⌘ K</kbd>{search ? <button type="button" className="clear-search" onClick={() => { setSearch(""); setSelectedSlug(""); }} aria-label="Clear search"><X size={16} /></button> : null}</div><p className="search-hint">Press <strong>Enter</strong> to open a word · <span>English → Vietnamese</span></p></div>

      <div className="dictionary-body">
        <aside className="dictionary-results-panel">
          <div className="results-heading"><span>{search ? "Search results" : "Recent words"}</span>{resultsQuery.isFetching ? <LoaderCircle size={15} className="spin" /> : <span className="results-count">{search ? resultsQuery.data?.length ?? 0 : history.length}</span>}</div>
          {search && resultsQuery.isError ? <div className="inline-error">Could not search right now. <button type="button" onClick={() => resultsQuery.refetch()}>Try again</button></div> : null}
          <div className="result-list">{(search ? resultsQuery.data ?? [] : history.map((word) => ({ word, slug: word, id: word, language_code: "en", ipa: "", part_of_speech: "", cefr: "", frequency: 0, definition: "", translation: "" }))).map((item) => <ResultRow key={item.id} item={item} active={selectedSlug === item.slug} onSelect={selectWord} />)}</div>
          {!search ? <div className="popular-block"><p className="eyebrow">Popular in academic English</p>{popularWords.map((word) => <button type="button" className="popular-word" key={word} onClick={() => selectWord(word)}><span>{word}</span><ArrowRight size={14} /></button>)}</div> : null}
          {search && !resultsQuery.isFetching && !resultsQuery.data?.length && !resultsQuery.isError ? <EmptyState icon={Search} title="No close match yet" description="Try a simpler spelling or search for a related phrase." /> : null}
        </aside>

        <main className="dictionary-detail-panel">
          {entryQuery.isLoading ? <DetailSkeleton /> : null}
          {entryQuery.isError ? <EmptyState icon={Search} title="Choose a word to explore" description="Search the dictionary and open a result for definitions, examples, and pronunciation." action={<button type="button" className="button button-secondary" onClick={() => entryQuery.refetch()}>Try again</button>} /> : null}
          {entryQuery.data ? <EntryDetail entry={entryQuery.data} saved={savedIds.has(entryQuery.data.id)} saving={saveMutation.isPending} onSave={() => saveMutation.mutate(entryQuery.data!)} onSpeak={speak} onCopy={copyWord} onMore={() => notify("Use Save, Copy, or Ask AI to continue with this word.", "info")} /> : null}
          {!selectedSlug && !entryQuery.isError ? <div className="dictionary-welcome"><div className="welcome-orb"><Search size={28} /></div><p className="eyebrow eyebrow-blue">A better lookup</p><h2>Words become useful<br /><em>in context.</em></h2><p>Start with a search on the left. We will bring together meaning, translation, examples, and the small details that make a word stick.</p><div className="welcome-trail"><span><Check size={13} /> Clear definitions</span><span><Check size={13} /> Natural examples</span><span><Check size={13} /> Academic nuance</span></div></div> : null}
        </main>
      </div>
    </div>
  );
}

function ResultRow({ item, active, onSelect }: { item: SearchResult; active: boolean; onSelect: (word: string) => void }) {
  return <button type="button" className={cn("result-row", active && "result-row-active")} onClick={() => onSelect(item.slug)}><span className="result-word"><strong>{item.word}</strong><small>{item.ipa || "Explore this word"}</small></span><span className="result-meta"><Badge tone={item.cefr === "B2" ? "purple" : "blue"}>{item.cefr || "word"}</Badge>{item.part_of_speech ? <small>{item.part_of_speech}</small> : null}</span><ChevronRight size={15} /></button>;
}

function EntryDetail({ entry, saved, saving, onSave, onSpeak, onCopy, onMore }: { entry: DictionaryEntry; saved: boolean; saving: boolean; onSave: () => void; onSpeak: (word: string) => void; onCopy: (word: string) => void; onMore: () => void }) {
  return <div className="entry-detail page-enter"><div className="entry-breadcrumb"><span>English</span><ChevronRight size={13} /><span>Academic vocabulary</span><ChevronRight size={13} /><strong>{entry.word}</strong></div><div className="entry-header"><div><div className="entry-title-row"><h2>{entry.word}</h2><button type="button" className="audio-button" onClick={() => onSpeak(entry.word)} aria-label={`Listen to ${entry.word}`}><Volume2 size={18} /></button></div><div className="entry-pronunciation"><span>{entry.ipa}</span><span className="pronunciation-divider" />{entry.pronunciations.map((item) => <button type="button" key={item.accent} onClick={() => onSpeak(entry.word)}>{item.accent} <Volume2 size={12} /></button>)}</div></div><button type="button" className={cn("button", saved ? "button-saved" : "button-secondary")} onClick={onSave} disabled={saving || saved}>{saved ? <Check size={16} /> : <Bookmark size={16} />}{saving ? "Saving…" : saved ? t("common.saved") : t("common.save")}</button></div><div className="entry-tags"><Badge tone="blue">{entry.part_of_speech}</Badge><Badge tone="green">CEFR {entry.cefr}</Badge><Badge tone="orange">{entry.academic_level}</Badge><span className="entry-domain">{entry.domain} · {entry.formality}</span></div><div className="entry-content-grid"><div className="entry-main"><section className="entry-section"><SectionHeading eyebrow="Definition" title="Meaning & usage" action={<button type="button" className="more-button" onClick={onMore} aria-label="More word actions"><MoreHorizontal size={18} /></button>} />{entry.meanings.map((meaning) => <div className="meaning-block" key={meaning.id}><div className="meaning-number">{meaning.order}</div><div className="meaning-content"><p className="meaning-definition">{meaning.definition}</p>{meaning.translations.length ? <div className="translation-line"><span>Vietnamese</span><strong>{meaning.translations[0]}</strong>{meaning.translations[1] ? <><span>Chinese</span><strong>{meaning.translations[1]}</strong></> : null}</div> : null}<div className="examples"><p className="example-label">Examples</p>{meaning.examples.map((example) => <div className="example-row" key={example.id}><p>{example.sentence}</p><button type="button" onClick={() => onSpeak(example.sentence)} aria-label="Listen to example"><Volume2 size={14} /></button><small>{example.translation}</small></div>)}</div></div></div>)}</section><section className="entry-section frequency-section"><SectionHeading eyebrow="Frequency" title="Where you will meet it" /><div className="frequency-row"><span>General English</span><ProgressBar value={entry.frequency} tone="primary" /><strong>{entry.frequency}%</strong></div><div className="frequency-row"><span>Academic English</span><ProgressBar value={Math.max(entry.frequency - 12, 12)} tone="purple" /><strong>{Math.max(entry.frequency - 12, 12)}%</strong></div><div className="frequency-row"><span>Written English</span><ProgressBar value={Math.max(entry.frequency - 4, 18)} tone="green" /><strong>{Math.max(entry.frequency - 4, 18)}%</strong></div></section></div><aside className="entry-side"><div className="side-card"><div className="side-card-icon"><Sparkles size={17} /></div><p className="eyebrow eyebrow-purple">Ask AI about this word</p><h3>Make it memorable.</h3><p>Compare synonyms, create an exercise, or see how it works in an academic sentence.</p><Link href={`/app/ai-tutor?word=${entry.word}`} className="button button-dark">Ask AI <MessageCircle size={15} /></Link></div><div className="side-card side-card-muted"><p className="eyebrow">Word profile</p><div className="profile-stat"><span>Lemma</span><strong>{entry.lemma}</strong></div><div className="profile-stat"><span>Register</span><strong>{entry.formality}</strong></div><div className="profile-stat"><span>Domain</span><strong>{entry.domain}</strong></div><button type="button" className="side-action" onClick={() => onCopy(entry.word)}><Copy size={14} /> Copy word</button></div></aside></div></div>;
}

function DetailSkeleton() {
  return <div className="detail-skeleton"><div className="skeleton skeleton-breadcrumb" /><div className="skeleton skeleton-word" /><div className="skeleton skeleton-tags" /><div className="skeleton skeleton-definition" /><div className="skeleton skeleton-definition short" /></div>;
}
