import { useState, useCallback, useEffect, useRef } from "react";

const questions = [
  { id: 1, area: "Языки любви", emoji: "💕", q: "Что должен делать партнёр, чтобы ты чувствовал(а) себя любимым?" },
  { id: 2, area: "Языки любви", emoji: "💕", q: "А как ты сам(а) обычно показываешь любовь?" },
  { id: 3, area: "Конфликты", emoji: "⚡", q: "Что ты делаешь первым делом, когда начинается ссора?" },
  { id: 4, area: "Конфликты", emoji: "⚡", q: "Что тебе нужно от партнёра, чтобы ты успокоился/ась во время ссоры?" },
  { id: 5, area: "Эмоции", emoji: "🌊", q: "Когда тебе плохо — ты говоришь об этом или ждёшь, что заметят?" },
  { id: 6, area: "Эмоции", emoji: "🌊", q: "Когда тебе нужна поддержка — лучше обнять и помолчать, или поговорить и помочь решить?" },
  { id: 7, area: "Стресс", emoji: "🔥", q: "Когда тебе тяжело — ты тянешься к партнёру или хочешь побыть один/одна?" },
  { id: 8, area: "Стресс", emoji: "🔥", q: "Что точно НЕ надо делать, когда ты в стрессе?" },
  { id: 9, area: "Ожидания", emoji: "🎯", q: "Без чего отношения для тебя не работают?" },
  { id: 10, area: "Ожидания", emoji: "🎯", q: "Что для тебя неприемлемо — из-за чего точно уйдёшь?" },
  { id: 11, area: "Границы", emoji: "🛡", q: "Сколько времени наедине с собой тебе нужно?" },
  { id: 12, area: "Границы", emoji: "🛡", q: "Что ты делаешь, когда партнёр нарушает твои границы?" },
  { id: 13, area: "Привязанность", emoji: "🔗", q: "Что ты чувствуешь и делаешь, когда партнёр отдаляется?" },
  { id: 14, area: "Решения", emoji: "⚖️", q: "Как ты себя ведёшь, когда вы не согласны по важному вопросу?" },
  { id: 15, area: "Близость", emoji: "🤗", q: "Насколько тебе важны обнимашки, касания в обычной жизни?" },
  { id: 16, area: "Признание", emoji: "✨", q: "Как ты понимаешь, что партнёр тебя ценит?" },
  { id: 17, area: "Быт", emoji: "🏠", q: "Что бесит тебя больше всего в быту?" },
  { id: 18, area: "Будущее", emoji: "🚀", q: "Как далеко вперёд ты думаешь про отношения и важно ли, чтобы партнёр думал так же?" },
];

const areaColors = {
  "Языки любви": ["#ff6b6b", "#ee5a24"],
  "Конфликты": ["#f9ca24", "#f0932b"],
  "Эмоции": ["#a29bfe", "#6c5ce7"],
  "Стресс": ["#55efc4", "#00b894"],
  "Ожидания": ["#fd79a8", "#e84393"],
  "Границы": ["#74b9ff", "#0984e3"],
  "Привязанность": ["#ff7675", "#d63031"],
  "Решения": ["#ffeaa7", "#fdcb6e"],
  "Близость": ["#fab1a0", "#e17055"],
  "Признание": ["#81ecec", "#00cec9"],
  "Быт": ["#dfe6e9", "#b2bec3"],
  "Будущее": ["#a29bfe", "#6c5ce7"],
};

const SYSTEM_PROMPT = `Ты — эксперт по психологии отношений. Тебе дают ответы одного партнёра на тест из 18 вопросов по 12 областям.

Твоя задача — на основе ответов создать два блока, ОБЯЗАТЕЛЬНО разделённых строкой ===РАЗДЕЛИТЕЛЬ===

БЛОК 1: "Твой профиль" (для того, кто прошёл тест — чтобы проверить, всё ли верно)
— Краткий портрет: стиль привязанности, ведущие языки любви, паттерны в конфликтах
— 3-5 ключевых особенностей

Потом ровно одна строка: ===РАЗДЕЛИТЕЛЬ===

БЛОК 2: "Гайд для партнёра" (конкретные рекомендации)
Структура:
— Как показывать любовь этому человеку
— Что делать во время конфликта
— Что делать когда партнёр в стрессе  
— Чего точно НЕ делать
— Как поддерживать в повседневности
— 3 главных правила для счастливых отношений с этим человеком

Пиши живым языком, без канцелярита. Конкретно, с примерами действий. Не больше 800 слов суммарно.

ВАЖНО: Пиши ТОЛЬКО plain text. Никакого маркдауна, никаких символов ** # ## ### - •. Заголовки пиши ЗАГЛАВНЫМИ БУКВАМИ на отдельной строке. Пункты списков начинай с новой строки без буллетов и дефисов. Просто чистый текст.`;

const loadingPhrases = ["Читаю между строк...", "Нахожу паттерны...", "Составляю портрет...", "Формулирую рекомендации...", "Почти готово..."];

function Particles() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: Math.random() * 4 + 2, height: Math.random() * 4 + 2, borderRadius: "50%",
          background: `rgba(255, ${Math.floor(Math.random()*100+100)}, ${Math.floor(Math.random()*100+150)}, ${Math.random()*0.15+0.05})`,
          left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
          animation: `float${i%3} ${Math.random()*15+20}s infinite ease-in-out`,
          animationDelay: `${Math.random()*-20}s`,
        }} />
      ))}
    </div>
  );
}

export default function RelationshipQuiz() {
  const [screen, setScreen] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [result, setResult] = useState("");
  const [name, setName] = useState("");
  const [animating, setAnimating] = useState(false);
  const [cardAnim, setCardAnim] = useState("idle");
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState(0);
  const [introVisible, setIntroVisible] = useState(false);
  const textareaRef = useRef(null);

  const progress = (currentQ / questions.length) * 100;

  useEffect(() => { setTimeout(() => setIntroVisible(true), 100); }, []);

  useEffect(() => {
    if (screen === "loading") {
      const iv = setInterval(() => setLoadingPhrase(p => (p+1) % loadingPhrases.length), 2500);
      return () => clearInterval(iv);
    }
  }, [screen]);

  useEffect(() => {
    if (screen === "quiz" && textareaRef.current) setTimeout(() => textareaRef.current?.focus(), 300);
  }, [currentQ, screen]);

  const animateTransition = (direction, cb) => {
    setCardAnim(`exit-${direction}`); setAnimating(true);
    setTimeout(() => { cb(); setCardAnim(`enter-${direction}`); setTimeout(() => { setCardAnim("idle"); setAnimating(false); }, 350); }, 300);
  };

  const handleNext = useCallback(() => {
    if (!currentAnswer.trim() || animating) return;
    const na = { ...answers, [currentQ]: currentAnswer.trim() };
    setAnswers(na);
    if (currentQ < questions.length - 1) {
      animateTransition("left", () => { setCurrentAnswer(na[currentQ+1] || ""); setCurrentQ(p => p+1); });
    } else { setCurrentAnswer(""); generateProfile(na); }
  }, [currentAnswer, currentQ, answers, animating]);

  const handleBack = useCallback(() => {
    if (currentQ > 0 && !animating) {
      animateTransition("right", () => { setCurrentAnswer(answers[currentQ-1] || ""); setCurrentQ(p => p-1); });
    }
  }, [currentQ, answers, animating]);

  const generateProfile = async (allAnswers) => {
    setScreen("loading"); setLoadingPhrase(0);
    const formatted = questions.map((q, i) => `[${q.area}] ${q.q}\nОтвет: ${allAnswers[i]}`).join("\n\n");
    const userMessage = `Имя: ${name || "Не указано"}\n\nОтветы на тест:\n\n${formatted}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, system: SYSTEM_PROMPT, messages: [{ role: "user", content: userMessage }] }),
      });
      const data = await response.json();
      setResult(data.content?.map(b => b.text || "").join("") || "Ошибка генерации");
    } catch (e) { setResult("Произошла ошибка. Попробуй ещё раз."); }
    setScreen("result");
  };

  const cleanText = t => t.replace(/\*\*/g,"").replace(/^#{1,3}\s*/gm,"").replace(/^[-•●]\s*/gm,"").replace(/===РАЗДЕЛИТЕЛЬ===/g,"").replace(/\n{3,}/g,"\n\n").trim();
  const getGuideBlock = () => {
    const p = result.split("===РАЗДЕЛИТЕЛЬ===");
    if (p.length >= 2) return cleanText(p[1]);
    const idx = result.indexOf("ГАЙД ДЛЯ ПАРТН");
    return idx !== -1 ? cleanText(result.slice(idx)) : cleanText(result);
  };

  const handleCopyGuide = () => { setShowGuideModal(true); setModalCopied(false); };
  const handleModalCopy = () => {
    const text = getGuideBlock();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => { setModalCopied(true); setTimeout(() => setModalCopied(false), 2500); }).catch(() => fbCopy(text));
    } else fbCopy(text);
  };
  const fbCopy = text => {
    const ta = document.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;left:-9999px;opacity:0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand("copy"); setModalCopied(true); setTimeout(() => setModalCopied(false), 2500); } catch(e){}
    document.body.removeChild(ta);
  };
  const handleRestart = () => {
    setScreen("intro"); setCurrentQ(0); setAnswers({}); setCurrentAnswer(""); setResult(""); setName("");
    setIntroVisible(false); setTimeout(() => setIntroVisible(true), 100);
  };
  const handleKeyDown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleNext(); } };

  const q = questions[currentQ];
  const colors = q ? (areaColors[q.area] || ["#a29bfe","#6c5ce7"]) : ["#a29bfe","#6c5ce7"];

  // ─── INTRO ───
  if (screen === "intro") return (
    <div style={S.page}><Particles/>
      <div style={{...S.introWrap, opacity: introVisible?1:0, transform: introVisible?"translateY(0)":"translateY(30px)", transition:"all 0.8s cubic-bezier(0.16,1,0.3,1)"}}>
        <div style={S.introGlow}/>
        <div style={S.introCard}>
          <div style={S.heartWrap}>
            <svg width="56" height="56" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ff6b6b"/><stop offset="50%" stopColor="#ee5a24"/><stop offset="100%" stopColor="#e84393"/></linearGradient></defs>
            <path d="M32 56s-2.5-1.8-5.2-4.2C18.4 44.5 8 34.8 8 23.5 8 15.3 14.3 9 22.5 9c4.7 0 7.8 2.2 9.5 4.5C33.7 11.2 36.8 9 41.5 9 49.7 9 56 15.3 56 23.5c0 11.3-10.4 21-18.8 28.3C34.5 54.2 32 56 32 56z" fill="url(#hg)"/></svg>
          </div>
          <h1 style={S.introTitle}>Узнай себя<br/>в отношениях</h1>
          <p style={S.introSub}>Ответь на 18 вопросов — получи гайд,<br/>который объяснит партнёру, как тебя любить.</p>
          <div style={S.inputWrap}>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Твоё имя" style={S.nameInput} onKeyDown={e=>e.key==="Enter"&&setScreen("quiz")}/>
          </div>
          <button onClick={()=>setScreen("quiz")} style={S.startBtn}>
            <span>Начать</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <p style={S.disclaimer}>Это не психодиагностика. Результат — повод для разговора, не диагноз.</p>
        </div>
      </div>
    </div>
  );

  // ─── LOADING ───
  if (screen === "loading") return (
    <div style={S.page}><Particles/>
      <div style={S.loadingWrap}>
        <div style={S.loadingOrb}><div style={S.orbInner}/><div style={S.orbRing}/><div style={S.orbRing2}/></div>
        <p style={S.loadingText}>{loadingPhrases[loadingPhrase]}</p>
        <div style={S.loadingBar}><div style={S.loadingFill}/></div>
      </div>
    </div>
  );

  // ─── RESULT ───
  if (screen === "result") return (
    <div style={S.page}><Particles/>
      <div style={S.resultWrap}>
        <div style={S.resultCard}>
          <div style={S.resultHead}>
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="hgs" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ff6b6b"/><stop offset="100%" stopColor="#e84393"/></linearGradient></defs>
            <path d="M32 56s-2.5-1.8-5.2-4.2C18.4 44.5 8 34.8 8 23.5 8 15.3 14.3 9 22.5 9c4.7 0 7.8 2.2 9.5 4.5C33.7 11.2 36.8 9 41.5 9 49.7 9 56 15.3 56 23.5c0 11.3-10.4 21-18.8 28.3C34.5 54.2 32 56 32 56z" fill="url(#hgs)"/></svg>
            <h2 style={S.resultTitle}>{name ? `Профиль: ${name}` : "Твой профиль"}</h2>
          </div>
          <div style={S.resultBody}>
            {result.split("\n").map((raw, i) => {
              if (raw.includes("===РАЗДЕЛИТЕЛЬ===")) return <div key={i} style={S.divider}/>;
              const line = raw.replace(/\*\*/g,"").replace(/^#{1,3}\s*/,"").trim();
              if (!line) return <div key={i} style={{height:14}}/>;
              if (line===line.toUpperCase()&&line.length>3&&line.length<80&&/[А-ЯA-Z]/.test(line)) return <h3 key={i} style={S.rHead}>{line}</h3>;
              if (raw.match(/^[-•●]\s/)) return <p key={i} style={S.rBullet}>{line.replace(/^[-•●]\s*/,"")}</p>;
              return <p key={i} style={S.rText}>{line}</p>;
            })}
          </div>
          <div style={S.resultActions}>
            <button onClick={handleCopyGuide} style={S.mainBtn}>Показать гайд для партнёра</button>
            <button onClick={handleRestart} style={S.ghostBtn}>Пройти заново</button>
          </div>
          <div style={S.nextSteps}>
            <p style={S.nextTitle}>Что дальше?</p>
            <div style={S.step}><span style={S.stepDot}>1</span><span style={S.stepLabel}>Нажми кнопку выше — скопируй гайд и отправь партнёру</span></div>
            <div style={S.step}><span style={S.stepDot}>2</span><span style={S.stepLabel}>Скинь ссылку на тест — пусть тоже пройдёт и пришлёт свой гайд тебе</span></div>
            <p style={S.stepNote}>Так у каждого будет гайд друг к другу</p>
          </div>
        </div>
        {showGuideModal && (
          <div style={S.overlay} onClick={()=>setShowGuideModal(false)}>
            <div style={S.modal} onClick={e=>e.stopPropagation()}>
              <div style={S.modalHead}>
                <span style={S.modalTitle}>Гайд для партнёра</span>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={handleModalCopy} style={S.modalCopyBtn} title="Скопировать">
                    {modalCopied ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                  </button>
                  <button onClick={()=>setShowGuideModal(false)} style={S.modalCloseBtn}>✕</button>
                </div>
              </div>
              <p style={S.modalHint}>{modalCopied ? "✓ Скопировано! Отправь партнёру" : "Нажми иконку копирования или выдели вручную"}</p>
              <textarea readOnly value={getGuideBlock()} style={S.modalTA} onFocus={e=>e.target.select()}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ─── QUIZ ───
  const cardCls = cardAnim==="enter-left"?"slideInLeft":cardAnim==="enter-right"?"slideInRight":cardAnim==="exit-left"?"slideOutLeft":cardAnim==="exit-right"?"slideOutRight":"";

  return (
    <div style={S.page}><Particles/>
      <div style={S.quizWrap}>
        <div style={S.progressRow}>
          <div style={S.progressTrack}><div style={{...S.progressFill, width:`${progress}%`, background:`linear-gradient(90deg,${colors[0]},${colors[1]})`}}/></div>
          <span style={S.progressNum}>{currentQ+1}/{questions.length}</span>
        </div>

        <div className={cardCls} style={S.card}>
          <div style={S.cardTop}>
            <span style={{...S.badge, background:`linear-gradient(135deg,${colors[0]},${colors[1]})`}}>{q.emoji} {q.area}</span>
            <span style={S.qNum}>Вопрос {currentQ+1}</span>
          </div>
          <h2 style={S.question}>{q.q}</h2>
          <textarea ref={textareaRef} value={currentAnswer} onChange={e=>setCurrentAnswer(e.target.value)} onKeyDown={handleKeyDown} placeholder="Напиши как есть, без фильтра..." style={S.textarea}/>
        </div>

        <div style={S.navRow}>
          <button onClick={handleBack} disabled={currentQ===0} style={{...S.navBack, opacity:currentQ===0?0.25:1}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={handleNext} disabled={!currentAnswer.trim()} style={{...S.navNext, background:currentAnswer.trim()?`linear-gradient(135deg,${colors[0]},${colors[1]})`:"rgba(255,255,255,0.06)", color:currentAnswer.trim()?"#fff":"rgba(255,255,255,0.25)"}}>
            {currentQ===questions.length-1 ? "Получить профиль ✦" : "Дальше"}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div style={S.areaMap}>
          {questions.map((qq,i) => <div key={i} style={{
            width:8,height:8,borderRadius:"50%",
            background:i<currentQ?areaColors[qq.area][0]:i===currentQ?"#fff":"rgba(255,255,255,0.12)",
            transition:"all 0.3s", transform:i===currentQ?"scale(1.4)":"scale(1)",
          }}/>)}
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ───
const S = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(140deg,#0f0515 0%,#1a0a2e 25%,#16213e 50%,#0f0515 100%)", padding:20, fontFamily:"'DM Sans','SF Pro Display',-apple-system,sans-serif", position:"relative", overflow:"hidden" },
  introWrap: { position:"relative", zIndex:1, maxWidth:440, width:"100%" },
  introGlow: { position:"absolute", top:"-40%", left:"-20%", width:"140%", height:"140%", background:"radial-gradient(ellipse,rgba(232,67,147,0.12) 0%,rgba(108,92,231,0.08) 40%,transparent 70%)", pointerEvents:"none", borderRadius:"50%" },
  introCard: { position:"relative", padding:"52px 40px 40px", borderRadius:28, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(40px)", textAlign:"center" },
  heartWrap: { marginBottom:20, animation:"heartPulse 2s ease-in-out infinite", display:"flex", justifyContent:"center" },
  introTitle: { fontSize:34, fontWeight:800, color:"#fff", lineHeight:1.15, margin:"0 0 14px", letterSpacing:"-0.5px" },
  introSub: { fontSize:15, color:"rgba(255,255,255,0.55)", lineHeight:1.6, margin:"0 0 36px" },
  inputWrap: { marginBottom:16 },
  nameInput: { width:"100%", padding:"16px 20px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:16, outline:"none", boxSizing:"border-box", transition:"border-color 0.3s,box-shadow 0.3s", fontFamily:"inherit" },
  startBtn: { width:"100%", padding:"17px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#ff6b6b,#ee5a24,#e84393)", backgroundSize:"200% 200%", animation:"gradientShift 4s ease infinite", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:"inherit", boxShadow:"0 4px 24px rgba(232,67,147,0.25)" },
  disclaimer: { fontSize:11, color:"rgba(255,255,255,0.28)", marginTop:24, lineHeight:1.5 },

  quizWrap: { position:"relative", zIndex:1, maxWidth:540, width:"100%" },
  progressRow: { display:"flex", alignItems:"center", gap:14, marginBottom:28 },
  progressTrack: { flex:1, height:3, borderRadius:3, background:"rgba(255,255,255,0.08)", overflow:"hidden" },
  progressFill: { height:"100%", borderRadius:3, transition:"width 0.5s cubic-bezier(0.16,1,0.3,1)" },
  progressNum: { fontSize:13, color:"rgba(255,255,255,0.4)", fontVariantNumeric:"tabular-nums", minWidth:44 },

  card: { padding:"40px 36px 32px", borderRadius:24, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(30px)", marginBottom:16 },
  cardTop: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 },
  badge: { padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, color:"#fff", letterSpacing:"0.3px" },
  qNum: { fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:500 },
  question: { fontSize:21, fontWeight:700, color:"#fff", lineHeight:1.4, margin:"0 0 28px" },
  textarea: { width:"100%", minHeight:130, padding:"18px 20px", borderRadius:16, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#f0eaec", fontSize:15, lineHeight:1.65, resize:"vertical", outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.3s,box-shadow 0.3s" },

  navRow: { display:"flex", gap:10 },
  navBack: { width:50, height:50, borderRadius:14, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.5)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" },
  navNext: { flex:1, height:50, borderRadius:14, border:"none", fontSize:15, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.3s", fontFamily:"inherit", boxShadow:"0 4px 20px rgba(0,0,0,0.2)" },

  areaMap: { display:"flex", justifyContent:"center", gap:6, marginTop:28, flexWrap:"wrap" },

  loadingWrap: { position:"relative", zIndex:1, textAlign:"center" },
  loadingOrb: { width:80, height:80, margin:"0 auto 32px", position:"relative" },
  orbInner: { width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#ff6b6b,#e84393)", position:"absolute", top:20, left:20, animation:"orbPulse 1.5s ease-in-out infinite" },
  orbRing: { width:80, height:80, borderRadius:"50%", border:"2px solid rgba(232,67,147,0.3)", position:"absolute", top:0, left:0, animation:"orbSpin 3s linear infinite" },
  orbRing2: { width:60, height:60, borderRadius:"50%", border:"1px solid rgba(108,92,231,0.25)", position:"absolute", top:10, left:10, animation:"orbSpin 2s linear infinite reverse" },
  loadingText: { fontSize:17, color:"rgba(255,255,255,0.7)", fontWeight:500, margin:"0 0 20px", animation:"fadeInOut 2.5s ease-in-out infinite" },
  loadingBar: { width:200, height:3, borderRadius:3, background:"rgba(255,255,255,0.06)", margin:"0 auto", overflow:"hidden" },
  loadingFill: { width:"30%", height:"100%", borderRadius:3, background:"linear-gradient(90deg,#ff6b6b,#e84393)", animation:"loadSlide 1.5s ease-in-out infinite" },

  resultWrap: { position:"relative", zIndex:1, maxWidth:620, width:"100%", animation:"fadeUp 0.6s ease" },
  resultCard: { borderRadius:24, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(30px)", overflow:"hidden" },
  resultHead: { padding:"28px 36px", display:"flex", alignItems:"center", gap:14, background:"linear-gradient(135deg,rgba(255,107,107,0.12),rgba(232,67,147,0.08))", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  resultTitle: { fontSize:20, fontWeight:800, color:"#fff", margin:0 },
  resultBody: { padding:"32px 36px" },
  divider: { height:1, margin:"28px 0", background:"linear-gradient(90deg,transparent,rgba(255,107,107,0.3),rgba(232,67,147,0.3),transparent)" },
  rHead: { fontSize:14, fontWeight:800, color:"#ff6b6b", margin:"24px 0 10px", letterSpacing:"0.5px" },
  rBullet: { fontSize:14, color:"rgba(255,255,255,0.72)", lineHeight:1.65, margin:"5px 0", paddingLeft:12, borderLeft:"2px solid rgba(255,107,107,0.2)" },
  rText: { fontSize:14, color:"rgba(255,255,255,0.68)", lineHeight:1.7, margin:"5px 0" },

  resultActions: { padding:"24px 36px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:10 },
  mainBtn: { flex:1, padding:"15px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#ff6b6b,#e84393)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 20px rgba(232,67,147,0.2)", transition:"transform 0.2s" },
  ghostBtn: { padding:"15px 20px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:14, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" },

  nextSteps: { padding:"24px 36px 32px", borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(108,92,231,0.05)" },
  nextTitle: { fontSize:14, fontWeight:800, color:"#fff", margin:"0 0 16px" },
  step: { display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 },
  stepDot: { width:24, height:24, minWidth:24, borderRadius:"50%", background:"linear-gradient(135deg,#ff6b6b,#e84393)", color:"#fff", fontSize:12, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" },
  stepLabel: { fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.5, paddingTop:3 },
  stepNote: { fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:12, textAlign:"center", fontStyle:"italic" },

  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 },
  modal: { maxWidth:520, width:"100%", maxHeight:"80vh", borderRadius:20, background:"rgba(26,10,46,0.95)", border:"1px solid rgba(255,255,255,0.12)", display:"flex", flexDirection:"column", backdropFilter:"blur(40px)" },
  modalHead: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 24px", borderBottom:"1px solid rgba(255,255,255,0.08)" },
  modalTitle: { fontSize:16, fontWeight:800, color:"#fff" },
  modalCopyBtn: { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"7px 9px", cursor:"pointer", color:"rgba(255,255,255,0.5)", display:"flex", alignItems:"center", transition:"all 0.2s" },
  modalCloseBtn: { background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:18, cursor:"pointer", padding:"4px 8px" },
  modalHint: { fontSize:13, color:"#ff6b6b", padding:"14px 24px 0", margin:0 },
  modalTA: { flex:1, margin:"14px 24px 24px", padding:18, borderRadius:14, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#f0eaec", fontSize:14, lineHeight:1.65, resize:"none", outline:"none", minHeight:280, fontFamily:"inherit" },
};

if (typeof document !== "undefined") {
  const css = document.createElement("style");
  css.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
    * { box-sizing:border-box; margin:0; padding:0; }
    @keyframes heartPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
    @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes slideInLeft { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
    @keyframes slideInRight { from{opacity:0;transform:translateX(-60px)} to{opacity:1;transform:translateX(0)} }
    @keyframes slideOutLeft { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-60px)} }
    @keyframes slideOutRight { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(60px)} }
    @keyframes orbPulse { 0%,100%{transform:scale(1);opacity:.8} 50%{transform:scale(1.15);opacity:1} }
    @keyframes orbSpin { to{transform:rotate(360deg)} }
    @keyframes fadeInOut { 0%,100%{opacity:.5} 50%{opacity:1} }
    @keyframes loadSlide { 0%{transform:translateX(-100%)} 50%{transform:translateX(250%)} 100%{transform:translateX(-100%)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes float0 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(30px,-40px)} 66%{transform:translate(-20px,20px)} }
    @keyframes float1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-40px,30px)} 66%{transform:translate(25px,-35px)} }
    @keyframes float2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20px,30px)} 66%{transform:translate(-30px,-25px)} }
    textarea:focus,input:focus { border-color:rgba(232,67,147,0.35)!important; box-shadow:0 0 0 4px rgba(232,67,147,0.08)!important; }
    button:hover { transform:translateY(-1px); }
    button:active { transform:translateY(0) scale(0.98); }
    .slideInLeft { animation:slideInLeft 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
    .slideInRight { animation:slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
    .slideOutLeft { animation:slideOutLeft 0.3s ease forwards; }
    .slideOutRight { animation:slideOutRight 0.3s ease forwards; }
    ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:5px}
  `;
  document.head.appendChild(css);
}