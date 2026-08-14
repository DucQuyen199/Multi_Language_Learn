"use client";

import { ChevronDown, CircleHelp, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { cn } from "@/components/ui";

const faqs = [
  { question: "How do I save a word?", answer: "Open a dictionary entry and choose Save. It will appear in Vocabulary and the Flashcards review queue." },
  { question: "How does review scheduling work?", answer: "Choose Again, Hard, Good, or Easy after revealing a card. The Go backend stores mastery, confidence, and the next review date." },
  { question: "Why can’t I hear pronunciation?", answer: "Pronunciation uses your browser’s speech synthesis. Check the browser audio permission or try a current Chrome, Edge, Safari, or Firefox release." },
  { question: "Where are my preferences stored?", answer: "The current demo stores preferences in this browser. Account synchronization is the next production integration boundary." },
];

export function HelpView() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(0);
  const { notify } = useActionFeedback();
  const visible = useMemo(() => faqs.filter((faq) => `${faq.question} ${faq.answer}`.toLowerCase().includes(search.toLowerCase())), [search]);
  return <div className="workspace-page page-enter help-page"><div className="page-header"><div><p className="eyebrow eyebrow-blue">Help center</p><h1>Find your next <em>clear step.</em></h1><p className="page-lede">Short answers for the dictionary, review rhythm, speech tools, and your learning space.</p></div><button type="button" className="button button-primary" onClick={() => notify("Support request captured. Connect your support inbox to send it externally.", "info")}><Sparkles size={16} /> Contact support</button></div><div className="help-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search help topics…" aria-label="Search help topics" /></div><section className="help-card"><div className="help-card-heading"><div><p className="eyebrow">Common questions</p><h2>What would you like to know?</h2></div><CircleHelp size={28} /></div>{visible.length ? visible.map((faq, index) => <div className="faq-item" key={faq.question}><button type="button" className={cn("faq-question", open === index && "faq-question-open")} onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><strong>{faq.question}</strong><ChevronDown size={16} /></button>{open === index ? <p className="faq-answer">{faq.answer}</p> : null}</div>) : <p className="help-empty">No help topic matched that search.</p>}</section></div>;
}
