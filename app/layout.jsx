export const metadata = {
  title: '뉴스 클리퍼 | 대홍기획 퍼포먼스팀',
  description: '퍼포먼스 마케팅 · 클라이언트 업종 · AI/GEO 뉴스 자동 수집',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, background: '#0f172a' }}>
        {children}
      </body>
    </html>
  );
}
