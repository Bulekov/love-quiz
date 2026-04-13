import { useState, useCallback } from "react";

const questions = [
  { id: 1, area: "Языки любви", q: "Что должен делать партнёр, чтобы ты чувствовал(а) себя любимым?" },
  { id: 2, area: "Языки любви", q: "А как ты сам(а) обычно показываешь любовь?" },
  { id: 3, area: "Конфликты", q: "Что ты делаешь первым делом, когда начинается ссора?" },
  { id: 4, area: "Конфликты", q: "Что тебе нужно от партнёра, чтобы ты успокоился/ась во время ссоры?" },
  { id: 5, area: "Эмоции", q: "Когда тебе плохо — ты говоришь об этом или ждёшь, что заметят?" },
  { id: 6, area: "Эмоции", q: "Когда тебе нужна поддержка — лучше обнять и помолчать, или поговорить и помочь решить?" },
  { id: 7, area: "Стресс", q: "Когда тебе тяжело — ты тянешься к партнёру или хочешь побыть один/одна?" },
  { id: 8, area: "Стресс", q: "Что точно НЕ надо делать, когда ты в стрессе?" },
  { id: 9, area: "Ожидания", q: "Без чего отношения для тебя не работают?" },
  { id: 10, area: "Ожидания", q: "Что для тебя неприемлемо — из-за чего точно уйдёшь?" },
  { id: 11, area: "Границы", q: "Сколько времени наедине с собой тебе нужно?" },
  { id: 12, area: "Границы", q: "Что ты делаешь, когда партнёр нарушает твои границы?" },
  { id: 13, area: "Привязанность", q: "Что ты чувствуешь и делаешь, когда партнёр отдаляется?" },
  { id: 14, area: "Решения", q: "Как ты себя ведёшь, когда вы не согласны по важному вопросу?" },
  { id: 15, area: "Близость", q: "Насколько тебе важны обнимашки, касания в обычной жизни?" },
  { id: 16, area: "Признание", q: "Как ты понимаешь, что партнёр тебя ценит?" },
  { id: 17, area: "Быт", q: "Что бесит тебя больше всего в быту?" },
  { id: 18, area: "Будущее", q: "Как далеко вперёд ты думаешь про отношения и важно ли, чтобы партнёр думал так же?" },
];

const areaColors = {
  "Языки любви": "#E8475F",
  "Конфликты": "#F28B30",
  "Эмоции": "#6C5CE7",
  "Стресс": "#00B894",
  "Ожидания": "#E17055",
  "Границы": "#0984E3",
  "Привязанность": "#D63031",
  "Решения": "#FDCB6E",
  "Близость": "#E84393",
  "Признание": "#55EFC4",
  "Быт": "#74B9FF",
  "Будущее": "#A29BFE",
};

export default function RelationshipQuiz() {
  const [screen, setScreen] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [slideDir, setSlideDir] = useState("right");

  const progress = ((currentQ) / questions.length) * 100;

  const handleNext = useCallback(() => {
    if (!currentAnswer.trim()) return;
    const newAnswers = { ...answers, [currentQ]: currentAnswer.trim() };
    setAnswers(newAnswers);
    setCurrentAnswer("");
    setSlideDir("right");

    if (currentQ < questions.length - 1) {
      setCurrentQ((p) => p + 1);
    } else {
      generateProfile(newAnswers);
    }
  }, [currentAnswer, currentQ, answers]);

  const handleBack = useCallback(() => {
    if (currentQ > 0) {
      setSlideDir("left");
      setCurrentAnswer(answers[currentQ - 1] || "");
      setCurrentQ((p) => p - 1);
    }
  }, [currentQ, answers]);

  const generateProfile = async (allAnswers) => {
    setScreen("loading");
    setLoading(true);

    const formatted = questions
      .map((q, i) => `[${q.area}] ${q.q}\nОтвет: ${allAnswers[i]}`)
      .join("\n\n");

    const userMessage = `Имя: ${name || "Не указано"}\n\nОтветы на тест:\n\n${formatted}`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Не указано", answers: formatted }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data.text);
      setScreen("result");
    } catch (e) {
      setResult("Произошла ошибка при генерации профиля. Попробуй ещё раз.");
      setScreen("result");
    }
    setLoading(false);
  };

  const cleanText = (text) => {
    return text
      .replace(/\*\*/g, "")
      .replace(/^#{1,3}\s*/gm, "")
      .replace(/^[-•●]\s*/gm, "")
      .replace(/===РАЗДЕЛИТЕЛЬ===/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const getGuideBlock = () => {
    const parts = result.split("===РАЗДЕЛИТЕЛЬ===");
    if (parts.length >= 2) return cleanText(parts[1]);
    // fallback: try to find by keyword
    const idx = result.indexOf("ГАЙД ДЛЯ ПАРТН");
    if (idx !== -1) return cleanText(result.slice(idx));
    return cleanText(result);
  };

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);

  const handleCopyGuide = () => {
    setShowGuideModal(true);
    setModalCopied(false);
  };

  const handleModalCopy = () => {
    const text = getGuideBlock();
    // Try multiple methods
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setModalCopied(true);
        setTimeout(() => setModalCopied(false), 2000);
      }).catch(() => fallbackModalCopy(text));
    } else {
      fallbackModalCopy(text);
    }
  };

  const fallbackModalCopy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 2000);
    } catch (e) {}
    document.body.removeChild(ta);
  };

  const handleRestart = () => {
    setScreen("intro");
    setCurrentQ(0);
    setAnswers({});
    setCurrentAnswer("");
    setResult("");
    setName("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  // ─── INTRO ───
  if (screen === "intro") {
    return (
      <div style={styles.container}>
        <div style={styles.introCard}>
          <div style={styles.logoMark}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8475F" />
                  <stop offset="50%" stopColor="#E84393" />
                  <stop offset="100%" stopColor="#6C5CE7" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path d="M32 56s-2.5-1.8-5.2-4.2C18.4 44.5 8 34.8 8 23.5 8 15.3 14.3 9 22.5 9c4.7 0 7.8 2.2 9.5 4.5C33.7 11.2 36.8 9 41.5 9 49.7 9 56 15.3 56 23.5c0 11.3-10.4 21-18.8 28.3C34.5 54.2 32 56 32 56z" fill="url(#heartGrad)" filter="url(#glow)" />
              <path d="M22 18c-3.3 0-6 2.5-6 5.8 0 1.5.5 2.8 1.3 3.8" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={styles.title}>Узнай себя в отношениях</h1>
          <p style={styles.subtitle}>
            Ответь на 18 вопросов — получи гайд, который объяснит партнёру, как тебя любить.
          </p>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Как тебя зовут?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя"
              style={styles.nameInput}
            />
          </div>
          <button
            onClick={() => setScreen("quiz")}
            style={styles.startBtn}
          >
            Начать тест →
          </button>
          <p style={styles.disclaimer}>
            Это не психодиагностика, а структурированная рефлексия.
            Результат — повод для разговора, не диагноз.
          </p>
        </div>
      </div>
    );
  }

  // ─── LOADING ───
  if (screen === "loading") {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <h2 style={styles.loadingTitle}>Анализирую ответы...</h2>
          <p style={styles.loadingText}>
            Составляю профиль и рекомендации для партнёра
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULT ───
  if (screen === "result") {
    return (
      <div style={styles.container}>
        <div style={styles.resultCard}>
          <div style={styles.resultHeader}>
            <div style={styles.logoMarkSmall}>
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="heartGradSm" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E8475F" />
                    <stop offset="50%" stopColor="#E84393" />
                    <stop offset="100%" stopColor="#6C5CE7" />
                  </linearGradient>
                </defs>
                <path d="M32 56s-2.5-1.8-5.2-4.2C18.4 44.5 8 34.8 8 23.5 8 15.3 14.3 9 22.5 9c4.7 0 7.8 2.2 9.5 4.5C33.7 11.2 36.8 9 41.5 9 49.7 9 56 15.3 56 23.5c0 11.3-10.4 21-18.8 28.3C34.5 54.2 32 56 32 56z" fill="url(#heartGradSm)" />
              </svg>
            </div>
            <h2 style={styles.resultTitle}>
              {name ? `Профиль: ${name}` : "Твой профиль"}
            </h2>
          </div>
          <div style={styles.resultContent}>
            {result.split("\n").map((rawLine, i) => {
              if (rawLine.includes("===РАЗДЕЛИТЕЛЬ===")) {
                return <div key={i} style={styles.blockDivider} />;
              }
              const line = rawLine.replace(/\*\*/g, "").replace(/^#{1,3}\s*/, "").trim();
              if (!line) return <div key={i} style={{ height: 12 }} />;
              if (line === line.toUpperCase() && line.length > 3 && line.length < 80 && /[А-ЯA-Z]/.test(line)) {
                return <h2 key={i} style={styles.rH2}>{line}</h2>;
              }
              if (rawLine.startsWith("- ") || rawLine.startsWith("• ") || rawLine.startsWith("● ")) {
                return <p key={i} style={styles.rBullet}>● {line.replace(/^[-•●]\s*/, "")}</p>;
              }
              return <p key={i} style={styles.rP}>{line}</p>;
            })}
          </div>
          <div style={styles.resultActions}>
            <button onClick={handleCopyGuide} style={styles.copyBtn}>
              Показать гайд для партнёра
            </button>
            <button onClick={handleRestart} style={styles.restartBtn}>
              Заново
            </button>
          </div>
          <div style={styles.instructionBlock}>
            <p style={styles.instructionTitle}>Что дальше?</p>
            <div style={styles.instructionStep}>
              <span style={styles.stepNum}>1</span>
              <span style={styles.stepText}>Нажми кнопку выше — выдели текст и скопируй, отправь партнёру</span>
            </div>
            <div style={styles.instructionStep}>
              <span style={styles.stepNum}>2</span>
              <span style={styles.stepText}>Скинь партнёру ссылку на этот тест — пусть тоже пройдёт и пришлёт тебе свой гайд</span>
            </div>
            <div style={styles.instructionNote}>Так у каждого будет персональный гайд друг к другу</div>
          </div>

          {showGuideModal && (
            <div style={styles.modalOverlay} onClick={() => setShowGuideModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <span style={styles.modalTitle}>Гайд для партнёра</span>
                  <div style={styles.modalHeaderBtns}>
                    <button onClick={handleModalCopy} style={styles.modalCopyBtn} title="Скопировать">
                      {modalCopied ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      )}
                    </button>
                    <button onClick={() => setShowGuideModal(false)} style={styles.modalClose}>✕</button>
                  </div>
                </div>
                <p style={styles.modalHint}>
                  {modalCopied ? "✓ Скопировано! Отправь партнёру" : "Нажми кнопку копирования ↗ или выдели текст вручную"}
                </p>
                <textarea
                  readOnly
                  value={getGuideBlock()}
                  style={styles.modalTextarea}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── QUIZ ───
  const q = questions[currentQ];
  const areaColor = areaColors[q.area] || "#6C5CE7";

  return (
    <div style={styles.container}>
      <div style={styles.quizWrapper}>
        {/* Progress */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
                background: areaColor,
              }}
            />
          </div>
          <span style={styles.progressText}>
            {currentQ + 1} / {questions.length}
          </span>
        </div>

        {/* Card */}
        <div style={styles.card} key={currentQ}>
          <div style={{ ...styles.areaBadge, background: areaColor }}>
            {q.area}
          </div>
          <h2 style={styles.question}>{q.q}</h2>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напиши свой ответ..."
            style={styles.textarea}
            autoFocus
          />
        </div>

        {/* Navigation */}
        <div style={styles.navRow}>
          <button
            onClick={handleBack}
            disabled={currentQ === 0}
            style={{
              ...styles.navBtn,
              opacity: currentQ === 0 ? 0.3 : 1,
            }}
          >
            ← Назад
          </button>
          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            style={{
              ...styles.nextBtn,
              background: currentAnswer.trim() ? areaColor : "#444",
              opacity: currentAnswer.trim() ? 1 : 0.5,
            }}
          >
            {currentQ === questions.length - 1 ? "Получить профиль ✦" : "Дальше →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ───
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, #1a1028 0%, #2a1538 30%, #1e1245 60%, #162040 100%)",
    padding: "20px",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  // Intro
  introCard: {
    maxWidth: 480,
    width: "100%",
    textAlign: "center",
    padding: "48px 36px",
    borderRadius: 24,
    background: "linear-gradient(165deg, rgba(232,71,95,0.15) 0%, rgba(108,92,231,0.12) 50%, rgba(232,67,147,0.1) 100%)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
  },
  logoMark: {
    marginBottom: 16,
    display: "flex",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.6,
    margin: "0 0 32px",
  },
  inputGroup: {
    textAlign: "left",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1,
    display: "block",
    marginBottom: 8,
  },
  nameInput: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
  },
  startBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg, #E8475F, #D63031)",
    color: "#fff",
    fontSize: 17,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.3px",
  },
  disclaimer: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    marginTop: 20,
    lineHeight: 1.5,
  },

  // Quiz
  quizWrapper: {
    maxWidth: 520,
    width: "100%",
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.4s ease, background 0.4s ease",
  },
  progressText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    fontVariantNumeric: "tabular-nums",
    minWidth: 50,
    textAlign: "right",
  },
  card: {
    padding: "36px 32px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    marginBottom: 20,
    animation: "fadeIn 0.3s ease",
  },
  areaBadge: {
    display: "inline-block",
    padding: "5px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    marginBottom: 20,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  question: {
    fontSize: 20,
    fontWeight: 600,
    color: "#fff",
    lineHeight: 1.45,
    margin: "0 0 24px",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    padding: "16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#f0eaec",
    fontSize: 15,
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  navRow: {
    display: "flex",
    gap: 12,
  },
  navBtn: {
    padding: "14px 20px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  nextBtn: {
    flex: 1,
    padding: "14px 20px",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },

  // Loading
  loadingCard: {
    textAlign: "center",
    padding: 48,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#E8475F",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 24px",
  },
  loadingTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: 600,
    margin: "0 0 8px",
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    margin: 0,
  },

  // Result
  resultCard: {
    maxWidth: 600,
    width: "100%",
    borderRadius: 20,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  resultHeader: {
    padding: "28px 32px",
    background: "linear-gradient(135deg, rgba(232,71,95,0.2), rgba(108,92,231,0.15))",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  logoMarkSmall: {
    display: "flex",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
    margin: 0,
  },
  resultContent: {
    padding: "28px 32px",
  },
  rH2: {
    fontSize: 18,
    fontWeight: 700,
    color: "#E8475F",
    margin: "24px 0 12px",
  },
  rH3: {
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
    margin: "18px 0 8px",
  },
  rBullet: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.6,
    margin: "4px 0",
    paddingLeft: 8,
  },
  rP: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.65,
    margin: "4px 0",
  },
  blockDivider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(232,71,95,0.3), rgba(108,92,231,0.3), transparent)",
    margin: "20px 0",
  },
  resultActions: {
    padding: "20px 32px 28px",
    display: "flex",
    gap: 10,
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  copyBtn: {
    flex: 1,
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #E8475F, #D63031)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  restartBtn: {
    padding: "14px 20px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  instructionBlock: {
    padding: "24px 32px 28px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(108,92,231,0.08)",
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 16px",
  },
  instructionStep: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  stepNum: {
    width: 24,
    height: 24,
    minWidth: 24,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #E8475F, #6C5CE7)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.5,
    paddingTop: 2,
  },
  instructionNote: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    marginTop: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modalContent: {
    maxWidth: 520,
    width: "100%",
    maxHeight: "80vh",
    borderRadius: 16,
    background: "#241a32",
    border: "1px solid rgba(255,255,255,0.15)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
  },
  modalHeaderBtns: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  modalCopyBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8,
    padding: "6px 8px",
    cursor: "pointer",
    color: "rgba(255,255,255,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
  },
  modalClose: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    fontSize: 18,
    cursor: "pointer",
    padding: "4px 8px",
  },
  modalHint: {
    fontSize: 13,
    color: "rgba(232,71,95,0.8)",
    padding: "12px 20px 0",
    margin: 0,
  },
  modalTextarea: {
    flex: 1,
    margin: "12px 20px 20px",
    padding: 16,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#f0eaec",
    fontSize: 14,
    lineHeight: 1.6,
    resize: "none",
    outline: "none",
    minHeight: 300,
    fontFamily: "inherit",
  },
};

// Global keyframes
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    textarea:focus {
      border-color: rgba(232,71,95,0.3) !important;
      box-shadow: 0 0 0 3px rgba(232,71,95,0.08) !important;
    }
    input:focus {
      border-color: rgba(232,71,95,0.3) !important;
      box-shadow: 0 0 0 3px rgba(232,71,95,0.08) !important;
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    * { box-sizing: border-box; }
  `;
  document.head.appendChild(styleSheet);
}
