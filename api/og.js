export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://bskhnhjtsaqnavuesbfc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJza2huaGp0c2FxbmF2dWVzYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MjUwMDksImV4cCI6MjA5NjEwMTAwOX0.-7GYNqBItBmwALCMmjrcIkHtzHznmG6ZQ2J29w7jmNc';

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';

  let title = '퀴즈캣 - 나만의 퀴즈 플랫폼';
  let description = '퀴즈를 만들고, 풀고, 공유하세요!';
  let image = 'https://quizddong.vercel.app/og-image.png';
  const quizUrl = id
    ? `https://quizddong.vercel.app/quiz/${id}`
    : 'https://quizddong.vercel.app/';

  if (id) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/quizzes?select=title,description,thumb,category&id=eq.${id}&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      if (data?.[0]) {
        const q = data[0];
        title = `${q.title || '퀴즈'} - 퀴즈캣`;
        description = q.description || `${q.category || '퀴즈'} · 퀴즈캣에서 풀어보세요!`;
        if (q.thumb && q.thumb.startsWith('http')) image = q.thumb;
      }
    } catch (_) {}
  }

  const html = `<!DOCTYPE html><html lang="ko"><head>
<meta charset="UTF-8">
<meta property="og:type" content="website">
<meta property="og:site_name" content="퀴즈캣">
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:image" content="${e(image)}">
<meta property="og:url" content="${e(quizUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(title)}">
<meta name="twitter:description" content="${e(description)}">
<meta name="twitter:image" content="${e(image)}">
<title>${e(title)}</title>
<script>location.replace("${e(quizUrl)}")<\/script>
</head><body></body></html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function e(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
