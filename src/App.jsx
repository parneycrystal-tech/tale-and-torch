import { useState, useRef, useEffect } from "react";

const FINN = `You are Finn (short for Finnigan), the writing coach behind Tale & Torch. Lit major, psych minor. Old soul, sharp but never cutting, dry wit, warm underneath. You ask the one question that unlocks everything.
RULES: Never write prose for the writer. ONE illustrative sentence max. Lead with genuine strengths (RSD-aware). Never say "just focus," "push through," "be disciplined," or "try harder." Never use em dashes. Never evaluate talent or predict publishability. Find what's working, coach from there. Every writer who opens this app is a writer. Full stop.`;

const sp = (x) => `${FINN}\n\n${x}`;

const MODES = [
  { id:"diagnose", label:"Diagnose My Block", icon:"\uD83D\uDD0D", cat:"craft", sub:"Find what's really stopping you", ph:"Paste a paragraph or describe what's happening.", sys: sp("MODE: DIAGNOSE. Identify craft cause OR neurological cause. Explain principle or offer micro-step. 1-2 questions. Under 300 words.") },
  { id:"craft", label:"Craft Challenge", icon:"\u26A1", cat:"craft", sub:"A targeted exercise", ph:"Tell me what you're working on. Genre, where you are.", sys: sp("MODE: CRAFT CHALLENGE. Design 10-20 min exercise. Word count, time, constraint. Under 250 words.") },
  { id:"scene", label:"Scene Surgery", icon:"\uD83E\uDE7A", cat:"craft", sub:"Craft feedback, no rewrites", ph:"Paste a scene. Whatever you paste is brave.", sys: sp("MODE: SCENE SURGERY. RSD-AWARE: 1) Lead with what WORKS 2) 1-3 craft issues 3) Principle 4) Strategy not text. Under 350 words.") },
  { id:"character", label:"Character Deep Dive", icon:"\uD83E\uDE9E", cat:"craft", sub:"Unlock your character", ph:"Describe the character giving you trouble.", sys: sp("MODE: CHARACTER. 3-5 probing questions. Follow up. Under 200 words.") },
  { id:"plot", label:"Plot Compass", icon:"\uD83E\uDDED", cat:"craft", sub:"Untangle storylines", ph:"Describe your plot situation.", sys: sp("MODE: PLOT. Never plot FOR them. Identify issue, principle, questions. ONE thread at a time. Under 300 words.") },
  { id:"voice", label:"Voice & Style", icon:"\u270D\uFE0F", cat:"craft", sub:"Find what makes your voice yours", ph:"Paste a page of your writing.", sys: sp("MODE: VOICE. Identify what makes their voice theirs. Strengths. 1-2 generic spots. Help them turn it up. Under 300 words.") },
  { id:"micro", label:"Micro-Mode", icon:"\uD83E\uDDE9", cat:"neuro", sub:"When frozen, one tiny step", ph:"Tell me what you're working on.", sys: sp("MODE: MICRO. ONE task under 5 min. Frozen is neurological, not laziness. Under 150 words.") },
  { id:"perfectionism", label:"Perfectionism Bypass", icon:"\uD83D\uDD25", cat:"neuro", sub:"Break the paralysis", ph:"Tell me what you can't start or stop perfecting.", sys: sp("MODE: PERFECTIONISM. 1) Name it 2) Timed freewrite 5-10 min 3) No backspace 4) 'Write the worst version.' If they return: ONE alive moment. Under 200 words.") },
  { id:"smoke", label:"Through the Smoke", icon:"\uD83C\uDF2B\uFE0F", cat:"neuro", sub:"When your work suddenly feels worthless", ph:"Tell me what happened. Did your writing go from feeling good to feeling terrible?", sys: sp(`MODE: THROUGH THE SMOKE. The writer's dopamine has crashed. Work that felt brilliant now feels worthless. THIS IS NEUROLOGICAL, NOT RATIONAL. Their writing did not change. Their brain chemistry did.
YOUR JOB: 1) Name what's happening: "This is the dopamine perception shift. Your work didn't get worse. Your brain's ability to perceive its quality changed. During the high phase, you saw through elevated dopamine. Now you're seeing through depleted dopamine. Neither view is fully accurate. The truth is in the middle."
2) If they have flagged Dopamine Map moments, reference them: "You flagged [moment] as exciting when your brain was in a different state. Read it again. Not to judge. Just to remember."
3) Give a smoke-specific task: "Don't evaluate anything today. Don't reread your manuscript. Open the document, add one sentence to wherever you left off. You can hate it. The sentence isn't the point. Touching the manuscript is. You're building the neural pathway between showing up and reward."
4) NEVER say "it's actually good" or offer false reassurance. Name the science. Provide evidence from their own flagged moments. Give one tiny action. That's it.
TONE: Steady, grounded, no cheerleading. Like a friend who's been through this and knows the smoke clears. Under 250 words.`) },
  { id:"instinct", label:"Instinct Check", icon:"\uD83D\uDD2E", cat:"intuition", sub:"Trust your gut", ph:"Describe what you're wrestling with.", sys: sp("MODE: INSTINCT. Not technical. 'If this scene were a body sensation, where?' 'What are you afraid to write?' Honor answers. 2-3 questions. Under 200 words.") },
  { id:"simmer", label:"Simmer Mode", icon:"\u2615", cat:"rest", sub:"Brain solves it offline", ph:"Tell me what you're stuck on.", sys: sp("MODE: SIMMER. Default mode network science. 1) Validate 2) Load the problem 3) Boring physical activity 4) 'Keep notepad nearby.' Under 250 words.") },
  { id:"reentry", label:"Re-Entry Ramp", icon:"\uD83D\uDEA4", cat:"jarvis", sub:"Come back to your project", ph:"Just tell me you're back.", sys: sp("MODE: RE-ENTRY. Writer returned after time away. You have project details. 1) Welcome warmly, no guilt 2) Brief reminder of where they left off 3) ONE gentle question. Small, casual. Under 200 words.") }
];

const CATS = { craft:{l:"Craft Coaching",c:"#c4956a"}, neuro:{l:"Neurodivergent Support",c:"#7ea88e"}, intuition:{l:"Trust Your Intuition",c:"#9b8ec4"}, rest:{l:"Strategic Rest",c:"#c49a8e"}, jarvis:{l:"Project Memory",c:"#6a9ec4"} };

const TORCHES = [
  {q:"If there\u2019s a book that you want to read, but it hasn\u2019t been written yet, then you must write it.",a:"Toni Morrison",p:"Write 100 words about a door your character is afraid to open.",cn:"Subtext",cl:"The most powerful moments happen between the lines.",cx:"Rewrite your last dialogue so neither character says what they mean."},
  {q:"Neurodiversity may be every bit as crucial for the human race as biodiversity is for life in general.",a:"Steve Silberman",p:"Write a scene where your character\u2019s difference becomes their advantage.",cn:"Perspective",cl:"The way you see the world is not a flaw. It\u2019s a lens nobody else has.",cx:"Rewrite a paragraph from your story using a sensory detail only you would notice."},
  {q:"Almost all good writing begins with terrible first efforts.",a:"Anne Lamott",p:"Write the scene your character replays at 3am.",cn:"Emotional Wound",cl:"What happened before page one is the engine of everything on it.",cx:"Write 200 words about the moment your character\u2019s worldview changed."},
  {q:"Why fit in when you were born to stand out?",a:"Dr. Seuss",p:"Write 150 words about a character who stops pretending.",cn:"Authenticity",cl:"The most magnetic characters are the ones who stop performing for the room.",cx:"Find a moment in your draft where your character is performing. Rewrite it with the mask off."},
  {q:"Write hard and clear about what hurts.",a:"Ernest Hemingway",p:"Your character just got news that changes everything. Write their first 60 seconds.",cn:"Pacing",cl:"Time in fiction is elastic.",cx:"Find a paragraph covering hours. Expand one moment to a full page."},
  {q:"I am different, not less.",a:"Temple Grandin",p:"Write a character who solves a problem in a way nobody expected.",cn:"Unconventional Strength",cl:"The most interesting characters don\u2019t think like everyone else. Neither do the best writers.",cx:"Take a scene where your character follows the expected path. Rewrite it with them choosing the unexpected one."},
  {q:"You can always edit a bad page. You can\u2019t edit a blank page.",a:"Jodi Picoult",p:"What do your character\u2019s hands look like?",cn:"Physical Grounding",cl:"Abstract emotions become real through physical detail.",cx:"Find a feeling-word in your draft. Replace it with a physical action."},
  {q:"The role of a writer is not to say what we can all say, but what we are unable to say.",a:"Ana\u00EFs Nin",p:"Write a paragraph where your character lies to someone they love.",cn:"Voice",cl:"Voice isn\u2019t word choice. It\u2019s rhythm, obsession, what a character notices.",cx:"Rewrite your opening paragraph in the opposite voice."},
  {q:"I was always an unusual girl. My mother told me I had a chameleon soul, no moral compass pointing due north, no fixed personality.",a:"Lana Del Rey",p:"Write a character who changes depending on who they\u2019re with.",cn:"Identity",cl:"The most complex characters contain contradictions. So do the most interesting people.",cx:"Write two short paragraphs: your character with a stranger, then with someone they trust. Make them feel like a different person."},
  {q:"Start writing, no matter what. The water does not flow until the faucet is turned on.",a:"Louis L\u2019Amour",p:"Describe a room using only sound and smell.",cn:"Sensory Detail",cl:"Most writers default to sight. The other senses create intimacy.",cx:"Remove all visual description from your scene. Rebuild with touch, sound, smell, taste."},
  {q:"The creative adult is the child who survived.",a:"Ursula K. Le Guin",p:"Write 200 words about what your character was like at age eight.",cn:"Origin",cl:"Every adult character carries a child inside them. That child explains everything.",cx:"Take your protagonist\u2019s core fear. Write the childhood moment that planted it."},
  {q:"I think a lot of people who feel like misfits discover that the things that made them feel odd are actually their greatest gifts.",a:"Elizabeth Gilbert",p:"Give your character a trait they\u2019re ashamed of. Then make it save them.",cn:"The Gift in the Wound",cl:"The thing your character hates about themselves is often the thing the reader loves most.",cx:"Find your character\u2019s biggest insecurity. Write a scene where it becomes exactly what\u2019s needed."}
];

const INTROS = {
  diagnose:"Alright, tell me what you've got and where it stalled.",
  craft:"What are you working on? I'll build you an exercise.",
  scene:"Whatever you paste here is brave. Show me the scene.",
  character:"Who's giving you trouble? Tell me about them.",
  plot:"Lay it on me. What's tangled?",
  voice:"Paste a page. I'll show you what makes your voice yours.",
  micro:"Hey. You're frozen. That's your brain, not a character flaw. Tell me what you're working on.",
  perfectionism:"Nothing feels good enough? That's not a lack of talent. Tell me what you're stuck on.",
  smoke:"So the fire cooled down and now everything looks different. Worse, probably. That's the smoke. It distorts how you see your own work. Your writing didn't change. Your brain chemistry did. Tell me what's happening.",
  instinct:"Let's skip the technical stuff. What is your gut telling you about this story?",
  simmer:"Your brain is cooked. Tell me the one question your story needs answered, then I'm sending you to do the dishes.",
  reentry:""
};

const LOAD = ["Reading. Give me a second.","Sitting with this.","Let me think about what you've got here."];

function loadStored(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } }
function saveStored(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

function FormField({label,k,ph,multi,value,onChange}){return <div style={{marginBottom:14}}><label style={{fontSize:12,color:"#8a7e72",display:"block",marginBottom:5}}>{label}</label>{multi?<textarea className="fi" rows={4} placeholder={ph} value={value} onChange={e=>onChange(k,e.target.value)} style={{resize:"vertical"}}/>:<input className="fi" placeholder={ph} value={value} onChange={e=>onChange(k,e.target.value)}/>}</div>}
function Btn({children,onClick,s}){return <button onClick={onClick} style={{background:"#2a2420",border:"1px solid #3a3028",borderRadius:10,color:"#d4c8b8",fontSize:13,padding:"10px 16px",fontFamily:"'DM Sans',sans-serif",cursor:"pointer",...s}}>{children}</button>}
function BibTab({id,label,active,onClick}){return <button onClick={()=>onClick(id)} style={{background:active?"#2a2420":"none",border:active?"1px solid #3a3028":"1px solid transparent",borderRadius:8,color:active?"#c4956a":"#6d6358",fontSize:12,padding:"6px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{label}</button>}

export default function App() {
  const [mode, setMode] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState("welcome");
  const [ti] = useState(Math.floor(Math.random()*TORCHES.length));
  const [flipped, setFlipped] = useState(false);
  const [loadMsg] = useState(LOAD[Math.floor(Math.random()*LOAD.length)]);
  const [project, setProject] = useState(null);
  const [pForm, setPForm] = useState({title:"",genre:"",synopsis:"",protagonist:"",supporting:"",antagonist:"",world:"",chapters:"",where:"",stuck:"",excites:"",currentChapter:""});
  const [sparks, setSparks] = useState([]);
  const [bibTab, setBibTab] = useState("overview");
  const endRef = useRef(null);
  const taRef = useRef(null);
  const abortRef = useRef(null);
  const tk = TORCHES[ti];

  useEffect(()=>{
    const p = loadStored("tt-project");
    const s = loadStored("tt-sparks");
    if (p) { setProject(p); setScreen("home"); }
    if (s) setSparks(s);
  },[]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[msgs]);
  useEffect(()=>{if(mode&&msgs.length>0)saveStored("tt-chat-"+mode.id,msgs)},[msgs]);
  useEffect(()=>{if(taRef.current){taRef.current.style.height="auto";taRef.current.style.height=Math.min(taRef.current.scrollHeight,200)+"px"}},[input]);

  const pick=(m)=>{
    setMode(m);setScreen("chat");
    const saved = loadStored("tt-chat-"+m.id);
    if(saved&&saved.length>0){
      setMsgs(saved);
    } else if(m.id==="reentry"&&project){
      setMsgs([{role:"assistant",content:`Welcome back. You've been working on "${project.title}." ${project.where?`Last time: ${project.where}.`:""} ${project.stuck?`You were stuck on: ${project.stuck}.`:""}\n\nLet me ask you something small to get your brain back in the story.`}]);
    } else { setMsgs([{role:"assistant",content:INTROS[m.id]}]); }
    setInput("");
  };

  const newChat=()=>{
    if(!mode)return;
    saveStored("tt-chat-"+mode.id,null);
    if(mode.id==="reentry"&&project){
      setMsgs([{role:"assistant",content:`Welcome back. You've been working on "${project.title}." ${project.where?`Last time: ${project.where}.`:""} ${project.stuck?`You were stuck on: ${project.stuck}.`:""}\n\nLet me ask you something small to get your brain back in the story.`}]);
    } else { setMsgs([{role:"assistant",content:INTROS[mode.id]}]); }
  };

  const goHome=()=>{cancelReq();setMode(null);setScreen("home");setMsgs([]);setInput("")};
  const cancelReq=()=>{if(abortRef.current){abortRef.current.abort();abortRef.current=null;setLoading(false)}};
  const flagSpark=(c)=>{const ns=[...sparks,{text:c.substring(0,200),date:new Date().toLocaleDateString()}];setSparks(ns);saveStored("tt-sparks",ns)};

  const send=async()=>{
    if(!input.trim()||loading)return;
    const pCtx = project ? `\n\nPROJECT: "${project.title}". Genre: ${project.genre}. Synopsis: ${project.synopsis}. Protagonist: ${project.protagonist}. Supporting Characters: ${project.supporting}. Antagonist: ${project.antagonist}. World: ${project.world}. Chapters so far: ${project.chapters}. Current point: ${project.where}. Stuck on: ${project.stuck}. What excites them: ${project.excites}.${project.currentChapter?` CURRENT CHAPTER TEXT: ${project.currentChapter}`:""}` : "";
    const sparkCtx = sparks.length > 0 ? `\n\nDOPAMINE MAP (moments the writer flagged as exciting): ${sparks.map(s=>s.text).join(" | ")}` : "";
    const nm=[...msgs,{role:"user",content:input.trim()}];setMsgs(nm);setInput("");setLoading(true);
    const ctrl=new AbortController();abortRef.current=ctrl;
    try{
      const r=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          system: mode.sys + pCtx + sparkCtx,
          messages: nm.map(m=>({role:m.role,content:m.content}))
        }),
        signal:ctrl.signal
      });
      const d=await r.json();
      if(d.error){
        setMsgs(p=>[...p,{role:"assistant",content:`Connection issue: ${d.error}. Try again in a moment.`}]);
      } else {
        setMsgs(p=>[...p,{role:"assistant",content:d.content?.filter(b=>b.type==="text").map(b=>b.text).join("\n")||"Connection hiccup."}]);
      }
    }catch(e){if(e.name!=="AbortError")setMsgs(p=>[...p,{role:"assistant",content:"Connection hiccup. Try again."}])}
    setLoading(false);abortRef.current=null;
  };

  const handleSetup=async()=>{const p={...pForm,updated:new Date().toLocaleDateString()};setProject(p);saveStored("tt-project",p);setScreen("home")};
  const updateField=(k,v)=>setPForm(prev=>({...prev,[k]:v}));

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}body{background:#1a1612}
        ::selection{background:#c4956a40}textarea::placeholder,input::placeholder{color:#8a7e72;font-style:italic}
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes pu{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes gl{0%{box-shadow:0 0 20px #6a9ec420}50%{box-shadow:0 0 40px #6a9ec440}100%{box-shadow:0 0 20px #6a9ec420}}
        .mc{cursor:pointer;transition:all .3s}.mc:hover{transform:translateY(-2px);border-color:#c4956a60!important}
        .ma,.mu{animation:fu .4s ease-out}
        .sb{transition:all .2s}.sb:hover:not(:disabled){background:#d4a574!important;transform:scale(1.05)}
        .hb{transition:all .2s}.hb:hover{color:#c4956a!important}
        .mt{transition:all .2s;cursor:pointer}.mt:hover{background:#2a2420!important;color:#c4956a!important}
        .spb{transition:all .3s;cursor:pointer}.spb:hover{transform:translateY(-2px)}
        .cp{cursor:pointer;transition:all .5s}.cp:hover{transform:scale(1.02)}
        .fi{background:#201c17;border:1px solid #2a2420;border-radius:10px;padding:10px 14px;color:#e8ddd0;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none}.fi:focus{border-color:#c4956a60}
      `}</style>

      {/* WELCOME */}
      {screen==="welcome"&&<div onClick={()=>setScreen("home")} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#1a1612",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24,cursor:"pointer"}}>
        <div style={{maxWidth:480,textAlign:"center",animation:"fi .6s ease-out"}}>
          <div style={{fontSize:32,marginBottom:16}}>{"\uD83D\uDD25"}</div>
          {project?<>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#c4956a",marginBottom:12}}>Hey. You're back.</h2>
            <p style={{fontSize:15,color:"#d4c8b8",lineHeight:1.8,marginBottom:12}}>I still have "{project.title}" loaded. {project.where?`Last time: ${project.where}`:""}</p>
            <p style={{fontSize:15,color:"#a89a8c",lineHeight:1.8,marginBottom:24}}>Want to pick up where you left off?</p>
          </>:<>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#c4956a",marginBottom:8}}>Hey. I'm Finnigan.</h2>
            <p style={{fontSize:13,color:"#8a7e72",marginBottom:20,fontStyle:"italic"}}>But call me Finn.</p>
            <p style={{fontSize:15,color:"#d4c8b8",lineHeight:1.8,marginBottom:12}}>I'm the coach behind Tale & Torch. I ask the question you've been circling around, you realize you knew the answer the whole time, then you go write something extraordinary.</p>
            <p style={{fontSize:15,color:"#a89a8c",lineHeight:1.8,marginBottom:24}}>I don't write for you. Your voice is more interesting than mine.</p>
          </>}
          <p style={{fontSize:12,color:"#6d6358",fontStyle:"italic"}}>Tap anywhere to begin</p>
        </div>
      </div>}

      <header style={S.hdr}>
        <div style={S.hi}>
          {screen!=="home"&&screen!=="welcome"&&<button className="hb" onClick={goHome} style={S.hb2}>{"\u2190"} Back</button>}
          <div style={{flex:1}}><h1 style={S.logo}>Tale & Torch</h1><p style={S.tag}>Your writing coach, not your ghostwriter</p></div>
        </div>
        {screen==="chat"&&mode&&<div style={S.tabs}>{MODES.map(m=><button key={m.id} className="mt" onClick={()=>pick(m)} style={{...S.tab,...(mode.id===m.id?{background:"#2a2420",color:CATS[m.cat].c}:{})}}><span style={{marginRight:4}}>{m.icon}</span><span style={{fontSize:11}}>{m.label}</span></button>)}</div>}
      </header>

      {/* STORY BIBLE SETUP */}
      {screen==="setup"&&<main style={S.mn}><div style={{...S.in,animation:"fu .5s ease-out"}}>
        <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".12em",color:"#6a9ec4",fontWeight:600,marginBottom:8}}>Story Bible Setup</div>
        <p style={{fontSize:13,color:"#a89a8c",marginBottom:16,lineHeight:1.6}}>Tell Finn about your project. The more he knows, the better he can coach you. Everything saves between sessions.</p>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          <BibTab id="overview" label="Overview" active={bibTab==="overview"} onClick={setBibTab}/><BibTab id="characters" label="Characters" active={bibTab==="characters"} onClick={setBibTab}/><BibTab id="world" label="World" active={bibTab==="world"} onClick={setBibTab}/><BibTab id="chapters" label="Chapters" active={bibTab==="chapters"} onClick={setBibTab}/><BibTab id="current" label="Current Chapter" active={bibTab==="current"} onClick={setBibTab}/>
        </div>
        {bibTab==="overview"&&<><FormField label="Project title" k="title" ph="My Novel" value={pForm.title} onChange={updateField}/><FormField label="Genre" k="genre" ph="Contemporary fiction, fantasy, memoir..." value={pForm.genre} onChange={updateField}/><FormField label="Synopsis (the whole arc, spoilers welcome)" k="synopsis" ph="Kris inherits a lakehouse, meets Keyan, confronts her past..." value={pForm.synopsis} onChange={updateField} multi/><FormField label="Where are you right now?" k="where" ph="Chapter 3, Kris just arrived" value={pForm.where} onChange={updateField}/><FormField label="What are you stuck on?" k="stuck" ph="Not sure how to write the first conversation between..." value={pForm.stuck} onChange={updateField}/><FormField label="What excites you most?" k="excites" ph="The slow burn, Kris finding her voice..." value={pForm.excites} onChange={updateField} multi/></>}
        {bibTab==="characters"&&<><FormField label="Protagonist (name, age, core trait, internal conflict, external conflict, arc)" k="protagonist" ph="Emma Mae (12): Imaginative, emotionally intuitive. Believes she can fix things if she tries hard enough. Her magic is growing unstable as her grandmother's health declines..." value={pForm.protagonist} onChange={updateField} multi/><FormField label="Supporting Characters (one per paragraph works best)" k="supporting" ph="Grandma Edna (56): Caregiver, warm, resilient. Knows Emma's magic is real but fears what it could become...&#10;&#10;Michael (13): Best friend, loyal, curious. Encourages Emma to use her magic..." value={pForm.supporting} onChange={updateField} multi/><FormField label="Antagonist (person, force, or system)" k="antagonist" ph="The Lady in the Trees (Evangeline/Eva): Mysterious, bound to the forest. Can only reach Emma through limited, unnatural means..." value={pForm.antagonist} onChange={updateField} multi/></>}
        {bibTab==="world"&&<><FormField label="World-building, settings, rules, atmosphere" k="world" ph="Northern Michigan lakehouse, small town, late summer. The lake is central to the story's mood..." value={pForm.world} onChange={updateField} multi/></>}
        {bibTab==="chapters"&&<><FormField label="Chapter summaries (what's happened so far)" k="chapters" ph="Ch1: Kris arrives at lakehouse, unpacks, finds grandmother's letters. Ch2: Meets Keyan at the general store..." value={pForm.chapters} onChange={updateField} multi/></>}
        {bibTab==="current"&&<><p style={{fontSize:12,color:"#8a7e72",marginBottom:8,lineHeight:1.5}}>Paste the chapter you're currently working on. Finn will reference this text directly when coaching you.</p><FormField label="Current chapter text" k="currentChapter" ph="Paste your current chapter here..." value={pForm.currentChapter} onChange={updateField} multi/></>}
        <Btn onClick={handleSetup} s={{width:"100%",background:"#6a9ec430",borderColor:"#6a9ec460",fontWeight:600,marginTop:8}}>{project?"Update":"Save"} Story Bible</Btn>
      </div></main>}

      {/* PROJECT MEMORY VIEW */}
      {screen==="project"&&project&&<main style={S.mn}><div style={{...S.in,animation:"fu .5s ease-out"}}>
        <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".12em",color:"#6a9ec4",fontWeight:600,marginBottom:12}}>Finn's Story Bible</div>
        <div style={{background:"#201c17",border:"1px solid #2a2420",borderRadius:14,padding:"20px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#e8ddd0",marginBottom:14}}>{project.title||"Untitled"}</h3>
          {[["Genre",project.genre],["Synopsis",project.synopsis],["Protagonist",project.protagonist],["Supporting Characters",project.supporting],["Antagonist",project.antagonist],["World",project.world],["Chapters",project.chapters],["Current point",project.where],["Stuck on",project.stuck],["Excites you",project.excites],["Current chapter",project.currentChapter?"["+project.currentChapter.substring(0,100)+"...]":""]].map(([l,v])=>v?<div key={l} style={{marginBottom:10}}><p style={{fontSize:10,textTransform:"uppercase",letterSpacing:".1em",color:"#6a9ec4",fontWeight:600,marginBottom:3}}>{l}</p><p style={{fontSize:13,color:"#d4c8b8",lineHeight:1.6}}>{v}</p></div>:null)}
        </div>
        <div style={{display:"flex",gap:10,marginTop:14}}>
          <Btn onClick={()=>{setPForm(project);setScreen("setup")}} s={{flex:1}}>Edit Story Bible</Btn>
          <Btn onClick={()=>pick(MODES.find(m=>m.id==="reentry"))} s={{flex:1,background:"#6a9ec420"}}>Re-Entry Ramp</Btn>
        </div>
        {sparks.length>0&&<><div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".12em",color:"#c4956a",fontWeight:600,marginTop:20,marginBottom:10}}>{"\u2728"} Dopamine Map ({sparks.length})</div>
          {sparks.map((s,i)=><div key={i} style={{background:"#201c17",border:"1px solid #2a2420",borderRadius:10,padding:"10px 14px",marginBottom:6}}><p style={{fontSize:12,color:"#d4c8b8",lineHeight:1.5}}>"{s.text}"</p><p style={{fontSize:10,color:"#4a4038",marginTop:4}}>{s.date}</p></div>)}
        </>}
      </div></main>}

      {/* HOME */}
      {screen==="home"&&<main style={S.mn}><div style={S.in}>
        <div style={{textAlign:"center",padding:"24px 0 18px",animation:"fu .6s ease-out"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic",color:"#c4956a",lineHeight:1.6,maxWidth:440,margin:"0 auto"}}>"{tk.q}"</div>
          <div style={{fontSize:12,color:"#6d6358",marginTop:8}}>{"\u2014"} {tk.a}</div>
        </div>

        <div className="spb" onClick={()=>project?setScreen("project"):setScreen("setup")} style={{background:"linear-gradient(135deg,#1a2430,#1a1e28)",border:"1px solid #2a3440",borderRadius:14,padding:"14px 18px",marginBottom:8,display:"flex",alignItems:"center",gap:12,animation:project?"none":"gl 3s ease-in-out infinite"}}>
          <div style={{fontSize:20,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",background:"#6a9ec420",borderRadius:10,flexShrink:0}}>{"\uD83E\uDDE0"}</div>
          <div style={{flex:1}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:600,color:"#e8ddd0"}}>{project?`Story Bible: ${project.title}`:"Set Up Story Bible"}</div><div style={{fontSize:11,color:"#8a7e72"}}>{project?"Finn knows your story":"Tell Finn about your project"}</div></div>
          <div style={{color:"#6d6358"}}>{"\u2192"}</div>
        </div>

        {project&&<div className="spb" onClick={()=>pick(MODES.find(m=>m.id==="reentry"))} style={{background:"#201c17",border:"1px solid #2a2420",borderRadius:14,padding:"14px 18px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:20,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",background:"#6a9ec420",borderRadius:10,flexShrink:0}}>{"\uD83D\uDEA4"}</div>
          <div style={{flex:1}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:600,color:"#e8ddd0"}}>Re-Entry Ramp</div><div style={{fontSize:11,color:"#8a7e72"}}>Ease back into your project</div></div>
        </div>}

        <div className="spb" onClick={()=>setScreen("torch")} style={{background:"#201c17",border:"1px solid #2a2420",borderRadius:14,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:20,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",background:"#c4956a20",borderRadius:10,flexShrink:0}}>{"\uD83D\uDD25"}</div>
          <div style={{flex:1}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:600,color:"#e8ddd0"}}>Daily Torch</div><div style={{fontSize:11,color:"#8a7e72"}}>Quote, prompt & card pull</div></div>
        </div>

        {Object.entries(CATS).filter(([k])=>k!=="jarvis").map(([k,v])=><div key={k}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".12em",fontWeight:600,marginBottom:6,marginTop:12,color:v.c}}>{v.l}</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {MODES.filter(m=>m.cat===k).map(m=><div key={m.id} className="mc" onClick={()=>pick(m)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"#201c17",border:"1px solid #2a2420",borderRadius:11}}>
              <div style={{fontSize:16,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:`${v.c}18`,borderRadius:8,flexShrink:0}}>{m.icon}</div>
              <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontWeight:600,color:"#e8ddd0"}}>{m.label}</div><div style={{fontSize:11,color:"#8a7e72"}}>{m.sub}</div></div>
            </div>)}
          </div>
        </div>)}
        <p style={{fontSize:9,color:"#3a3028",textAlign:"center",marginTop:14}}>Tale & Torch is a writing craft tool, not a mental health service.</p>
      </div></main>}

      {/* DAILY TORCH */}
      {screen==="torch"&&<main style={S.mn}><div style={{...S.in,animation:"fu .5s ease-out"}}>
        <div style={{textAlign:"center",padding:"20px 0 14px"}}>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".12em",color:"#c4956a",fontWeight:600,marginBottom:10}}>{"\uD83D\uDD25"} Daily Torch</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic",color:"#c4956a",lineHeight:1.6,maxWidth:440,margin:"0 auto"}}>"{tk.q}"</div>
          <div style={{fontSize:12,color:"#6d6358",marginTop:8}}>{"\u2014"} {tk.a}</div>
        </div>
        <div style={{background:"#201c17",border:"1px solid #2a2420",borderRadius:12,padding:"14px 18px",marginBottom:12}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".1em",color:"#c4956a",fontWeight:600,marginBottom:5}}>Today's Prompt</div>
          <p style={{fontSize:14,color:"#d4c8b8",lineHeight:1.7,fontStyle:"italic"}}>{tk.p}</p>
        </div>
        <div className="cp" onClick={()=>setFlipped(!flipped)} style={{background:flipped?"#201c17":"linear-gradient(135deg,#2a2040,#1e1a2a)",border:`1px solid ${flipped?"#2a2420":"#4a3a60"}`,borderRadius:12,padding:"18px",textAlign:"center",animation:flipped?"none":"gl 3s ease-in-out infinite"}}>
          {!flipped?<div><div style={{fontSize:28,marginBottom:6}}>{"\uD83C\uDFB4"}</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#c4b8e8",fontWeight:600}}>Pull Today's Card</div></div>
          :<div style={{textAlign:"left",animation:"fi .6s ease-out"}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".1em",color:"#9b8ec4",fontWeight:600,marginBottom:5}}>Today's Card</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:"#e8ddd0",fontWeight:700,marginBottom:6}}>{tk.cn}</div>
            <p style={{fontSize:12,color:"#a89a8c",lineHeight:1.7,marginBottom:10}}>{tk.cl}</p>
            <div style={{background:"#2a242080",borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".1em",color:"#c4956a",fontWeight:600,marginBottom:3}}>Micro-Challenge</div>
              <p style={{fontSize:12,color:"#d4c8b8",lineHeight:1.6}}>{tk.cx}</p>
            </div>
          </div>}
        </div>
      </div></main>}

      {/* CHAT */}
      {screen==="chat"&&mode&&<main style={S.ch}>
        <div style={S.msa}>
          {msgs.map((m,i)=><div key={i} className={m.role==="assistant"?"ma":"mu"} style={{display:"flex",width:"100%",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{...S.bb,...(m.role==="user"?S.ub:S.ab)}}>
              {m.role==="assistant"&&<div style={{fontSize:11,fontWeight:600,color:CATS[mode.cat].c,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>{"\uD83D\uDD25"} Finn</div>}
              <div style={{color:"#d4c8b8",fontSize:14,lineHeight:1.7}}>{m.content.split("\n").map((l,j)=><p key={j} style={{marginBottom:l?10:4,minHeight:l?undefined:4}}>{l}</p>)}</div>
              {m.role==="assistant"&&i>0&&<button onClick={()=>flagSpark(m.content)} style={{background:"none",border:"1px solid #2a2420",borderRadius:8,color:"#8a7e72",fontSize:11,padding:"4px 10px",marginTop:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{"\u2728"} This excites me</button>}
            </div>
          </div>)}
          {loading&&<div className="ma" style={{display:"flex",width:"100%",alignItems:"flex-start",gap:8}}>
            <div style={{...S.bb,...S.ab,flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:CATS[mode.cat].c,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>{"\uD83D\uDD25"} Finn</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,color:"#8a7e72",fontStyle:"italic"}}>{loadMsg}</span>
                <span style={{display:"flex",gap:4}}>{[0,.3,.6].map(d=><span key={d} style={{color:CATS[mode.cat].c,fontSize:8,animation:`pu 1.2s ease-in-out infinite`,animationDelay:`${d}s`}}>{"\u25CF"}</span>)}</span>
              </div>
            </div>
            <button onClick={cancelReq} style={{background:"#2a2420",border:"1px solid #3a3028",borderRadius:8,color:"#8a7e72",fontSize:11,padding:"6px 10px",fontFamily:"'DM Sans',sans-serif",cursor:"pointer",flexShrink:0}}>Stop</button>
          </div>}
          <div ref={endRef}/>
        </div>
        <div style={S.ia}>
          <div style={S.ib}>
            <textarea ref={taRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode.ph} style={S.ta} rows={1}/>
            <button className="sb" onClick={send} disabled={!input.trim()||loading} style={{...S.se,opacity:!input.trim()||loading?.3:1}}>{"\u2191"}</button>
          </div>
          <p style={{fontSize:10,color:"#4a4038",textAlign:"center",marginTop:6}}><span>Shift+Enter for new line {"\u2022"} Your work stays private</span> {"\u2022"} <span onClick={newChat} style={{color:"#6a9ec4",cursor:"pointer"}}>New chat</span></p>
        </div>
      </main>}
    </div>
  );
}

const S={
  app:{fontFamily:"'DM Sans',sans-serif",background:"linear-gradient(180deg,#1a1612,#1e1a15,#1a1612)",color:"#e8ddd0",minHeight:"100vh",display:"flex",flexDirection:"column"},
  hdr:{borderBottom:"1px solid #2a2420",background:"#1a1612ee",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100},
  hi:{maxWidth:900,margin:"0 auto",padding:"14px 24px",display:"flex",alignItems:"center",gap:16},
  hb2:{background:"none",border:"1px solid #2a2420",color:"#8a7e72",fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"6px 14px",borderRadius:8,cursor:"pointer"},
  logo:{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:"#c4956a",letterSpacing:".02em",lineHeight:1.2},
  tag:{fontSize:11,color:"#6d6358",fontStyle:"italic",marginTop:2},
  tabs:{display:"flex",gap:2,padding:"0 24px 8px",maxWidth:900,margin:"0 auto",overflowX:"auto"},
  tab:{background:"none",border:"none",color:"#6d6358",fontFamily:"'DM Sans',sans-serif",fontSize:11,padding:"5px 10px",borderRadius:6,cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center"},
  mn:{flex:1,overflow:"auto",padding:"20px 24px"},
  in:{maxWidth:640,margin:"0 auto"},
  ch:{flex:1,display:"flex",flexDirection:"column",maxWidth:900,margin:"0 auto",width:"100%"},
  msa:{flex:1,overflow:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:16},
  bb:{maxWidth:"88%",borderRadius:16,padding:"14px 18px",lineHeight:1.65,fontSize:14},
  ab:{background:"#231f1a",border:"1px solid #2a2420",borderTopLeftRadius:4},
  ub:{background:"linear-gradient(135deg,#3a2e22,#2e2418)",border:"1px solid #4a3e32",borderTopRightRadius:4},
  ia:{padding:"12px 20px 20px",borderTop:"1px solid #2a2420",background:"#1a1612"},
  ib:{display:"flex",gap:10,alignItems:"flex-end",background:"#201c17",border:"1px solid #2a2420",borderRadius:16,padding:"10px 14px"},
  ta:{flex:1,background:"none",border:"none",outline:"none",color:"#e8ddd0",fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.6,resize:"none",maxHeight:200},
  se:{width:36,height:36,borderRadius:10,border:"none",background:"#c4956a",color:"#1a1612",fontSize:18,fontWeight:700,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"},
};
