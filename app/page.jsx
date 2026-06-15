'use client';

import { useState } from "react";

const TODAY = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
const TODAY_SHORT = new Date().toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });

const SEARCH_CONFIG = [
  { type: "client",    emoji: "🏢", label: "아웃도어·스포츠 패션", sub: "스노우피크어패럴", q: "한국 아웃도어·스포츠 패션 업종 최신 동향" },
  { type: "client",    emoji: "🏢", label: "여행·레저·리조트",     sub: "하이원리조트",    q: "한국 여행·레저·리조트 업종 최신 동향" },
  { type: "client",    emoji: "🏢", label: "패션·SPA 브랜드",      sub: "유니클로",        q: "한국 패션·SPA 브랜드 업종 최신 동향" },
  { type: "client",    emoji: "🏢", label: "가전 렌탈·구독",       sub: "LG헬로렌탈",      q: "한국 가전 렌탈·구독 서비스 업종 최신 동향" },
  { type: "marketing", emoji: "🔍", label: "SA / 검색광고",        sub: null, q: "한국 네이버 파워링크·검색광고, 구글 SA 업데이트 트렌드" },
  { type: "marketing", emoji: "📱", label: "SNS / 디스플레이",     sub: null, q: "메타 광고, 카카오 광고, YouTube DA 업데이트 성과 트렌드" },
  { type: "marketing", emoji: "📈", label: "퍼포먼스 & 업계",      sub: null, q: "한국 퍼포먼스 마케팅 전략, 디지털 광고 시장 동향" },
  { type: "ai",        emoji: "🧠", label: "AI 검색 & 오버뷰",     sub: null, q: "ChatGPT 검색, Perplexity, 구글 AI 오버뷰, 네이버 AI 검색 동향" },
  { type: "ai",        emoji: "🌐", label: "GEO 전략 & 사례",      sub: null, q: "GEO 생성형 엔진 최적화, AI 인용 마케팅 전략 사례" },
  { type: "ai",        emoji: "🛠", label: "AI 광고 & 솔루션",     sub: null, q: "AI 광고 자동화, LLM 광고 플랫폼, AI 마케팅 솔루션 신규 출시" },
];

const TYPE_STYLE = {
  client:    { badge: "#1e3a8a", accent: "#3b82f6", border: "#1e40af44" },
  marketing: { badge: "#14532d", accent: "#22c55e", border: "#16653444" },
  ai:        { badge: "#4a044e", accent: "#a855f7", border: "#6b21a844" },
};

const TYPE_LABEL = {
  client: "🏢 클라이언트",
  marketing: "📊 마케팅",
  ai: "🤖 AI / GEO",
};

// ─── API: 서버 프록시 경유 ────────────────────────────────────────────────
async function fetchNews(q) {
  const res = await fetch("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: q, today: TODAY }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `서버 오류 ${res.status}`);
  }
  const data = await res.json();
  return data.items || [];
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────
function Spinner({ size = 12, color = "#38bdf8" }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: "2px solid #334155", borderTopColor: color,
      borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0,
    }} />
  );
}

function NewsCard({ card, no }) {
  const s = TYPE_STYLE[card.type];
  return (
    <div style={{
      background: "#1e293b", borderRadius: 14, padding: "16px",
      border: `1px solid ${s.border}`, display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span style={{ background: s.badge, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 5, padding: "3px 8px", letterSpacing: 0.3, whiteSpace: "nowrap" }}>
          {card.emoji} {card.label}
        </span>
        <span style={{ fontSize: 11, color: "#334155", flexShrink: 0 }}>#{no}</span>
      </div>
      {card.sub && (
        <div style={{ fontSize: 10, color: s.accent, fontWeight: 700, letterSpacing: 0.3 }}>{card.sub}</div>
      )}
      <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.5 }}>{card.title}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.8, flex: 1 }}>{card.body}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#1e293b", borderRadius: 14, padding: "16px", border: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: 12 }}>
      {[45, 90, 75, 100, 85].map((w, i) => (
        <div key={i} style={{ height: i === 0 ? 22 : 13, width: `${w}%`, background: "#273548", borderRadius: 4, animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite` }} />
      ))}
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────
export default function NewsDashboard() {
  const [cards, setCards]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [loadingNow, setLoadingNow] = useState("");
  const [progress, setProgress]     = useState(0);
  const [filter, setFilter]         = useState("all");
  const [copied, setCopied]         = useState(false);
  const [err, setErr]               = useState("");

  const runAll = async () => {
    setLoading(true); setCards([]); setErr(""); setProgress(0);
    const result = [];
    try {
      for (let i = 0; i < SEARCH_CONFIG.length; i++) {
        const cfg = SEARCH_CONFIG[i];
        setLoadingNow(`${cfg.emoji} ${cfg.label}`);
        setProgress(Math.round((i / SEARCH_CONFIG.length) * 100));
        const items = await fetchNews(cfg.q);
        items.forEach(item =>
          result.push({ ...item, type: cfg.type, emoji: cfg.emoji, label: cfg.label, sub: cfg.sub, id: `${i}-${Math.random()}` })
        );
        setCards([...result]);
      }
      setProgress(100);
    } catch (e) {
      setErr("⚠️ " + e.message);
    } finally {
      setLoading(false); setLoadingNow("");
    }
  };

  const copyText = () => {
    let no = 0;
    const lines = [`[${TODAY_SHORT} 마케팅 뉴스클리핑]\n`];
    ["client", "marketing", "ai"].forEach(type => {
      const tc = cards.filter(c => c.type === type);
      if (!tc.length) return;
      lines.push(`\n▌ ${TYPE_LABEL[type]}`);
      tc.forEach(c => { no++; lines.push(`\n${no}. ${c.title}\n${c.body}`); });
    });
    lines.push(`\n\n──────────────────\n📌 대홍기획 퍼포먼스팀`);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const filtered = filter === "all" ? cards : cards.filter(c => c.type === filter);
  const counts = {
    all: cards.length,
    client: cards.filter(c => c.type === "client").length,
    marketing: cards.filter(c => c.type === "marketing").length,
    ai: cards.filter(c => c.type === "ai").length,
  };
  let cardNo = 0;

  const FILTERS = [
    { key: "all",       label: "전체" },
    { key: "client",    label: "🏢 클라이언트" },
    { key: "marketing", label: "📊 마케팅" },
    { key: "ai",        label: "🤖 AI / GEO" },
  ];

  return (
    <div style={{ fontFamily: "'Apple SD Gothic Neo','Pretendard',sans-serif", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:.7} }
        button { transition: all .15s; }
        button:hover:not(:disabled) { opacity: .85; }
        * { box-sizing: border-box; }
      `}</style>

      {/* 헤더 */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "14px 20px", position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>📰 뉴스 클리퍼</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>대홍기획 퍼포먼스팀 · {TODAY}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {cards.length > 0 && (
            <button onClick={copyText} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: copied ? "#166534" : "#1e293b", color: copied ? "#4ade80" : "#94a3b8", fontSize: 12, cursor: "pointer" }}>
              {copied ? "✓ 복사됨" : "📋 복사"}
            </button>
          )}
          <button onClick={runAll} disabled={loading} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: loading ? "#1e3a5f" : "linear-gradient(135deg,#0ea5e9,#3b82f6)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {loading ? <><Spinner color="#fff" /> 검색 중</> : "🚀 클리핑 시작"}
          </button>
        </div>
      </div>

      {/* 진행바 */}
      {loading && (
        <div>
          <div style={{ height: 3, background: "#1e293b" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg,#0ea5e9,#3b82f6)", width: `${progress}%`, transition: "width .4s ease" }} />
          </div>
          <div style={{ background: "#162032", padding: "8px 20px", fontSize: 12, color: "#38bdf8", display: "flex", alignItems: "center", gap: 8 }}>
            <Spinner size={11} /> {loadingNow}
            <span style={{ color: "#334155", marginLeft: "auto" }}>{progress}%</span>
          </div>
        </div>
      )}

      {/* 에러 */}
      {err && (
        <div style={{ margin: "12px 20px", background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#fca5a5" }}>
          {err}
        </div>
      )}

      {/* 필터 탭 */}
      {cards.length > 0 && (
        <div style={{ padding: "14px 20px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${filter === f.key ? "#334155" : "transparent"}`, background: filter === f.key ? "#334155" : "none", color: filter === f.key ? "#fff" : "#64748b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              {f.label}
              <span style={{ background: "#0f172a", borderRadius: 10, padding: "0 6px", fontSize: 10, color: "#64748b" }}>{counts[f.key]}</span>
            </button>
          ))}
        </div>
      )}

      {/* 그리드 */}
      <div style={{ padding: "16px 20px 40px" }}>
        {!loading && cards.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 80, color: "#334155" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📰</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "#475569" }}>클리핑을 시작하세요</div>
            <div style={{ fontSize: 13, color: "#334155" }}>
              "클리핑 시작"을 누르면 10개 카테고리 뉴스가<br />카드로 표시됩니다
            </div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {loading && cards.length === 0 && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          {filtered.map(card => {
            cardNo++;
            return <NewsCard key={card.id} card={card} no={cardNo} />;
          })}
        </div>
        {loading && cards.length > 0 && (
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Spinner size={11} /> 나머지 카테고리 검색 중...
          </div>
        )}
      </div>
    </div>
  );
}
