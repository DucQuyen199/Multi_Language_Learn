"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bookmark, Check, CircleHelp, RotateCcw, Sparkles, Volume2, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { api } from "@/lib/api";
import { Badge, EmptyState, ProgressBar, SectionHeading, Skeleton, cn } from "@/components/ui";

const ratings = [
  { label: "Again", detail: "< 1 min", tone: "again" },
  { label: "Hard", detail: "6 days", tone: "hard" },
  { label: "Good", detail: "10 days", tone: "good" },
  { label: "Easy", detail: "21 days", tone: "easy" },
];

export function FlashcardView() {
  const query = useQuery({ queryKey: ["vocabulary"], queryFn: api.vocabulary });
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useActionFeedback();

  if (query.isLoading) return <div className="workspace-page"><Skeleton className="skeleton-title" /><Skeleton className="skeleton-flashcard" /></div>;
  if (query.isError) return <div className="state-page"><EmptyState icon={RotateCcw} title="Review is offline" description={query.error.message}><button type="button" className="button button-primary" onClick={() => query.refetch()}>Try again</button></EmptyState></div>;

  const cards = query.data ?? [];
  if (!cards.length) return <div className="state-page"><EmptyState icon={Bookmark} title="Your deck is waiting" description="Save words from the dictionary and they will become part of your review rhythm." action={<Link href="/dictionary" className="button button-primary">Open dictionary</Link>} /></div>;

  const card = cards[index % cards.length];
  const progress = Math.round((completed.length / cards.length) * 100);

  const rate = async (rating: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.review(card.id, rating.toLowerCase());
      notify(`${rating} saved. Next review scheduled.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Review could not be saved.", "info");
    } finally {
      setSubmitting(false);
    }
    setCompleted((items) => items.includes(card.id) ? items : [...items, card.id]);
    setRevealed(false);
    setIndex((value) => (value + 1) % cards.length);
  };

  return (
    <div className="workspace-page flashcards-page page-enter">
      <div className="page-header"><div><p className="eyebrow eyebrow-purple">Smart review · FSRS ready</p><h1>Remember with <em>less effort.</em></h1><p className="page-lede">A focused deck of {cards.length} saved words, tuned to what you need next.</p></div><div className="session-progress"><span>{completed.length} / {cards.length} reviewed</span><ProgressBar value={progress} tone="purple" /></div></div>
      <div className="flashcard-layout">
        <main>
          <div className="flashcard-stage">
            <div className="flashcard-topline"><span><Zap size={15} fill="currentColor" /> Focus deck</span><span>Card {index + 1} of {cards.length}</span></div>
            <div className={cn("flashcard", revealed && "flashcard-revealed")} role="button" tabIndex={0} onClick={() => setRevealed((value) => !value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setRevealed((value) => !value); } }} aria-label={revealed ? "Hide flashcard answer" : "Reveal flashcard answer"}>
              {!revealed ? <div className="flashcard-front"><span className="flashcard-label">Word</span><strong>{card.word}</strong><span className="flashcard-ipa">{card.ipa}</span><span className="flashcard-hint">Tap to reveal meaning <ArrowRight size={14} /></span></div> : <div className="flashcard-back"><div className="back-heading"><Badge tone="blue">{card.part_of_speech}</Badge><span className="flashcard-ipa">{card.ipa}</span></div><strong>{card.translation || "Meaning in context"}</strong><p>Review the word in the dictionary for examples and related forms.</p><div className="back-example"><span>Example</span><em>“A clear idea becomes useful when you can explain it simply.”</em></div><button type="button" className="audio-button" onClick={(event) => { event.stopPropagation(); if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(card.word)); else notify("Speech playback is not available in this browser.", "info"); }} aria-label={`Listen to ${card.word}`}><Volume2 size={17} /></button></div>}
            </div>
            <div className="flashcard-actions">{revealed ? ratings.map((rating) => <button type="button" disabled={submitting} className={cn("rating-button", `rating-${rating.tone}`)} key={rating.label} onClick={() => rate(rating.label)}><strong>{submitting ? "Saving…" : rating.label}</strong><small>{rating.detail}</small></button>) : <button type="button" className="button button-secondary reveal-button" onClick={() => setRevealed(true)}><CircleHelp size={16} /> Reveal answer</button>}</div>
          </div>
        </main>
        <aside className="flashcard-side">
          <article className="side-card"><div className="side-card-icon"><Sparkles size={17} /></div><p className="eyebrow eyebrow-purple">The learning engine</p><h3>Recall first. Then check.</h3><p>Every answer updates mastery, confidence, difficulty, and your next review window.</p><div className="engine-line"><span>Current mastery</span><strong>{Math.round(card.mastery * 100)}%</strong></div><ProgressBar value={card.mastery * 100} tone="purple" /></article>
          <section className="session-list"><SectionHeading eyebrow="In this session" title="Your queue" /><div>{cards.slice(0, 5).map((item, itemIndex) => <button type="button" key={item.id} className={cn("queue-item", itemIndex === index && "queue-item-active")} onClick={() => { setIndex(itemIndex); setRevealed(false); }}><span className={cn("queue-status", completed.includes(item.id) && "queue-status-complete")}>{completed.includes(item.id) ? <Check size={12} /> : itemIndex + 1}</span><span><strong>{item.word}</strong><small>{item.translation || "Dictionary meaning"}</small></span><ArrowRight size={14} /></button>)}</div></section>
        </aside>
      </div>
    </div>
  );
}
