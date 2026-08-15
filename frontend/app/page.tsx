import { ArrowRight, BookOpen, BrainCircuit, Check, Headphones, Play, Target } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const features = [
  { icon: BookOpen, number: "01", title: "Academic dictionary", copy: "Find the meaning, register, examples, and nuance behind every useful word." },
  { icon: Headphones, number: "02", title: "Four skills, together", copy: "Move from listening to speaking, reading, and writing without losing the thread." },
  { icon: BrainCircuit, number: "03", title: "A tutor that remembers", copy: "Get clear explanations shaped by your level, goals, and learning history." },
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Logo size="md" href="/" animated={true} />
        <nav>
          <a href="#method">How it works</a>
          <a href="#features">The workspace</a>
          <a href="#languages">Languages</a>
        </nav>
        <div className="landing-actions">
          <Link href="/dictionary" className="landing-text-link">Explore dictionary</Link>
          <Link href="/login" className="landing-text-link landing-login-link">Sign in</Link>
          <Link href="/register" className="button button-dark">Start learning <ArrowRight size={15} /></Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow eyebrow-blue">A clearer way to become fluent</p>
          <h1>Master languages.<br /><em>Understand every word.</em></h1>
          <p className="hero-lede">Learn vocabulary, pronunciation, grammar, and all four language skills in one intelligent learning space.</p>
          <div className="hero-actions">
            <Link href="/register" className="button button-primary">Start learning free <ArrowRight size={16} /></Link>
            <Link href="/dictionary" className="hero-secondary"><span className="play-small"><Play size={12} fill="currentColor" /></span> See the dictionary</Link>
          </div>
          <div className="hero-proof">
            <div className="avatar-row"><span>Q</span><span>李</span><span>あ</span><span>+</span></div>
            <span>Built for curious people<br /><small>learning one good word at a time.</small></span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-grid" />
          <div className="floating-note note-top">
            <span className="note-dot note-dot-green"><Check size={13} /></span>
            <span><strong>Meaning in context</strong><small>Economic development…</small></span>
          </div>
          <div className="word-orbit">
            <div className="orbit-line orbit-line-a" />
            <div className="orbit-line orbit-line-b" />
            <div className="word-card-main">
              <span className="word-card-label">Today’s word</span>
              <strong>development</strong>
              <span className="word-ipa">/dɪˈveləpmənt/</span>
              <div className="word-card-divider" />
              <span className="word-translation">sự phát triển</span>
              <span className="word-card-example">“Language development is supported by regular practice.”</span>
            </div>
            <span className="orbit-dot dot-one" />
            <span className="orbit-dot dot-two" />
            <span className="orbit-dot dot-three" />
          </div>
          <div className="floating-note note-bottom">
            <span className="note-dot note-dot-purple"><BrainCircuit size={13} /></span>
            <span><strong>Your AI tutor</strong><small>Make one idea clearer.</small></span>
            <ArrowRight size={14} />
          </div>
        </div>
      </section>

      <section className="landing-stats">
        <div><strong>8</strong><span>languages to begin with</span></div>
        <div><strong>4</strong><span>skills in one path</span></div>
        <div><strong>∞</strong><span>questions worth asking</span></div>
        <div><strong>1</strong><span>place to keep learning</span></div>
      </section>

      <section className="landing-section" id="features">
        <div className="section-intro">
          <p className="eyebrow eyebrow-blue">The workspace</p>
          <h2>Everything you need<br /><em>to make it stick.</em></h2>
          <p>Not another noisy content library. A focused system for noticing, practicing, remembering, and using language.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="landing-feature" key={feature.number}>
                <span className="feature-number">{feature.number}</span>
                <span className="feature-icon"><Icon size={21} /></span>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
                <Link href={feature.number === "01" ? "/dictionary" : "/app/dashboard"}>Explore <ArrowRight size={14} /></Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="method-section" id="method">
        <div className="method-visual">
          <div className="method-ring ring-a" />
          <div className="method-ring ring-b" />
          <div className="method-center">
            <Target size={25} />
            <span>Search</span>
            <strong>→</strong>
            <span>Understand</span>
            <strong>→</strong>
            <span>Master</span>
          </div>
          <span className="method-label label-a">Listen</span>
          <span className="method-label label-b">Read</span>
          <span className="method-label label-c">Write</span>
          <span className="method-label label-d">Speak</span>
        </div>
        <div className="method-copy">
          <p className="eyebrow eyebrow-purple">The learning loop</p>
          <h2>From a word<br /><em>to a world.</em></h2>
          <p>Good learning is a loop, not a ladder. Look something up. Hear it. Say it. See it in context. Return when memory asks you to.</p>
          <div className="method-list">
            <span><Check size={14} /> Fast lookup with academic depth</span>
            <span><Check size={14} /> Review timed to your memory</span>
            <span><Check size={14} /> Feedback you can learn from</span>
          </div>
          <Link href="/app/dashboard" className="text-link">See your learning path <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="language-section" id="languages">
        <div>
          <p className="eyebrow eyebrow-blue">One account, many paths</p>
          <h2>Learn in the language<br /><em>that calls you.</em></h2>
        </div>
        <div className="language-list">
          <span>🇬🇧 English</span>
          <span>🇨🇳 中文</span>
          <span>🇯🇵 日本語</span>
          <span>🇰🇷 한국어</span>
          <span>🇫🇷 Français</span>
          <span>🇩🇪 Deutsch</span>
          <span>🇪🇸 Español</span>
          <span>🇻🇳 Tiếng Việt</span>
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <p className="eyebrow eyebrow-light">Your next good session</p>
          <h2>Make room for<br /><em>one more idea.</em></h2>
          <p>Start with a word. Stay for the learning.</p>
        </div>
        <Link href="/register" className="button button-primary">Create your account <ArrowRight size={16} /></Link>
      </section>

      <footer className="landing-footer">
        <Logo size="sm" href="/" animated={true} />
        <span>Language learning, with a little more clarity.</span>
        <span>© 2026 LinguaAtlas · Multi-Language Learn</span>
      </footer>
    </main>
  );
}

