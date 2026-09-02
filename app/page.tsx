'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { ChapterLab, type DecisionBriefDraft } from './course-labs';
import { SqlRunner } from './sql-runner';
import {
  chapterDetails,
  course,
  fullLabSql,
  glossary,
  money,
  type QuizQuestion,
} from './course-data';

type SavedProgress = {
  introSeen?: boolean;
  activeChapter: number;
  completed: number[];
  labCompleted: number[];
  quizMastered: number[];
  quizDrafts: Record<string, QuizDraft>;
  decisionBrief: DecisionBriefDraft | null;
  nextMission: string;
};

type QuizDraft = { answers: Record<string, number>; attempts: number };

const STORAGE_KEY = course.progress.storageKey;
const stageIds = ['briefing', 'explore', 'build', 'test', 'debrief'] as const;
const missionIds = ['sql-analyst', 'dimensional-modeler', 'semantic-layer', 'data-engineer', 'olap-architecture'];

function validChapterIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is number => Number.isInteger(item) && item >= 1 && item <= 17))];
}

function validDecisionBrief(value: unknown): value is DecisionBriefDraft {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return candidate.claim === 'feb-up'
    && candidate.query === 'q1-groups'
    && candidate.evidence === 'north-home'
    && candidate.caveat === 'coverage'
    && candidate.action === 'investigate';
}

function validQuizDrafts(value: unknown): Record<string, QuizDraft> {
  if (!value || typeof value !== 'object') return {};
  const result: Record<string, QuizDraft> = {};
  for (const [chapter, candidate] of Object.entries(value)) {
    const chapterNumber = Number(chapter);
    if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 17 || !candidate || typeof candidate !== 'object') continue;
    const draft = candidate as Record<string, unknown>;
    const rawAnswers = draft.answers && typeof draft.answers === 'object' ? draft.answers as Record<string, unknown> : {};
    const answers: Record<string, number> = {};
    for (const [questionId, answer] of Object.entries(rawAnswers)) {
      if (typeof answer === 'number' && Number.isInteger(answer) && answer >= 0) answers[questionId] = answer;
    }
    result[chapter] = { answers, attempts: typeof draft.attempts === 'number' && draft.attempts >= 0 ? Math.floor(draft.attempts) : 0 };
  }
  return result;
}

const chapterActs = [
  { title: 'Act 1 · Find the evidence', range: [1, 2, 3] },
  { title: 'Act 2 · Build the model', range: [4, 5, 6, 7] },
  { title: 'Act 3 · Navigate the cube', range: [8, 9, 10, 11, 12] },
  { title: 'Act 4 · Protect the answer', range: [13, 14, 15] },
  { title: 'Act 5 · Prove the decision', range: [16, 17] },
];

const originTimeline = [
  ['1970', 'Relational foundation', 'E. F. Codd described the relational model: store data as related tables with clear logical structure.'],
  ['1980s', 'Decision support grows', 'Organizations collected operational history and needed faster summaries for planning, not only transaction screens.'],
  ['1993', 'OLAP gets its name', 'E. F. Codd, S. B. Codd, and C. T. Salley used “OLAP” for interactive multidimensional analysis.'],
  ['1996–97', 'The relational data cube', 'Jim Gray and colleagues formalized CUBE as an aggregation operator that generalizes GROUP BY, cross-tabs, and subtotals.'],
  ['Today', 'One idea, many engines', 'Logical cubes run on relational, columnar, multidimensional, or hybrid systems. The fundamentals stay the same.'],
] as const;

const curiosityFeedback = {
  source: {
    title: 'That question starts with meaning and evidence.',
    text: 'Before comparing totals, establish what each row represents and trace the result back to its source. You can enter the course with any answer.',
  },
  latest: {
    title: 'Recency helps, but it does not prove meaning.',
    text: 'A recent report can still count the wrong rows. The course will show you how to verify both the definition and the evidence.',
  },
  average: {
    title: 'A compromise is not the same as a correct answer.',
    text: 'Averaging conflicting reports can hide the real disagreement. First discover what each report counted and why.',
  },
} as const;

type CuriosityChoice = keyof typeof curiosityFeedback;

function downloadFile(name: string, text: string, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [introSeen, setIntroSeen] = useState(false);
  const [showPrologue, setShowPrologue] = useState(true);
  const [activeChapter, setActiveChapter] = useState(1);
  const [activeStage, setActiveStage] = useState<(typeof stageIds)[number]>('briefing');
  const [completed, setCompleted] = useState<number[]>([]);
  const [labCompleted, setLabCompleted] = useState<number[]>([]);
  const [quizMastered, setQuizMastered] = useState<number[]>([]);
  const [quizDrafts, setQuizDrafts] = useState<Record<string, QuizDraft>>({});
  const [decisionBrief, setDecisionBrief] = useState<DecisionBriefDraft | null>(null);
  const [nextMission, setNextMission] = useState('');
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [storageWarning, setStorageWarning] = useState('');
  const [navAnnouncement, setNavAnnouncement] = useState('');
  const prologueHeadingRef = useRef<HTMLHeadingElement>(null);
  const chapterHeadingRef = useRef<HTMLHeadingElement>(null);
  const pendingChapterFocus = useRef(false);

  const chapter = course.chapters[activeChapter - 1];
  const detail = chapterDetails[activeChapter];
  const canComplete = labCompleted.includes(activeChapter) && quizMastered.includes(activeChapter);
  const progressPercent = Math.round((completed.length / course.chapterCount) * 100);
  const xp = completed.length * course.progress.xpPerChapter;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as SavedProgress;
          const savedCompleted = validChapterIds(saved.completed);
          const savedLabs = validChapterIds(saved.labCompleted);
          const savedQuizMastery = validChapterIds(saved.quizMastered);
          const savedQuizDrafts = validQuizDrafts(saved.quizDrafts);
          const hasLegacyProgress = savedCompleted.length > 0
            || savedLabs.length > 0
            || savedQuizMastery.length > 0
            || Object.keys(savedQuizDrafts).length > 0
            || (Number.isInteger(saved.activeChapter) && saved.activeChapter > 1)
            || validDecisionBrief(saved.decisionBrief)
            || (typeof saved.nextMission === 'string' && missionIds.includes(saved.nextMission));
          const savedIntroSeen = saved.introSeen === true || hasLegacyProgress;
          if (saved.activeChapter >= 1 && saved.activeChapter <= 17) setActiveChapter(saved.activeChapter);
          setCompleted(savedCompleted);
          setLabCompleted(savedLabs);
          setQuizMastered(savedQuizMastery);
          setQuizDrafts(savedQuizDrafts);
          if (validDecisionBrief(saved.decisionBrief)) setDecisionBrief(saved.decisionBrief);
          if (typeof saved.nextMission === 'string' && missionIds.includes(saved.nextMission)) setNextMission(saved.nextMission);
          setIntroSeen(savedIntroSeen);
          setShowPrologue(!savedIntroSeen);
        }
      } catch {
        setStorageWarning('A damaged browser save was ignored. The course opened with safe defaults.');
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const save: SavedProgress = { introSeen, activeChapter, completed, labCompleted, quizMastered, quizDrafts, decisionBrief, nextMission };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
      window.setTimeout(() => setStorageWarning(''), 0);
    } catch {
      window.setTimeout(() => setStorageWarning('Progress could not be saved in this browser. The course still works in this tab.'), 0);
    }
  }, [introSeen, activeChapter, completed, labCompleted, quizMastered, quizDrafts, decisionBrief, nextMission, hydrated]);

  useEffect(() => {
    if (!pendingChapterFocus.current) return;
    pendingChapterFocus.current = false;
    window.requestAnimationFrame(() => chapterHeadingRef.current?.focus());
  }, [activeChapter]);

  function openChapter(number: number) {
    if (!Number.isInteger(number) || number < 1 || number > 17) return;
    setIntroSeen(true);
    setShowPrologue(false);
    if (number === activeChapter) {
      window.requestAnimationFrame(() => chapterHeadingRef.current?.focus());
    } else {
      pendingChapterFocus.current = true;
    }
    setActiveChapter(number);
    setActiveStage('briefing');
    setNavAnnouncement(`Chapter ${number}: ${course.chapters[number - 1].title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openPrologue() {
    setShowPrologue(true);
    setNavAnnouncement('Course introduction opened.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.requestAnimationFrame(() => prologueHeadingRef.current?.focus());
  }

  function visitStage(stage: (typeof stageIds)[number]) {
    setActiveStage(stage);
    const target = document.getElementById(stage);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.requestAnimationFrame(() => target?.querySelector<HTMLElement>('h1, h2')?.focus());
    setNavAnnouncement(`${stage[0].toUpperCase() + stage.slice(1)} stage opened`);
  }

  function markLabComplete() {
    setLabCompleted((current) => current.includes(activeChapter) ? current : [...current, activeChapter]);
  }

  function markQuizMastered() {
    setQuizMastered((current) => current.includes(activeChapter) ? current : [...current, activeChapter]);
  }

  function completeChapter() {
    if (!canComplete) return;
    setCompleted((current) => current.includes(activeChapter) ? current : [...current, activeChapter]);
  }

  function resetProgress() {
    if (!window.confirm('Reset all saved chapter, activity, and quiz progress on this device?')) return;
    setActiveChapter(1);
    setIntroSeen(false);
    setShowPrologue(true);
    setCompleted([]);
    setLabCompleted([]);
    setQuizMastered([]);
    setQuizDrafts({});
    setDecisionBrief(null);
    setNextMission('');
    try {
      localStorage.removeItem(STORAGE_KEY);
      setStorageWarning('');
    } catch {
      setStorageWarning('The browser would not clear its saved progress.');
    }
  }

  function exportProgress() {
    const payload: SavedProgress & { course: string; exportedAt: string; note: string } = {
      course: course.title,
      exportedAt: new Date().toISOString(),
      note: 'Informational progress summary; local browser storage remains the course save.',
      introSeen,
      activeChapter,
      completed,
      labCompleted,
      quizMastered,
      quizDrafts,
      decisionBrief,
      nextMission,
    };
    downloadFile('decision-room-progress.json', JSON.stringify(payload, null, 2), 'application/json');
  }

  return (
    <main className="academy-shell course-shell">
      <div className="course-background" inert={glossaryOpen || briefOpen} aria-hidden={glossaryOpen || briefOpen ? true : undefined}>
      <a
        className="skip-link"
        href={showPrologue ? '#prologue-title' : '#briefing'}
        onClick={() => window.requestAnimationFrame(() => (showPrologue ? prologueHeadingRef.current : chapterHeadingRef.current)?.focus())}
      >
        {showPrologue ? 'Skip to introduction' : 'Skip to lesson'}
      </a>
      <p className="sr-only" role="status" aria-live="polite">{navAnnouncement}</p>
      {storageWarning && <p className="storage-warning" role="status">{storageWarning}</p>}
      <header className="topbar course-topbar">
        <button type="button" className="brand-lockup" onClick={openPrologue} aria-label="The Decision Room, open course introduction">
          <span className="brand-cube" aria-hidden="true">▦</span>
          <span><strong className="hand-title">The Decision Room</strong><small>OLAP Cube Academy</small></span>
        </button>

        {showPrologue ? (
          <div className="prologue-stage-chip" aria-label="Prologue, your first briefing">
            <span>Prologue</span><b aria-hidden="true">·</b><strong>Your first briefing</strong>
          </div>
        ) : (
          <ol className="stage-path" aria-label="Current chapter stages">
            {stageIds.map((stage) => (
              <li key={stage} className={activeStage === stage ? 'is-current' : ''}>
                <button type="button" onClick={() => visitStage(stage)}>{stage[0].toUpperCase() + stage.slice(1)}</button>
              </li>
            ))}
          </ol>
        )}

        <div className="top-actions">
          <span className="xp-chip" aria-label={`${xp} experience points`}>✦ {xp.toLocaleString('en-IN')} XP</span>
          <button className="quiet-button" type="button" onClick={() => setGlossaryOpen(true)}>Glossary</button>
          <button className="brief-button" type="button" onClick={() => setBriefOpen(true)}>Decision Brief</button>
          <span className="progress-ring" aria-label={`${completed.length} of 17 chapters completed`}>{completed.length}/17</span>
          <a
            className="github-link"
            href="https://github.com/sidharthism"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit sidharthism on GitHub (opens in a new tab)"
            title="GitHub · sidharthism"
          >
            <span className="github-mark" aria-hidden="true" />
          </a>
        </div>
      </header>

      {showPrologue ? (
        <CoursePrologue
          headingRef={prologueHeadingRef}
          completed={completed}
          activeChapter={activeChapter}
          onOpenPrologue={openPrologue}
          onOpenChapter={openChapter}
          onExportProgress={exportProgress}
          onResetProgress={resetProgress}
        />
      ) : (
      <>
        <div className="course-layout">
        <MissionPathSidebar
          isPrologue={false}
          activeChapter={activeChapter}
          completed={completed}
          progressPercent={progressPercent}
          onOpenPrologue={openPrologue}
          onOpenChapter={openChapter}
          onExportProgress={exportProgress}
          onResetProgress={resetProgress}
        />

        <article className="course-content" key={activeChapter}>
          <section id="briefing" className="chapter-hero stage-section">
            <div className="chapter-kicker"><span>Chapter {chapter.number} of 17</span><span>{chapter.phase}</span></div>
            <h1 className="hand-display" ref={chapterHeadingRef} tabIndex={-1}>{chapter.title}</h1>
            <p className="chapter-objective">{chapter.objective}</p>
            <div className="story-card">
              <div className="mira-avatar" aria-hidden="true">M</div>
              <div><span className="eyebrow">Briefing from Mira</span><p>{chapter.story}</p></div>
            </div>
            {activeChapter === 1 && <OriginTimeline />}
          </section>

          <section id="explore" className="stage-section lesson-section">
            <SectionHeading number="01" eyebrow="Explore" title="Build the mental model" />
            <p className="lead-copy">{detail.plain}</p>
            <div className="mental-model"><span className="eyebrow">Plain-language picture</span><p className="hand-copy">{detail.mentalModel}</p></div>
            <div className="concept-grid">
              {chapter.concepts.map((concept, index) => <article key={concept} className={`concept-note tilt-${(index % 3) + 1}`}><span>{index + 1}</span><p>{concept}</p></article>)}
            </div>
            {activeChapter === 2 && <DatasetPassport />}
          </section>

          <section id="build" className="stage-section lesson-section">
            <SectionHeading number="02" eyebrow="Build" title="Try it with the Northstar data" />
            <div className="instruction-callout"><span className="eyebrow">Your task</span><p>{chapter.interaction.instruction}</p><small>Finish line: {chapter.interaction.completion}</small></div>
            <div className="interactive-lab">
              <ChapterLab chapter={activeChapter} onComplete={markLabComplete} completed={labCompleted.includes(activeChapter)} savedBrief={decisionBrief} onBriefSave={setDecisionBrief} savedNextMission={nextMission} onNextMissionSave={setNextMission} />
            </div>
          </section>

          <section id="test" className="stage-section lesson-section">
            <SectionHeading number="03" eyebrow="SQL + Test" title="Make the answer reproducible" />
            <SqlRunner chapter={chapter} />
            <QuizPanel questions={chapter.quiz} mastered={quizMastered.includes(activeChapter)} onMastered={markQuizMastered} draft={quizDrafts[String(activeChapter)]} onDraftChange={(draft) => setQuizDrafts((current) => ({ ...current, [String(activeChapter)]: draft }))} />
          </section>

          <section id="debrief" className="stage-section lesson-section debrief-section">
            <SectionHeading number="04" eyebrow="Debrief" title="Connect this chapter to the case" />
            <div className="debrief-card">
              <span className="eyebrow">Mira’s takeaway</span>
              <p className="hand-display">{detail.takeaway}</p>
              <div><strong>What changed in the Decision Room?</strong><p>{chapter.debrief}</p></div>
            </div>
            <div className="chapter-gate">
              <div>
                <span className={labCompleted.includes(activeChapter) ? 'done' : ''}>Activity {labCompleted.includes(activeChapter) ? '✓' : '○'}</span>
                <span className={quizMastered.includes(activeChapter) ? 'done' : ''}>Quiz mastery {quizMastered.includes(activeChapter) ? '✓' : '○'}</span>
              </div>
              <button type="button" className="primary-button" disabled={!canComplete || completed.includes(activeChapter)} onClick={completeChapter}>
                {completed.includes(activeChapter) ? 'Chapter complete ✓' : `Complete chapter · +${course.progress.xpPerChapter} XP`}
              </button>
            </div>
          </section>
        </article>

        <aside className="chapter-inspector" aria-label="Chapter reference">
          <div className="inspector-sticky">
            <span className="eyebrow">Chapter card</span>
            <strong className="hand-heading">{activeChapter}. {chapter.title}</strong>
            <p>{chapter.objective}</p>
            <div className="mini-lineage"><span>raw</span><b>→</b><span>model</span><b>→</b><span>answer</span></div>
            <dl>
              <div><dt>Activity</dt><dd>{labCompleted.includes(activeChapter) ? 'Complete ✓' : 'Open'}</dd></div>
              <div><dt>Quiz</dt><dd>{quizMastered.includes(activeChapter) ? 'Mastered ✓' : `${chapter.quiz.length} questions`}</dd></div>
              <div><dt>Reward</dt><dd>{course.progress.xpPerChapter} XP</dd></div>
            </dl>
            <button type="button" className="sketch-button" onClick={() => setBriefOpen(true)}>Open Decision Brief</button>
            <button type="button" className="text-button" onClick={() => downloadFile('northstar-olap-lab.sql', fullLabSql, 'text/sql')}>Download the complete SQL lab</button>
          </div>
        </aside>
      </div>

      <footer className="chapter-footer course-footer">
        <button type="button" className="quiet-button" disabled={activeChapter === 1} onClick={() => openChapter(activeChapter - 1)}>← Previous</button>
        <p><strong>{activeChapter}. {chapter.title}</strong><span>{completed.includes(activeChapter) ? 'Complete ✓' : canComplete ? 'Ready to complete' : 'Activity + quiz required'}</span></p>
        <div>
          <button type="button" className="quiet-button" onClick={() => setBriefOpen(true)}>Decision Brief</button>
          {activeChapter < 17 ? <button type="button" className="primary-button" onClick={() => openChapter(activeChapter + 1)}>Next chapter →</button> : <button type="button" className="primary-button" onClick={() => visitStage('debrief')}>Review conclusion ↑</button>}
        </div>
      </footer>
      </>
      )}
      </div>

      {glossaryOpen && <GlossaryDrawer query={glossaryQuery} setQuery={setGlossaryQuery} onClose={() => setGlossaryOpen(false)} />}
      {briefOpen && <DecisionBriefDrawer completed={completed} brief={decisionBrief} onClose={() => setBriefOpen(false)} />}
    </main>
  );
}

function MissionPathSidebar({
  isPrologue,
  activeChapter,
  completed,
  progressPercent,
  onOpenPrologue,
  onOpenChapter,
  onExportProgress,
  onResetProgress,
}: {
  isPrologue: boolean;
  activeChapter: number;
  completed: number[];
  progressPercent: number;
  onOpenPrologue: () => void;
  onOpenChapter: (number: number) => void;
  onExportProgress: () => void;
  onResetProgress: () => void;
}) {
  return (
    <aside className="chapter-palette course-palette" aria-label="Mission path">
      <div className="palette-title-row"><h2 className="hand-heading">Mission path</h2><span className="tiny-note">1–17</span></div>
      <div className="progress-track" aria-label={`${progressPercent}% complete`}><span style={{ width: `${progressPercent}%` }} /></div>
      <p className="progress-copy">{progressPercent}% complete · every chapter stays open. Completion, quiz answers, your brief, and your next path are saved; in-progress lab experiments reset when you leave.</p>
      <nav aria-label="Prologue and chapters">
        <ol className="mission-prologue-list">
          <li className={isPrologue ? 'active-chapter' : ''}>
            <button type="button" onClick={onOpenPrologue} aria-current={isPrologue ? 'page' : undefined}>
              <span className="chapter-number" aria-hidden="true">P</span>
              <span><strong>Prologue</strong><small>Your first briefing</small></span>
            </button>
          </li>
        </ol>
        {chapterActs.map((act) => (
          <section className="act-group" key={act.title}>
            <h3>{act.title}</h3>
            <ol>
              {act.range.map((number) => {
                const item = course.chapters[number - 1];
                const isComplete = completed.includes(number);
                return (
                  <li key={number} className={`${!isPrologue && number === activeChapter ? 'active-chapter' : ''} ${isComplete ? 'done-chapter' : ''}`}>
                    <button type="button" onClick={() => onOpenChapter(number)} aria-current={!isPrologue && number === activeChapter ? 'page' : undefined}>
                      <span className="chapter-number">{isComplete ? '✓' : number}</span>
                      <span>{item.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </nav>
      <div className="palette-tools">
        <button type="button" onClick={onExportProgress}>Download progress summary</button>
        <button type="button" onClick={onResetProgress}>Reset</button>
      </div>
    </aside>
  );
}

function CoursePrologue({
  headingRef,
  completed,
  activeChapter,
  onOpenPrologue,
  onOpenChapter,
  onExportProgress,
  onResetProgress,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  completed: number[];
  activeChapter: number;
  onOpenPrologue: () => void;
  onOpenChapter: (number: number) => void;
  onExportProgress: () => void;
  onResetProgress: () => void;
}) {
  const [choice, setChoice] = useState<CuriosityChoice>('source');
  const feedback = curiosityFeedback[choice];
  const progressPercent = Math.round((completed.length / course.chapterCount) * 100);

  const choices: { id: CuriosityChoice; label: string; letter: string }[] = [
    { id: 'source', letter: 'A', label: 'What does one row mean—and which source rows prove the total?' },
    { id: 'latest', letter: 'B', label: 'Which report was updated most recently?' },
    { id: 'average', letter: 'C', label: 'Can we average the three answers?' },
  ];

  const benefits = [
    ['1', 'Compare viewpoints', 'Look at time, product, region, and other business perspectives.'],
    ['2', 'Move from summary to evidence', 'Trace an aggregate back to the rows behind it.'],
    ['3', 'Spot misleading answers', 'Notice bad totals, missing data, and false zeros.'],
    ['✓', 'Explain the decision', 'Tell someone what the number means and why it is trustworthy.'],
  ];

  return (
    <div className="prologue-layout">
      <MissionPathSidebar
        isPrologue
        activeChapter={activeChapter}
        completed={completed}
        progressPercent={progressPercent}
        onOpenPrologue={onOpenPrologue}
        onOpenChapter={onOpenChapter}
        onExportProgress={onExportProgress}
        onResetProgress={onResetProgress}
      />

      <article className="prologue-content" aria-labelledby="prologue-title">
        <section className="prologue-hero">
          <div className="prologue-story">
            <p className="prologue-kicker">Prologue · Before Chapter 1</p>
            <h1 id="prologue-title" className="hand-display" ref={headingRef} tabIndex={-1}>Three reports. Three answers. One decision.</h1>
            <p className="prologue-lead">Northstar Retail’s sales reports disagree. You are joining Mira in the Decision Room to learn how to find a number you can trust—and show exactly where it came from.</p>
            <div className="mira-intro">
              <div className="mira-prologue-mark" aria-hidden="true">M</div>
              <div>
                <p><strong>Mira</strong><span> · Analytics lead and your guide</span></p>
                <blockquote className="hand-copy">“Leaders do not need another dashboard. They need an answer they can trust.”</blockquote>
              </div>
            </div>
          </div>

          <div className="report-stack" aria-label="Three conflicting report slips">
            <article className="report-slip report-finance">
              <span className="eyebrow">Report A · Finance</span>
              <strong className="hand-copy">“Use completed net sales.”</strong>
              <p>Cancelled orders excluded.</p>
            </article>
            <article className="report-slip report-operations">
              <span className="eyebrow">Report B · Operations</span>
              <strong className="hand-copy">“These rows include every order.”</strong>
              <p>But do they all belong in the decision?</p>
            </article>
            <article className="report-slip report-regional">
              <span className="eyebrow">Report C · Regional view</span>
              <strong className="hand-copy">“My total changes with the view.”</strong>
              <p>Same business. Different grouping.</p>
            </article>
          </div>
        </section>

        <section className="prologue-curiosity" aria-labelledby="curiosity-title">
          <div>
            <span className="eyebrow">A small curiosity check</span>
            <h2 id="curiosity-title" className="hand-heading">What would you ask first?</h2>
            <div className="curiosity-choices" role="group" aria-label="Choose your first question">
              {choices.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={choice === item.id ? 'is-selected' : ''}
                  aria-pressed={choice === item.id}
                  onClick={() => setChoice(item.id)}
                >
                  <span>{item.letter}</span><b>{item.label}</b>
                </button>
              ))}
            </div>
          </div>
          <div className="curiosity-feedback" role="status" aria-live="polite">
            <span aria-hidden="true">✓</span>
            <div><strong>{feedback.title}</strong><p>{feedback.text}</p></div>
          </div>
        </section>

        <section className="prologue-benefits" aria-labelledby="olap-benefits-title">
          <div>
            <span className="eyebrow">Why learn OLAP?</span>
            <h2 id="olap-benefits-title" className="hand-heading">See the same business clearly, from more than one angle.</h2>
          </div>
          <ol>
            {benefits.map(([number, title, text]) => (
              <li key={title}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></li>
            ))}
          </ol>
        </section>

        <section className="prologue-prerequisites" aria-labelledby="prerequisites-title">
          <div>
            <span className="eyebrow">Before you begin</span>
            <h2 id="prerequisites-title" className="hand-heading">You already know enough to start.</h2>
            <p>Bring curiosity and comfort with everyday ideas like grouping, filtering, comparing, and asking “why?”</p>
          </div>
          <ul>
            <li><span aria-hidden="true">✓</span>No data-engineering background required.</li>
            <li><span aria-hidden="true">✓</span>No advanced mathematics required.</li>
            <li><span aria-hidden="true">✓</span>No prior SQL required; SQL is introduced from raw tables.</li>
          </ul>
        </section>

        <section className="prologue-journey" aria-labelledby="journey-title">
          <span id="journey-title" className="eyebrow">The journey ahead</span>
          <p className="hand-copy">
            <span>raw events</span><b aria-hidden="true">→</b><span>trustworthy facts</span><b aria-hidden="true">→</b><span>business viewpoints</span><b aria-hidden="true">→</b><span className="cube-step">cube</span><b aria-hidden="true">→</b><span>evidence-backed decision</span>
          </p>
          <button type="button" className="primary-button prologue-cta" onClick={() => onOpenChapter(1)}>Enter the Decision Room <span aria-hidden="true">→</span></button>
          <p className="prologue-support">Begin Chapter 1 of 17.</p>
          <small>Progress is saved in this browser. Select the brand at any time to revisit this Prologue.</small>
        </section>
      </article>
    </div>
  );
}

function SectionHeading({ number, eyebrow, title }: { number: string; eyebrow: string; title: string }) {
  return <div className="section-heading"><span className="sketch-number">{number}</span><div><span className="eyebrow">{eyebrow}</span><h2 className="hand-heading" tabIndex={-1}>{title}</h2></div></div>;
}

function OriginTimeline() {
  return (
    <div className="origin-block">
      <div className="origin-heading"><span className="eyebrow">Where OLAP came from</span><h2 className="hand-heading">From transaction records to interactive decisions</h2></div>
      <ol className="origin-timeline">
        {originTimeline.map(([year, title, text]) => <li key={year}><span>{year}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}
      </ol>
      <p className="source-note">Historical anchors: Codd, Codd & Salley’s 1993 OLAP report; Gray and colleagues’ relational data-cube work published in 1996–97.</p>
    </div>
  );
}

function DatasetPassport() {
  const metrics = [
    ['Raw orders', '6'], ['Raw lines', '11'], ['Loaded facts', '10'], ['Completed orders', '5'],
    ['Units', '14'], ['Gross', '₹21,150'], ['Discounts', '₹1,350'], ['Net', '₹19,800'],
  ];
  return <div className="dataset-passport"><div><span className="eyebrow">Dataset passport</span><h3 className="hand-heading">Northstar Retail</h3><p>One small, deterministic dataset follows you through every chapter.</p></div><dl>{metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="warning-callout">Order 1006 is cancelled. Its ₹6,000 line remains raw evidence but is excluded from fact_sales.</p></div>;
}

function QuizPanel({ questions, mastered, onMastered, draft, onDraftChange }: { questions: QuizQuestion[]; mastered: boolean; onMastered: () => void; draft?: QuizDraft; onDraftChange: (draft: QuizDraft) => void }) {
  const [checked, setChecked] = useState(false);
  const resultRef = useRef<HTMLParagraphElement>(null);
  const answers = draft?.answers ?? {};
  const attempts = draft?.attempts ?? 0;
  const answered = questions.every((question) => answers[question.id] !== undefined);
  const score = questions.filter((question) => answers[question.id] === question.correctIndex).length;
  const percent = Math.round((score / questions.length) * 100);
  const wrongNumbers = questions.map((question, index) => answers[question.id] === question.correctIndex ? null : index + 1).filter((value): value is number => value !== null);

  useEffect(() => {
    if (checked) resultRef.current?.focus();
  }, [checked, attempts]);

  function checkQuiz() {
    if (!answered) return;
    setChecked(true);
    onDraftChange({ answers, attempts: attempts + 1 });
    if (percent >= course.progress.masteryPercent) onMastered();
  }

  return (
    <div className="quiz-panel">
      <div className="quiz-header"><div><span className="eyebrow">Chapter check</span><h3 className="hand-heading">Explain, predict, and verify</h3></div><span>{mastered ? checked && percent < course.progress.masteryPercent ? 'Previously mastered ✓' : 'Mastered ✓' : `${course.progress.masteryPercent}% to master`}</span></div>
      <div className="quiz-list">
        {questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const correct = selected === question.correctIndex;
          return <fieldset key={question.id} className={checked ? (correct ? 'quiz-correct' : 'quiz-wrong') : ''}><legend><span>{questionIndex + 1}</span>{question.question}</legend><div className="quiz-options">{question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id} checked={selected === optionIndex} onChange={() => { onDraftChange({ answers: { ...answers, [question.id]: optionIndex }, attempts }); setChecked(false); }} /><span>{option}</span></label>)}</div>{checked && <div className="quiz-explanation"><strong>{correct ? 'Correct.' : `Answer: ${question.options[question.correctIndex]}.`}</strong> {question.explanation}</div>}</fieldset>;
        })}
      </div>
      <div className="quiz-footer"><p ref={resultRef} tabIndex={-1} role="status" aria-live="polite">{checked ? <><strong>{score}/{questions.length} · {percent}%</strong> {percent >= course.progress.masteryPercent ? 'Mastery reached.' : `Review question${wrongNumbers.length === 1 ? '' : 's'} ${wrongNumbers.join(', ')}, change an answer, and retry.`}</> : attempts ? `Attempts: ${attempts}. Retries are unlimited.` : 'Answer every question, then check your reasoning.'}</p><button type="button" className="primary-button" disabled={!answered} onClick={checkQuiz}>{attempts ? 'Check changed answers' : 'Check answers'}</button></div>
    </div>
  );
}

function useModalFocus(onClose: () => void) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const selector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>(selector) ?? []);
    focusable()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, []);

  return dialogRef;
}

function GlossaryDrawer({ query, setQuery, onClose }: { query: string; setQuery: (value: string) => void; onClose: () => void }) {
  const results = useMemo(() => glossary.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const dialogRef = useModalFocus(onClose);
  return <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside ref={dialogRef} className="side-drawer" role="dialog" aria-modal="true" aria-labelledby="glossary-title"><div className="drawer-header"><div><span className="eyebrow">Reference</span><h2 id="glossary-title" className="hand-heading">OLAP glossary</h2></div><button type="button" aria-label="Close glossary" onClick={onClose}>×</button></div><label className="search-box"><span className="sr-only">Search glossary</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search terms and examples…" /></label><dl className="glossary-list">{results.map(([term, definition]) => <div key={term}><dt className="hand-copy">{term}</dt><dd>{definition}</dd></div>)}</dl>{!results.length && <p>No term matches that search.</p>}</aside></div>;
}

function DecisionBriefDrawer({ completed, brief, onClose }: { completed: number[]; brief: DecisionBriefDraft | null; onClose: () => void }) {
  const dialogRef = useModalFocus(onClose);
  return <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside ref={dialogRef} className="side-drawer brief-drawer" role="dialog" aria-modal="true" aria-labelledby="brief-title"><div className="drawer-header"><div><span className="eyebrow">Persistent artifact</span><h2 id="brief-title" className="hand-heading">Decision Brief</h2></div><button type="button" aria-label="Close Decision Brief" onClick={onClose}>×</button></div><div className="brief-summary"><span>Completed evidence cards</span><strong>{completed.length} / 17</strong><div className="progress-track"><span style={{ width: `${Math.round(completed.length / 17 * 100)}%` }} /></div></div>{brief ? <article className="saved-decision-paper"><span className="eyebrow">Your saved capstone</span><h3 className="hand-heading">What drove Q1 sales?</h3><p><strong>Claim:</strong> February reached ₹9,900, ₹3,500 above January.</p><p><strong>Query:</strong> Completed facts grouped by Q1 month, region, and category.</p><p><strong>Evidence:</strong> North × Home contributed ₹6,600 from two traceable order lines.</p><p><strong>Caveat:</strong> March has no facts; Q2 is loaded only through April.</p><p><strong>Action:</strong> Investigate North Home demand while preserving audit detail.</p></article> : <p className="mentor-feedback">Your own capstone brief will be saved here after Chapter 16.</p>}<div className="brief-card-list">{course.chapters.map((chapter) => <article key={chapter.number} className={completed.includes(chapter.number) ? 'unlocked' : ''}><span>{completed.includes(chapter.number) ? '✓' : chapter.number}</span><div><strong>{chapter.title}</strong><p>{completed.includes(chapter.number) ? chapterDetails[chapter.number].takeaway : 'Complete the activity and quiz to add this evidence.'}</p></div></article>)}</div><div className="final-evidence"><span className="eyebrow">Verified Northstar totals</span><dl><div><dt>Facts</dt><dd>10</dd></div><div><dt>Orders</dt><dd>5</dd></div><div><dt>Units</dt><dd>14</dd></div><div><dt>Net sales</dt><dd>{money(19800)}</dd></div></dl></div></aside></div>;
}
