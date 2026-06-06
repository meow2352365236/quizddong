// Vercel Edge Function: /api/og?id=q_xxx
// Fetches quiz info from Supabase and returns HTML with dynamic OG tags,
// then redirects the browser to the SPA (index.html) via meta refresh.
// Discord/bots read OG tags before JS runs — this gives them quiz info.

const SUPABASE_URL = 'https://bskhnhjtsaqnavuesbfc.supabase.co';
// Public anon key (read-only) — replace with your actual anon key
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';

  // User agents that need OG tags (bots/crawlers)
  const ua = req.headers.get('user-agent') || '';
  const isBot = /discord|twitterbot|facebookexternalhit|whatsapp|telegram|slack|kakaotalk|linkedin|googlebot/i.test(ua);

  // For real browsers: just serve index.html
  if (!isBot && id) {
    return new Response(null, {
      status: 302,
      headers: { Location: `/?quiz=${id}` },
    });
  }

  let title = '퀴즈캣 - 나만의 퀴즈 플랫폼';
  let description = '퀴즈를 만들고, 풀고, 공유하세요!';
  let image = 'https://quizddong.vercel.app/og-image.png';
  let url = `https://quizddong.vercel.app/quiz/${id}`;

  if (id) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/quizzes?select=title,description,thumb,category&id=eq.${id}`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      if (data && data[0]) {
        const q = data[0];
        title = `${q.title || '퀴즈'} - 퀴즈캣`;
        description = q.description || `${q.category || ''} 퀴즈 · 퀴즈캣에서 풀어보세요!`;
        if (q.thumb) image = q.thumb;
      }
    } catch (e) {
      // fallback to defaults
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="퀴즈캣">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:url" content="${esc(url)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <meta http-equiv="refresh" content="0;url=${esc(url)}">
  <title>${esc(title)}</title>
</head>
<body>
  <script>location.replace("${esc(url)}")</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
