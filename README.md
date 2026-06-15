# 📰 뉴스 클리퍼 — 대홍기획 퍼포먼스팀

퍼포먼스 마케팅 · 클라이언트 업종 · AI/GEO 뉴스 자동 수집 도구

---

## 🚀 Vercel 배포 방법 (5분)

### 1단계 — Anthropic API 키 발급
1. https://console.anthropic.com 접속
2. **API Keys** → **Create Key** → 복사

### 2단계 — GitHub에 올리기
```bash
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/YOUR_ID/news-clipper.git
git push -u origin main
```

### 3단계 — Vercel 배포
1. https://vercel.com 접속 (GitHub 로그인)
2. **Add New Project** → 방금 올린 레포 선택
3. **Environment Variables** 탭에서 추가:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (1단계에서 복사한 키)
4. **Deploy** 클릭

→ 배포 완료 후 팀원들과 URL 공유하면 끝!

---

## 💻 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일 열어서 API 키 입력

# 개발 서버 실행
npm run dev
# http://localhost:3000 접속
```

---

## 📁 파일 구조

```
news-clipper/
├── app/
│   ├── layout.jsx          # 페이지 레이아웃
│   ├── page.jsx            # 메인 뉴스클리퍼 UI
│   └── api/news/route.js   # Anthropic API 프록시 (API 키 보호)
├── .env.local.example      # 환경변수 예시
├── next.config.js
└── package.json
```

---

## ⚙️ 커스터마이징

**클라이언트 기본값 변경** → `app/page.jsx`의 `DEF_CLIENTS` 수정

**검색 카테고리 변경** → `MKT_CATS` / `AI_CATS` 수정
