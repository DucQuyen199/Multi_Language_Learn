"use client";

import {
  ArrowRight,
  BookOpen,
  Check,
  CirclePause,
  Headphones,
  Mic2,
  Pause,
  Play,
  Sparkles,
  Timer,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { Badge, ProgressBar, SectionHeading, cn } from "@/components/ui";

export type LearningModule = "listening" | "speaking" | "reading" | "writing" | "ai-tutor" | "progress" | "notebook" | "settings";

const moduleCopy: Record<LearningModule, { eyebrow: string; title: string; emphasis: string; description: string; icon: typeof Headphones; accent: string; level: string; minutes: string; primary: string }> = {
  listening: { eyebrow: "Four skills · 01", title: "Tune in to", emphasis: "meaning.", description: "Train your ear with short, layered listening tasks that move from sound to understanding.", icon: Headphones, accent: "blue", level: "B1", minutes: "8 min", primary: "Start listening" },
  speaking: { eyebrow: "Four skills · 02", title: "Find your", emphasis: "voice.", description: "Practice pronunciation, rhythm, and natural responses without the pressure of a perfect first try.", icon: Mic2, accent: "orange", level: "B1", minutes: "6 min", primary: "Open speaking lab" },
  reading: { eyebrow: "Four skills · 03", title: "Read beyond", emphasis: "the lines.", description: "Build speed and comprehension with passages that make new vocabulary feel alive.", icon: BookOpen, accent: "green", level: "B1", minutes: "12 min", primary: "Open reading room" },
  writing: { eyebrow: "Four skills · 04", title: "Make ideas", emphasis: "clear.", description: "Shape sentences, paragraphs, and academic arguments with feedback you can learn from.", icon: WandSparkles, accent: "purple", level: "B1", minutes: "15 min", primary: "Open writing studio" },
  "ai-tutor": { eyebrow: "A thoughtful companion", title: "Ask better", emphasis: "questions.", description: "Bring a sentence, a confusing word, or a learning goal. Your tutor will help you find the next step.", icon: Sparkles, accent: "purple", level: "Personalized", minutes: "Any time", primary: "Start a conversation" },
  progress: { eyebrow: "Your learning signal", title: "See the shape of", emphasis: "your progress.", description: "A calm view of your habits, strengths, and the next small decision worth making.", icon: Timer, accent: "blue", level: "This month", minutes: "42 min today", primary: "Review insights" },
  notebook: { eyebrow: "Your thinking space", title: "Keep the ideas", emphasis: "worth returning to.", description: "Collect words, sentences, grammar notes, and the explanations that made something click.", icon: BookOpen, accent: "green", level: "Personal", minutes: "0 notes", primary: "Add a note" },
  settings: { eyebrow: "Make it yours", title: "A learning space that", emphasis: "fits you.", description: "Tune language pairs, daily goals, accent preferences, and the way Lingua Atlas supports you.", icon: WandSparkles, accent: "blue", level: "Profile", minutes: "English → Vietnamese", primary: "Save preferences" },
};

export function FeatureView({ module }: { module: LearningModule }) {
  const copy = moduleCopy[module];
  const Icon = copy.icon;
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [writing, setWriting] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([{ from: "tutor", text: "Bring me one sentence or one question. We will make it clearer together." }]);
  const { notify } = useActionFeedback();

  const sendMessage = () => {
    if (!chatInput.trim()) {
      notify("Write a question before sending it.", "info");
      return;
    }
    const message = chatInput.trim();
    setMessages((items) => [...items, { from: "you", text: message }, { from: "tutor", text: "That is a useful question. In local practice mode, I have captured it; connect an AI provider to receive a personalized explanation." }]);
    setChatInput("");
  };

  const primaryAction = () => {
    if (module === "listening") setPlaying(true);
    if (module === "writing") document.querySelector<HTMLTextAreaElement>(".writing-editor textarea")?.focus();
    if (module === "ai-tutor") document.querySelector<HTMLInputElement>(".chat-compose input")?.focus();
    if (module === "notebook") document.querySelector<HTMLButtonElement>(".note-add")?.click();
    if (module === "settings") document.querySelector<HTMLDivElement>(".settings-lab")?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (module === "speaking") document.querySelector<HTMLButtonElement>(".record-button")?.focus();
    notify(module === "settings" ? "Update the fields below, then save your preferences." : `${copy.primary} is ready.`, "info");
  };

  return <div className="workspace-page page-enter"><div className="page-header"><div><p className={cn("eyebrow", `eyebrow-${copy.accent}`)}>{copy.eyebrow}</p><h1>{copy.title} <em>{copy.emphasis}</em></h1><p className="page-lede">{copy.description}</p></div><button type="button" onClick={primaryAction} className={cn("button", copy.accent === "purple" ? "button-dark" : "button-primary")}><Icon size={16} /> {copy.primary}</button></div><div className={cn("module-hero", `module-${copy.accent}`)}><div className="module-hero-copy"><div className="module-icon"><Icon size={25} /></div><span className="module-kicker">Today’s suggested practice</span><h2>{module === "listening" ? "The pause between words" : module === "speaking" ? "Sound more natural" : module === "reading" ? "Read for the argument" : module === "writing" ? "A paragraph with purpose" : module === "ai-tutor" ? "One idea, explored together" : "One small session"}</h2><p>{module === "listening" ? "Notice how a speaker uses stress to signal what matters." : module === "speaking" ? "Shadow a short phrase, then compare rhythm and stress." : module === "reading" ? "Follow a B1 passage from claim to evidence." : module === "writing" ? "Turn a rough idea into a clear academic paragraph." : "A focused space for the next thing you want to understand."}</p><div className="module-meta"><Badge tone={copy.accent === "orange" ? "orange" : copy.accent === "green" ? "green" : copy.accent === "purple" ? "purple" : "blue"}>{copy.level}</Badge><span>{copy.minutes}</span><span>·</span><span>Guided</span></div></div><div className="module-hero-art"><div className="art-orbit art-orbit-one" /><div className="art-orbit art-orbit-two" /><Icon size={54} strokeWidth={1.2} /><span className="art-caption">{module === "ai-tutor" ? "Ready to think" : "Ready when you are"}</span></div></div><div className="module-content-grid"><main>{module === "listening" ? <ListeningLab playing={playing} setPlaying={setPlaying} /> : null}{module === "speaking" ? <SpeakingLab recording={recording} setRecording={setRecording} /> : null}{module === "reading" ? <ReadingLab /> : null}{module === "writing" ? <WritingLab value={writing} setValue={setWriting} /> : null}{module === "ai-tutor" ? <TutorLab messages={messages} input={chatInput} setInput={setChatInput} send={sendMessage} /> : null}{module === "progress" ? <ProgressLab /> : null}{module === "notebook" ? <NotebookLab /> : null}{module === "settings" ? <SettingsLab /> : null}</main><aside className="module-side"><section className="side-card"><p className="eyebrow">Your next step</p><h3>{module === "progress" ? "Keep the trend gentle." : "Consistency beats intensity."}</h3><p>{module === "speaking" ? "A 60-second recording is enough to give your mouth a new pattern." : "Return to this space tomorrow and let the habit do some of the work."}</p><ProgressBar value={module === "progress" ? 68 : 32} tone={copy.accent === "purple" ? "purple" : copy.accent === "green" ? "green" : "primary"} /><Link href="/app/dashboard" className="side-action">Back to your path <ArrowRight size={14} /></Link></section><section className="side-card side-card-muted"><p className="eyebrow">Quick links</p><Link href="/dictionary" className="quick-link"><span><BookOpen size={15} /> Dictionary</span><ArrowRight size={14} /></Link><Link href="/app/flashcards" className="quick-link"><span><Sparkles size={15} /> Smart review</span><ArrowRight size={14} /></Link><Link href="/app/courses" className="quick-link"><span><WandSparkles size={15} /> Course path</span><ArrowRight size={14} /></Link></section></aside></div></div>;
}

function ListeningLab({ playing, setPlaying }: { playing: boolean; setPlaying: (value: boolean) => void }) {
  const [speed, setSpeed] = useState(0.75);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const speechStarted = useRef(false);
  const { notify } = useActionFeedback();
  useEffect(() => {
    if (playing && !speechStarted.current && "speechSynthesis" in window) {
      speechStarted.current = true;
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Notice how a speaker uses stress to signal what matters."));
    }
    if (!playing) {
      speechStarted.current = false;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }
  }, [playing]);
  const choose = (value: string) => { setAnswer(value); notify(value === "A complex idea" ? "Correct — the speaker is clarifying a complex idea." : "Not quite. Listen again and notice the speaker’s emphasis.", value === "A complex idea" ? "success" : "info"); };
  const play = () => {
    setPlaying(!playing);
  };
  return <section className="lab-card"><SectionHeading eyebrow="Listen & notice" title="The pause between words" description="Listen twice. The transcript stays closed until you are ready." action={<Badge tone="blue">B1 · 8 min</Badge>} /><div className="audio-lab"><button type="button" className="play-circle" onClick={play} aria-label={playing ? "Pause audio" : "Play audio"}>{playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}</button><div className="waveform" aria-hidden="true">{Array.from({ length: 34 }).map((_, index) => <span key={index} style={{ height: `${22 + ((index * 19) % 48)}%` }} className={playing && index < 16 ? "wave-active" : ""} />)}</div><span className="audio-time">0:42</span></div><div className="audio-controls"><span>0:00 <i /> 0:42</span><button type="button" onClick={() => setSpeed((value) => value === 1.25 ? 0.75 : value + 0.25)}>{speed.toFixed(2)}×</button><button type="button" onClick={() => setTranscriptOpen((value) => !value)}>{transcriptOpen ? "Hide transcript" : "Show transcript"}</button></div>{transcriptOpen ? <div className="transcript-panel">“A short pause can make a complex idea easier to follow.”</div> : null}<div className="exercise-prompt"><span className="prompt-number">01</span><div><p className="eyebrow">Listen and choose</p><h3>What does the speaker want to make clearer?</h3><div className="option-grid">{["A new schedule", "A complex idea", "A travel plan", "A personal story"].map((option) => <button type="button" className={answer === option ? "option-selected" : ""} key={option} onClick={() => choose(option)}>{option}</button>)}</div></div></div></section>;
}

function SpeakingLab({ recording, setRecording }: { recording: boolean; setRecording: (value: boolean) => void }) {
  const streamRef = useRef<MediaStream | null>(null);
  const { notify } = useActionFeedback();
  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);
  const toggleRecording = async () => {
    if (recording) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setRecording(false);
      notify("Recording stopped. Your practice take is ready to review.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      notify("This browser does not support microphone recording.", "info");
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecording(true);
      notify("Microphone connected. Speak the model phrase, then stop recording.");
    } catch {
      notify("Microphone permission was denied or is unavailable.", "info");
    }
  };
  const hearModel = () => { if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance("I really like this university.")); };
  return <section className="lab-card"><SectionHeading eyebrow="Pronunciation lab" title="Sound more natural" description="Shadow the model phrase, then listen back to your own rhythm." action={<Badge tone="orange">Speaking · B1</Badge>} /><div className="pronunciation-target"><span className="target-label">Model phrase</span><strong>I really like this university.</strong><span className="target-ipa">/aɪ ˈrɪəli laɪk ðɪs ˌjuːnɪˈvɜːrsəti/</span><button type="button" className="text-link" onClick={hearModel}><Headphones size={14} /> Hear model</button></div><div className={cn("recording-zone", recording && "recording-zone-active")}><button type="button" className="record-button" onClick={toggleRecording} aria-label={recording ? "Stop recording" : "Start recording"}>{recording ? <CirclePause size={22} /> : <Mic2 size={22} />}</button><div><strong>{recording ? "Recording…" : "Press to record"}</strong><span>{recording ? "Take your time. Stop when you finish." : "Microphone permission is requested only when you begin."}</span></div><span className="recording-time">{recording ? "00:08" : "00:00"}</span></div><div className="score-preview"><div><span className="eyebrow">Latest score</span><strong>87 <small>/100</small></strong></div><div className="score-bars"><span><i style={{ width: "91%" }} />Accuracy <b>91</b></span><span><i style={{ width: "76%" }} />Intonation <b>76</b></span></div></div></section>;
}

function ReadingLab() {
  const [answer, setAnswer] = useState("");
  const router = useRouter();
  const { notify } = useActionFeedback();
  const lookup = (word: string) => { notify(`Opening “${word}” in the dictionary.`, "info"); router.push(`/dictionary?word=${encodeURIComponent(word)}`); };
  const choose = (value: string) => { setAnswer(value); notify(value === "Learning becoming part of daily life" ? "Correct — the passage connects learning with everyday life." : "Try again. Look for the idea repeated across both paragraphs.", value === "Learning becoming part of daily life" ? "success" : "info"); };
  return <section className="lab-card reading-lab"><SectionHeading eyebrow="Read & understand" title="A city that learns" description="Read once for the main idea. Then click any word you want to keep." action={<Badge tone="green">B1 · 12 min</Badge>} /><div className="reading-meta"><span>04:12 read time</span><span>168 words</span><span>98 wpm</span></div><article className="reading-passage"><p>When a city treats its public spaces as classrooms, learning becomes part of the everyday rhythm. A library is no longer only a quiet room; it can be a place where neighbors exchange skills, languages, and questions.</p><p>This approach does not replace formal education. Instead, it creates more opportunities to practice what people already know and to notice what they want to understand next.</p><div className="passage-note"><Sparkles size={15} /><span>Try clicking <button type="button" onClick={() => lookup("exchange")}>exchange</button> or <button type="button" onClick={() => lookup("opportunities")}>opportunities</button> for a quick dictionary lookup.</span></div></article><div className="reading-question"><span className="prompt-number">01</span><div><p className="eyebrow">Main idea</p><h3>What is the passage mainly about?</h3><div className="option-grid">{["Libraries replacing schools", "Learning becoming part of daily life", "Why cities need more buildings"].map((option) => <button type="button" className={answer === option ? "option-selected" : ""} key={option} onClick={() => choose(option)}>{option}</button>)}</div></div></div></section>;
}

function WritingLab({ value, setValue }: { value: string; setValue: (value: string) => void }) {
  const [analysis, setAnalysis] = useState("");
  const { notify } = useActionFeedback();
  const analyze = () => { if (!value.trim()) return; setAnalysis("Your claim is clear. Add one concrete example to make the paragraph easier to remember."); notify("Writing analyzed. Read the feedback below your draft."); };
  return <section className="lab-card writing-lab"><SectionHeading eyebrow="Write & refine" title="A paragraph with purpose" description="Write three or four sentences. The connected AI reviewer will explain the why behind each suggestion." action={<Badge tone="purple">Academic · B1</Badge>} /><div className="writing-prompt"><p className="eyebrow">Prompt</p><h3>How can regular practice change the way we learn?</h3><span>Use one clear claim and one example.</span></div><label className="writing-editor"><span className="editor-toolbar"><strong>Draft</strong><span>Words {value.trim() ? value.trim().split(/\s+/).length : 0} / 120</span></span><textarea value={value} onChange={(event) => { setValue(event.target.value); setAnalysis(""); }} placeholder="Start with your main idea…" rows={8} /></label><div className="writing-footer"><span><Check size={14} /> Autosave on</span><button type="button" className="button button-dark" disabled={!value.trim()} onClick={analyze}>Analyze writing <Sparkles size={15} /></button></div>{analysis ? <div className="analysis-result"><Check size={15} /> {analysis}</div> : null}</section>;
}

function TutorLab({ messages, input, setInput, send }: { messages: { from: string; text: string }[]; input: string; setInput: (value: string) => void; send: () => void }) {
  return <section className="lab-card tutor-lab"><SectionHeading eyebrow="AI language tutor" title="A thoughtful conversation" description="Provider abstraction is ready; connect OpenAI, Gemini, Claude, or Ollama through the backend environment." action={<Badge tone="purple">Local practice</Badge>} /><div className="chat-window">{messages.map((message, index) => <div className={cn("chat-message", message.from === "you" && "chat-message-you")} key={`${message.from}-${index}`}><span className="chat-avatar">{message.from === "you" ? "Q" : <Sparkles size={13} />}</span><p>{message.text}</p></div>)}</div><div className="chat-compose"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Ask about a word, sentence, or grammar point…" aria-label="Message AI tutor" /><button type="button" className="button button-dark" onClick={send} aria-label="Send message"><ArrowRight size={16} /></button></div></section>;
}

function ProgressLab() {
  const [range, setRange] = useState("Last 30 days");
  const stats = [{ label: "Study time", value: "42 min", delta: "+14%", tone: "blue" }, { label: "Words mastered", value: "1,284", delta: "+86", tone: "green" }, { label: "Reading speed", value: "98 wpm", delta: "+9%", tone: "orange" }];
  return <section className="lab-card"><SectionHeading eyebrow="Progress signal" title="Small wins, visible" description="Your strongest learning days are the ones you can return to." action={<button type="button" className="range-button" onClick={() => setRange((value) => value === "Last 30 days" ? "Last 7 days" : "Last 30 days")}>{range}</button>} /><div className="insight-stat-grid">{stats.map((stat) => <div className={cn("insight-stat", `insight-${stat.tone}`)} key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.delta} from last period</small></div>)}</div><div className="heatmap-block"><div className="heatmap-heading"><div><p className="eyebrow">Learning heatmap</p><h3>Consistency has a texture.</h3></div><span>Less <i /><i /><i /><i /> More</span></div><div className="heatmap">{Array.from({ length: 84 }).map((_, index) => <span key={index} className={`heat-${(index * 7) % 5}`} />)}</div></div></section>;
}

function NotebookLab() {
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const { notify } = useActionFeedback();
  const saveNote = () => { if (!note.trim()) { notify("Write a note before saving.", "info"); return; } setNotes((items) => [note.trim(), ...items]); setNote(""); setAdding(false); notify("Note saved to your notebook."); };
  return <section className="lab-card"><SectionHeading eyebrow="Notebook" title="Ideas worth returning to" description="Your saved explanations and sentences can become tomorrow’s warm-up." action={<button type="button" className="button button-secondary" onClick={() => setAdding(true)}>New note</button>} />{adding ? <div className="note-composer"><input autoFocus value={note} onChange={(event) => setNote(event.target.value)} onKeyDown={(event) => event.key === "Enter" && saveNote()} placeholder="Capture the idea…" aria-label="New note" /><button type="button" className="button button-primary" onClick={saveNote}>Save note</button><button type="button" className="button button-secondary" onClick={() => { setAdding(false); setNote(""); }}>Cancel</button></div> : null}<div className="note-grid"><article><span className="note-type">WORD</span><h3>development</h3><p>Growth or improvement over time. Useful in academic writing when talking about systems, people, or ideas.</p><span className="note-date">Saved today</span></article><article><span className="note-type note-type-purple">GRAMMAR</span><h3>Present perfect</h3><p>Connects a past action to the present: have or has + past participle.</p><span className="note-date">Saved yesterday</span></article>{notes.map((item, index) => <article key={`${item}-${index}`}><span className="note-type note-type-green">NOTE</span><h3>{item}</h3><p>Saved from your notebook.</p><span className="note-date">Saved just now</span></article>)}<button type="button" className="note-add" onClick={() => setAdding(true)}><Sparkles size={18} /><strong>Make a note from any lesson.</strong><span>Save the moment something clicks.</span></button></div></section>;
}

function SettingsLab() {
  const [nativeLanguage, setNativeLanguage] = useState("vi");
  const [dailyGoal, setDailyGoal] = useState("20");
  const [accent, setAccent] = useState("us");
  const { notify } = useActionFeedback();
  const save = () => { try { localStorage.setItem("lingua-atlas-preferences", JSON.stringify({ nativeLanguage, dailyGoal, accent })); notify("Preferences saved on this device."); } catch { notify("This browser blocked local preference storage.", "info"); } };
  return <section className="lab-card settings-lab"><SectionHeading eyebrow="Preferences" title="Shape your learning rhythm" description="These settings are stored per language profile, so each path can feel like its own." action={<Badge tone="blue">English profile</Badge>} /><div className="settings-list"><label><span><strong>Native language</strong><small>Used for translations and explanations</small></span><select value={nativeLanguage} onChange={(event) => setNativeLanguage(event.target.value)}><option value="vi">Tiếng Việt</option><option value="en">English</option><option value="zh">中文</option></select></label><label><span><strong>Daily goal</strong><small>How much time feels realistic?</small></span><select value={dailyGoal} onChange={(event) => setDailyGoal(event.target.value)}><option value="5">5 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></label><label><span><strong>Preferred accent</strong><small>For pronunciation and listening</small></span><select value={accent} onChange={(event) => setAccent(event.target.value)}><option value="us">US English</option><option value="uk">UK English</option></select></label></div><div className="settings-footer"><span>Saved locally · ready for account sync</span><button type="button" className="button button-primary" onClick={save}>Save preferences <Check size={15} /></button></div></section>;
}
