// Vercel serverless function — proxies chat requests to Anthropic API.
// Set ANTHROPIC_API_KEY, VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET in Vercel env vars.

const STATIC_STUDIO_INFO = `
Studio 1 — Performer (DJ)
- Pioneer AlphaTheta XDJ-AZ (standalone — no laptop needed)
- Beatport Streaming, TIDAL, rekordbox cloud built-in
- 2× Adam T7V studio monitors
- Air conditioning, wheelchair accessible
- Up to 8 people
- £25/hr — 2-hour minimum booking (minimum cost £50)

Studio 2 — Creator (Hybrid DJ + Production)
- Pioneer DDJ-RX3 DJ controller
- Yamaha HS8 studio monitors (production desk) + KRK Rokit RP5 (DJ booth)
- NI Komplete Kontrol M32 keyboard
- Rode NT1 condenser mic + Focusrite Scarlett 4i4 interface
- 2× Beyerdynamic DT 770 headphones, Asus ProArt display
- Bring your own laptop. DAW not provided.
- Up to 4 people
- £35/hr — 2-hour minimum booking (minimum cost £70)

Studio 3 — Pro DJ (Club-standard booth)
- 2× Pioneer CDJ-3000 + 1× CDJ-2000 NXS media players
- Pioneer DJM-A9 mixer
- Pioneer RMX-1000 remix station
- 2× Technics SL-1210 MK2 turntables
- 2× Pioneer VM-80 monitors
- Shure SM58 vocal mic, in-room computer, 4K camera for content recording
- Air conditioning
- Styluses not provided — bring your own for vinyl
- Up to 8 people
- £35/hr — 2-hour minimum booking (minimum cost £70)

Studio 4 — Production (Flagship recording studio)
- Focal SM9 reference monitors
- Neve 1073 microphone preamp
- Universal Audio Apollo 8x interface
- Neumann U87 condenser microphone
- SPL Tube Vitalizer channel strip
- Novation Summit + Korg Minilogue XD synthesisers
- Akai MPC (standalone)
- Acoustically treated, first floor
- £55/hr — 2-hour minimum booking (minimum cost £110)
- Also available: With Engineer from £100/hr | Mix & Master £150/track | Custom Track Production £600–£1,000`;

function buildPromptFromStudios(studios) {
  if (!studios || studios.length === 0) return STATIC_STUDIO_INFO;

  return studios.map(s => {
    const minCost = s.hourlyRate * s.minimumHours;
    let text = `\n${s.name} (${s.tagline})\n`;
    text += `- £${s.hourlyRate}/hr — ${s.minimumHours}-hour minimum booking (minimum cost £${minCost})\n`;
    if (s.capacity) text += `- ${s.capacity}\n`;
    if (s.equipment?.length) {
      s.equipment.forEach(item => { text += `- ${item}\n`; });
    }
    if (s.note) text += `- Note: ${s.note}\n`;
    if (s.services?.length) {
      text += `- Additional services:\n`;
      s.services.forEach(svc => { text += `  • ${svc.name}: ${svc.price} — ${svc.description}\n`; });
    }
    return text;
  }).join('\n');
}

function buildSystemPrompt(studioInfo) {
  return `You are the Studio 808 assistant — a friendly, knowledgeable helper for Studio 808, a professional recording and DJ studio complex in Chelmsford, Essex, UK.

ABOUT STUDIO 808
- Located in Chelmsford city centre, Essex
- Est. 2014 — a decade of music
- 4 fully equipped studios, available to book by the hour online
- Booking site: https://book.studio-808.com
- Smart lock access — no staff needed on site, door code sent automatically after booking
- Payment is required in full at the time of booking to secure the session
- Contact: admin@studio-808.com | WhatsApp: +44 7348 426746

THE STUDIOS
${studioInfo}

BOOKING PROCESS
1. Go to https://book.studio-808.com
2. Select a studio and choose date/time
3. Pay the full session cost online by card (Stripe) — payment is required in full to secure the booking
4. Receive door code automatically by SMS/email — let yourself in

GUIDELINES
- Be concise and friendly — 2–4 sentences per reply for simple questions
- If asked about specific pricing for Studio 4 services, give the ranges above
- If asked something you don't know (e.g. exact availability, custom quotes), suggest contacting admin@studio-808.com or messaging on WhatsApp (+44 7348 426746), or visiting the booking site
- Do not make up information about facilities, pricing, or availability not listed above
- If the user wants to speak to a human or needs help you can't provide, say so warmly and direct them to WhatsApp or email as described in the CONTACTING US section below

CONTACTING US
If a client asks about contacting support, messaging the team, getting in touch, or WhatsApp, always respond:
"You can message us directly on WhatsApp at +44 7348 426746 — we typically respond within a few hours. You can also email admin@studio-808.com."

DOOR CODE / ACCESS CODE QUESTIONS
If a client asks where their door code or access code is, or how to get into the studio, always respond:
"Your door code can be found in your client dashboard at book.studio-808.com/dashboard — log in with the email you used to book and it will be shown under your upcoming booking."
Do not suggest contacting admin for this — the dashboard is always the first answer.

SESSION EXTENSION QUESTIONS
If a client asks about extending their session, booking more time, or staying longer, always respond:
"You can extend your session directly from your client dashboard at book.studio-808.com/dashboard — log in and you'll see the option to extend under your active booking."
Do not suggest contacting admin for this — direct them to the dashboard only.`;
}

// In-memory cache — reuses across warm invocations
let _cachedPrompt = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getSystemPrompt() {
  const now = Date.now();
  if (_cachedPrompt && now - _cacheTime < CACHE_TTL) {
    return _cachedPrompt;
  }

  const projectId = process.env.VITE_SANITY_PROJECT_ID;
  const dataset = process.env.VITE_SANITY_DATASET || 'production';

  if (!projectId) {
    _cachedPrompt = buildSystemPrompt(STATIC_STUDIO_INFO);
    _cacheTime = now;
    return _cachedPrompt;
  }

  try {
    const query = encodeURIComponent(
      `*[_type == "studio"] | order(sortOrder asc) { name, tagline, hourlyRate, minimumHours, capacity, equipment, note, services[] { name, price, description } }`
    );
    const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`Sanity responded ${res.status}`);

    const { result: studios } = await res.json();
    _cachedPrompt = buildSystemPrompt(buildPromptFromStudios(studios));
    _cacheTime = now;
  } catch (err) {
    console.error('[chat] Sanity fetch failed, using static fallback:', err.message);
    _cachedPrompt = buildSystemPrompt(STATIC_STUDIO_INFO);
    _cacheTime = now;
  }

  return _cachedPrompt;
}

export default async function handler(req, res) {
  // CORS — allow the studio-808 website
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[chat] ANTHROPIC_API_KEY not set');
    return res.status(500).json({ error: 'Chat not configured.' });
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required.' });
  }

  try {
    const systemPrompt = await getSystemPrompt();

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: systemPrompt,
        messages,
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      console.error('[chat] Anthropic error:', JSON.stringify(data));
      return res.status(anthropicRes.status).json({ error: data?.error?.message ?? 'AI error' });
    }

    const text = data.content?.[0]?.text ?? '';
    return res.json({ reply: text });
  } catch (err) {
    console.error('[chat] fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to reach AI service.' });
  }
}
