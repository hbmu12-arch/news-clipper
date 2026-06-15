import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { query, today } = await request.json();

  const prompt =
    `오늘(${today}) 기준 최근 2일 내 ${query} 뉴스를 검색해서 2건을 ` +
    `아래 JSON 형식으로만 응답해. 마크다운 코드블록 없이 순수 JSON만:\n` +
    `{"items":[{"title":"뉴스 제목","body":"2~3문장 단락. 핵심 사실과 수치 포함. 문장 끝에 (출처명) 표기."}]}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-03-05',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return NextResponse.json(
      { error: err.error?.message || `Anthropic API 오류 ${response.status}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  const raw = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  try {
    const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json({ items: parsed.items || [] });
  } catch {
    return NextResponse.json({ items: [{ title: '검색 결과', body: raw }] });
  }
}
