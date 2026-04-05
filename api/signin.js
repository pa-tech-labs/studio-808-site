// Vercel serverless function — signs in via Supabase and returns tokens.
// Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel environment variables.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabaseUrl  = process.env.SUPABASE_URL
  const supabaseAnon = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnon) {
    console.error('[signin] SUPABASE_URL or SUPABASE_ANON_KEY not set')
    return res.status(500).json({ error: 'Auth not configured.' })
  }

  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    const authRes = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey: supabaseAnon,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      },
    )

    const data = await authRes.json()

    if (!authRes.ok) {
      // Surface the Supabase error message to the client
      return res.status(authRes.status).json({
        error: data?.error_description ?? data?.msg ?? 'Invalid email or password.',
      })
    }

    return res.json({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
    })
  } catch (err) {
    console.error('[signin] fetch error:', err.message)
    return res.status(500).json({ error: 'Sign in failed. Please try again.' })
  }
}
