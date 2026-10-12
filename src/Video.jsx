import React from "react";
import {
  AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame
} from "remotion";
import "./styles.css";

export const COMPOSITION_DURATION_IN_FRAMES = 8100;
const BACKGROUND_MUSIC_VOLUME = 0.18;
const MUSIC_VOLUME_WITH_PRESENTER_AUDIO = BACKGROUND_MUSIC_VOLUME * 0.35;
const NARRATION_VOLUME = 1.0;
const scenes = [
  { id: "hook", start: 0, end: 600 },
  { id: "meaning", start: 600, end: 1500 },
  { id: "learning", start: 1500, end: 2550 },
  { id: "pipeline", start: 2550, end: 3900 },
  { id: "training", start: 3900, end: 4950 },
  { id: "uses", start: 4950, end: 6000 },
  { id: "limits", start: 6000, end: 7050 },
  { id: "outro", start: 7050, end: COMPOSITION_DURATION_IN_FRAMES }
];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const ease = (f, a, b) => interpolate(f, [a, b], [0, 1], clamp);
const fadeIn = (f, start=0, duration=24) => ease(f, start, start + duration);

function ParticleField({ frame, count=80 }) {
  const particles = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (i * 173 + (i % 7) * 31) % 1920,
    y: (i * 97 + (i % 11) * 43) % 1080,
    radius: i % 9 === 0 ? 3 : 1.5,
    color: i % 4 === 0 ? "#9b8cff" : "#53e6ff",
    hasTrail: i % 4 === 0,
  })), [count]);

  return <svg className="particle-field" viewBox="0 0 1920 1080" preserveAspectRatio="none">
    {particles.map((particle, i) => {
      const drift = Math.sin(frame / 42 + i * 1.7) * 14;
      const opacity = 0.18 + (Math.sin(frame / 27 + i) + 1) * 0.22;
      return <g key={i}>
        <circle cx={particle.x + drift} cy={particle.y} r={particle.radius} fill={particle.color} opacity={opacity}/>
        {particle.hasTrail && <line x1={particle.x + drift} y1={particle.y} x2={particle.x + 70} y2={particle.y + ((i % 3) * 25 - 25)} stroke="#43cfff" strokeWidth="1" opacity=".12"/>}
      </g>;
    })}
  </svg>;
}

function Network({ frame, compact=false }) {
  const nodes = React.useMemo(() => Array.from({ length: compact ? 18 : 42 }, (_, i) => ({
    x: 960 + Math.cos(i * 2.399) * (compact ? 150 : 280) * (0.35 + (i % 5) / 7),
    y: 500 + Math.sin(i * 2.399) * (compact ? 115 : 210) * (0.35 + (i % 5) / 7),
    r: 3 + (i % 3),
  })), [compact]);

  const edges = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        if ((i + j) % 5 === 0) {
          items.push({ from: nodes[i], to: nodes[j], i, j });
        }
      }
    }
    return items;
  }, [nodes]);

  return <svg className="network" viewBox="0 0 1920 1080">
    {edges.map(({ from, to, i, j }) =>
      <line key={`${i}-${j}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke={i % 3 === 0 ? "#8c7cff" : "#42dfff"} strokeWidth="1.4"
        opacity={0.12 + (Math.sin(frame / 18 + i + j) + 1) * 0.11}/>
    )}
    {nodes.map((n, i) => <circle key={i} cx={n.x + Math.sin(frame / 30 + i) * 5} cy={n.y + Math.cos(frame / 32 + i) * 4}
      r={n.r} fill={i % 4 === 0 ? "#b1a2ff" : "#64edff"} opacity=".86"/>) }
  </svg>;
}

function Eyebrow({children}) { return <div className="eyebrow">{children}</div>; }
function MainTitle({children, sub}) {
  return <div className="title-block"><h1>{children}</h1>{sub && <p>{sub}</p>}</div>;
}
function Chip({children, accent=false}) { return <span className={`chip ${accent ? "accent" : ""}`}>{children}</span>; }

function HookScene({f}) {
  const qOpacity = fadeIn(f, 65, 24);
  const answerOpacity = fadeIn(f, 240, 25);
  return <AbsoluteFill className="scene">
    <ParticleField frame={f} count={110}/><Network frame={f}/>
    <div className="hook-copy" style={{opacity: fadeIn(f, 8, 28), transform:`translateY(${interpolate(f,[0,60],[30,0],clamp)}px)`}}>
      <Eyebrow>AI EXPLAINED · EPISODE 01</Eyebrow>
      <MainTitle>HOW DOES AI<br/><span className="cyan">UNDERSTAND LANGUAGE?</span></MainTitle>
    </div>
    <div className="chat-window" style={{opacity:qOpacity, transform:`translateY(${interpolate(f,[60,100],[40,0],clamp)}px)`}}>
      <div className="window-top"><i/><i/><i/><span>conversation.exe</span></div>
      <div className="chat-question"><b>YOU</b><span>How does AI answer my questions?</span></div>
      {f > 190 && <div className="chat-answer" style={{opacity:answerOpacity}}><b>AI MODEL</b><span>It learns patterns in language and generates a response, one piece at a time.</span></div>}
    </div>
    <div className="bottom-tag" style={{opacity:fadeIn(f,480,25)}}>LET'S UNDERSTAND <strong>LLM</strong> <span>↗</span></div>
  </AbsoluteFill>;
}

function MeaningScene({f}) {
  const words = [
    {letter:"L",word:"LARGE",desc:"A huge collection of text",x:420},
    {letter:"L",word:"LANGUAGE",desc:"Words, sentences & meaning in context",x:960},
    {letter:"M",word:"MODEL",desc:"A trained system that learns patterns",x:1500}
  ];
  return <AbsoluteFill className="scene">
    <ParticleField frame={f} count={65}/>
    <Eyebrow>01 / THE MEANING</Eyebrow>
    <MainTitle>WHAT DOES <span className="cyan">LLM</span> MEAN?</MainTitle>
    <div className="letter-row">
      {words.map((w,i)=>{
        const local = f - (i*120);
        return <div className="meaning-card" key={w.word} style={{opacity:fadeIn(local,15,25), transform:`translateY(${interpolate(local,[0,45],[45,0],clamp)}px)`}}>
          <div className="giant-letter">{w.letter}</div><h2>{w.word}</h2><p>{w.desc}</p>
          <div className="visual-mini">
            {i===0 ? <div className="book-stack">{[0,1,2,3,4].map(n=><div key={n} style={{transform:`translateY(${Math.sin(f/18+n)*4}px)`}}/>)}</div> :
             i===1 ? <div className="language-lines">{["Hello there","Kasto cha?","How can I help?"].map((s,n)=><span key={s} style={{width:`${55+n*12}%`}}>{s}</span>)}</div> :
             <Network frame={f} compact/>}
          </div>
        </div>;
      })}
    </div>
    <div className="definition-line" style={{opacity:fadeIn(f,390,25)}}>An AI model trained on lots of text to learn language patterns.</div>
  </AbsoluteFill>;
}

function LearningScene({f}) {
  const phrase = "The sun rises in the";
  return <AbsoluteFill className="scene">
    <ParticleField frame={f} count={55}/>
    <Eyebrow>02 / LEARNING PATTERNS</Eyebrow>
    <MainTitle>THE CORE IDEA: <span className="cyan">PATTERNS</span></MainTitle>
    <div className="learning-layout">
      <div className="source-docs">
        <div className="doc doc-a"><b>ARTICLE 01</b><span>Every morning, the sun rises in the east...</span><span className="fake-line"/><span className="fake-line short"/></div>
        <div className="doc doc-b"><b>BOOK EXCERPT</b><span>Earth rotates, bringing daylight...</span><span className="fake-line"/><span className="fake-line short"/></div>
        <div className="data-arrow">TEXT DATA <span>→</span></div>
      </div>
      <div className="learning-core"><Network frame={f} compact/><div className="core-label">TRAINING SYSTEM</div><div className="pulse-ring"/></div>
      <div className="prediction-box">
        <small>COMPLETE THE SENTENCE</small>
        <div className="sentence">{phrase}</div>
        <div className="choices"><span>west</span><span>blue</span><strong>east ✓</strong></div>
        <p>One likely continuation</p>
      </div>
    </div>
    <div className="explain-strip" style={{opacity:fadeIn(f,600,25)}}>Not simple copy-paste — the model learns complex statistical patterns.</div>
  </AbsoluteFill>;
}

function PipelineScene({f}) {
  const stages = [
    {n:"01",name:"USER PROMPT",detail:"Explain gravity simply.",icon:"✳"},
    {n:"02",name:"TOKENIZATION",detail:"Text becomes tokens",icon:"▦"},
    {n:"03",name:"MODEL PROCESSING",detail:"Context + learned patterns",icon:"⌘"},
    {n:"04",name:"RESPONSE",detail:"Text generated step by step",icon:"✧"}
  ];
  const active = Math.min(3, Math.floor(f/285));
  const answer = "Gravity is the force that attracts objects toward each other.";
  const chars = Math.max(0, Math.floor((f-750)*1.15));
  return <AbsoluteFill className="scene">
    <ParticleField frame={f} count={55}/>
    <Eyebrow>03 / FROM QUESTION TO ANSWER</Eyebrow>
    <MainTitle>HOW DOES AN <span className="cyan">LLM WORK?</span></MainTitle>
    <div className="pipeline">
      {stages.map((s,i)=><React.Fragment key={s.n}>
        <div className={`stage ${active===i?"active":""}`} style={{opacity:fadeIn(f,i*100,20)}}>
          <div className="stage-number">{s.n}</div><div className="stage-icon">{s.icon}</div>
          <h3>{s.name}</h3><p>{s.detail}</p>
          {i===0 && <div className="prompt-sample">“Explain gravity simply.”</div>}
          {i===1 && <div className="token-sample">{["Explain"," grav","ity"," simply","."].map((t,j)=><span key={j} style={{background:j%2?"#28234d":"#103e50"}}>{t}</span>)}</div>}
          {i===2 && <div className="processing-grid">{Array.from({length:16},(_,j)=><i key={j} style={{opacity:.35+((j+Math.floor(f/6))%5)/7}}/>)}</div>}
          {i===3 && <div className="answer-sample">{f>750?answer.slice(0,Math.min(answer.length,chars)):""}</div>}
        </div>
        {i<3&&<div className="flow-arrow" style={{opacity:fadeIn(f,i*100+30,20)}}>→</div>}
      </React.Fragment>)}
    </div>
    <div className="pipeline-note" style={{opacity:fadeIn(f,1050,25)}}>The model estimates next-token probabilities, then selects tokens to build a response.</div>
  </AbsoluteFill>;
}

function TrainingScene({f}) {
  return <AbsoluteFill className="scene">
    <ParticleField frame={f} count={50}/>
    <Eyebrow>04 / TWO DIFFERENT MOMENTS</Eyebrow>
    <MainTitle><span className="cyan">TRAINING</span> vs. INFERENCE</MainTitle>
    <div className="compare-panels">
      <div className="compare-panel training">
        <div className="panel-tag">A · PREPARING THE MODEL</div><h2>TRAINING</h2>
        <div className="flow-docs">{Array.from({length:6},(_,i)=><div key={i} style={{transform:`translateX(${Math.sin(f/12+i)*8}px)`}}>TEXT {String(i+1).padStart(2,"0")}</div>)}</div>
        <div className="mini-network"><Network frame={f} compact/></div>
        <div className="parameter-bars">{Array.from({length:10},(_,i)=><span key={i} style={{height:`${20+((i*17+Math.floor(f/5))%65)}px`}}/>)}</div>
        <strong>LEARNING PATTERNS</strong><p>Parameters are adjusted during training.</p>
      </div>
      <div className="compare-panel inference">
        <div className="panel-tag">B · USING THE MODEL</div><h2>INFERENCE</h2>
        <div className="question-bubble">Why is the sky blue?</div><div className="response-bubble" style={{opacity:fadeIn(f,250,20)}}>Sunlight scatters in the atmosphere...</div>
        <div className="inference-arrow">TRAINED MODEL <span>→</span> RESPONSE</div>
        <strong>GENERATING AN ANSWER</strong><p>A prompt goes in; a response comes out.</p>
      </div>
    </div>
  </AbsoluteFill>;
}

function UsesScene({f}) {
  const cards = [
    ["01","EDUCATION","Explain a science concept","E = mc²","✦"],
    ["02","WRITING","Polish a paragraph","Clear, concise writing…","✎"],
    ["03","CODING","Suggest code","function hello() { }","{ }"],
    ["04","TRANSLATION","English → Nepali","Hello → Namaste","文"],
    ["05","SUMMARY","Shorten a long document","Key points in 3 lines…","≡"]
  ];
  return <AbsoluteFill className="scene">
    <ParticleField frame={f} count={48}/>
    <Eyebrow>05 / IN THE REAL WORLD</Eyebrow>
    <MainTitle>WHAT CAN <span className="cyan">LLMs DO?</span></MainTitle>
    <div className="use-grid">
      {cards.map((c,i)=><div className="use-card" key={c[0]} style={{opacity:fadeIn(f, i*50, 25), transform:`translateY(${interpolate(f,[i*50,i*50+35],[24,0],clamp)}px)`}}>
        <div className="use-card-top"><span>{c[0]} / {c[1]}</span><b>{c[4]}</b></div>
        <h3>{c[2]}</h3><div className={`demo demo-${i}`}>{c[3]}</div>
        <div className="tiny-progress"><i style={{width:`${45+((f+i*19)%45)}%`}}/></div>
      </div>)}
    </div>
    <div className="use-footer">A helpful tool for learning, creating, and getting work done.</div>
  </AbsoluteFill>;
}

function LimitsScene({f}) {
  return <AbsoluteFill className="scene">
    <ParticleField frame={f} count={45}/>
    <Eyebrow>06 / USE AI WISELY</Eyebrow>
    <MainTitle>FLUENT DOES NOT ALWAYS<br/><span className="warning">MEAN CORRECT.</span></MainTitle>
    <div className="factcheck-layout">
      <div className="ai-response"><div className="mini-label">AI RESPONSE</div><div className="fake-answer">“The Great Wall of China is visible from the Moon with the naked eye.”</div><div className="status wrong">! CHECK THIS CLAIM</div></div>
      <div className="verify-arrow">→</div>
      <div className="trusted-source"><div className="mini-label">TRUSTED SOURCE</div><div className="source-lines"><i/><i/><i/><i/></div><div className="status verified">✓ VERIFY WITH RELIABLE SOURCES</div></div>
    </div>
    <div className="limits-bottom" style={{opacity:fadeIn(f,540,25)}}>LLMs can produce wrong, outdated, or made-up details. Check important information.</div>
  </AbsoluteFill>;
}

function OutroScene({f}) {
  const steps = [
    ["LLM","Large Language Model"],
    ["LEARN","Language patterns"],
    ["PROCESS","Tokens + context"],
    ["GENERATE","Text, one token at a time"]
  ];
  return <AbsoluteFill className="scene">
    <ParticleField frame={f} count={100}/><Network frame={f}/>
    <Eyebrow>THE BIG PICTURE</Eyebrow>
    <MainTitle>LLM IN <span className="cyan">FOUR STEPS</span></MainTitle>
    <div className="recap-flow">{steps.map((s,i)=><React.Fragment key={s[0]}>
      <div className="recap-step" style={{opacity:fadeIn(f,i*95+35,22)}}><b>{s[0]}</b><span>{s[1]}</span></div>
      {i<3&&<div className="recap-down" style={{opacity:fadeIn(f,i*95+55,20)}}>↓</div>}
    </React.Fragment>)}</div>
    <div className="final-title" style={{opacity:fadeIn(f,500,35), transform:`scale(${interpolate(f,[500,560],[.94,1],clamp)})`}}>
      <div>YOUR AI JOURNEY</div><strong>STARTS HERE.</strong>
      <p>Subscribe for more simple AI explanations.</p>
    </div>
  </AbsoluteFill>;
}

const sceneComponents = {
  hook: HookScene, meaning: MeaningScene, learning: LearningScene, pipeline: PipelineScene,
  training: TrainingScene, uses: UsesScene, limits: LimitsScene, outro: OutroScene
};

export const LLMExplainer = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill
    className="video-root"
    durationInFrames={8100}
    style={{
      translate: "3px 0px"
    }}
  >
    <Audio
      src={staticFile("assets/music.mp3")}
      startFrom={0}
      volume={MUSIC_VOLUME_WITH_PRESENTER_AUDIO}
      loop
    />
    <Audio
      src={staticFile("assets/narration.wav")}
      startFrom={0}
      volume={NARRATION_VOLUME}
    />
    <AbsoluteFill className="background-glow"    />
    {scenes.map((scene) => {
      const Component = sceneComponents[scene.id];
      return <Sequence
        key={scene.id}
        from={scene.start}
        durationInFrames={scene.end-scene.start}
      >
        <Component f={frame-scene.start}/>
      </Sequence>;
    })}
  </AbsoluteFill>;
};
