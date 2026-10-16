# Studio 808 Voice: going live on voice.studio-808.com

Studio 808 Voice (formerly 808 Audio) is served by the studio-808-site Vercel
project on its own host, `voice.studio-808.com`. The old name,
`audio.studio-808.com`, answers 301 to the same path on voice. On the main
site, `/audio` keeps serving until `AUDIO_SUBDOMAIN_LIVE` is turned on, and
then 301s to voice too.

This runbook replaces the one in PR #18 (written for audio.studio-808.com).
Do the steps in order.

## 1. Sanity CORS (before DNS)

The page reads its content from Sanity in the browser. Sanity refuses origins
it does not know (HTTP 403), and the page then behaves as if it were switched
off and sends visitors to www.

sanity.io/manage, project `riowycjq`, API, CORS origins, add:

| Origin | Allow credentials |
|---|---|
| `https://voice.studio-808.com` | off |

`https://audio.studio-808.com` does not need adding: that host only ever
redirects.

## 2. DNS records (for Damien)

At the DNS host for studio-808.com:

| Type | Name / host | Value | TTL |
|---|---|---|---|
| CNAME | `voice` | `cname.vercel-dns.com` | 3600, or the provider's default |
| CNAME | `audio` | `cname.vercel-dns.com` | 3600, or the provider's default |

`voice` serves the site. `audio` only carries the 301 from the old name, so
links that went out as audio.studio-808.com never 404. If Vercel shows a
different CNAME target when a domain is added (newer projects sometimes get a
project-specific `*.vercel-dns-0xx.com`), use the value Vercel shows. No
other record changes.

## 3. Vercel domains

studio-808-site, Settings, Domains, Add, once for each:

- `voice.studio-808.com`: connect to Production (branch `main`), no redirect.
- `audio.studio-808.com`: connect to Production (branch `main`), **no
  redirect in the dashboard**. vercel.json already answers every path on this
  host with a 301 to the same path on voice; a dashboard redirect would send
  everything to the home page instead.

Wait for "Valid Configuration" on both. Vercel issues the certificates.

## 4. Environment variables (Vercel, Production)

| Name | Value | When |
|---|---|---|
| `AUDIO_SUBDOMAIN_LIVE` | `true` | Once voice.studio-808.com works (step 6). Turns on the www and apex `/audio` 301 to voice. Leave unset until then. Like every env var it only reaches new deployments: redeploy production after setting it. |
| `AUDIO_ENQUIRY_TO` | where enquiries go | Already set. |
| `AUDIO_ENQUIRY_CC` | optional | Already set, if used. |
| `AUDIO_ENQUIRY_FROM` | optional | Leave unset to use the default `Studio 808 Voice <voice@send.studio-808.com>`. If it is set to the old `808 Audio <audio@send.studio-808.com>`, update or remove it. |

The variable names keep "AUDIO": they are identifiers, and renaming them would
silently drop values already set. Env var changes apply to new deployments
only: redeploy production after any change (Deployments, latest production
deployment, Redeploy).

## 5. Sanity content

One published field still says the old name. In Studio, 808 Audio page,
Footer:

- Company line: `808 Audio is a service of Studio 808 Ltd` to
  `Studio 808 Voice is a service of Studio 808 Ltd`.

Leave the SEO "Canonical URL" field empty: on voice.studio-808.com the
canonical comes from the host. (The desk still shows "808 Audio" as the folder
and document name; those are content-model identifiers and stay.)

## 6. Verify with curl

```bash
# Old name: 301 to the same path on voice
curl -sI https://audio.studio-808.com/ | grep -iE "^HTTP|^location"
curl -sI https://audio.studio-808.com/terms | grep -iE "^HTTP|^location"

# Prerendered meta on voice: real title, canonical and og tags in the raw HTML (no JS)
curl -s https://voice.studio-808.com/ | grep -oE '<title[^>]*>[^<]*</title>|rel="canonical" href="[^"]*"|property="og:(title|url|image|site_name)" content="[^"]*"'
curl -s https://voice.studio-808.com/terms | grep -oE '<title[^>]*>[^<]*</title>|rel="canonical" href="[^"]*"'
curl -s https://voice.studio-808.com/ | grep -c 'application/ld+json'   # 1

# Sitemap and robots: voice's own
curl -s https://voice.studio-808.com/sitemap.xml
curl -s https://voice.studio-808.com/robots.txt
curl -s https://www.studio-808.com/sitemap.xml | grep -c '/audio'        # 0

# Headers (autoplay allowed for the player) and the 404
curl -sI https://voice.studio-808.com/ | grep -iE "permissions-policy|strict-transport|x-content-type"
curl -s -o /dev/null -w "%{http_code}\n" https://voice.studio-808.com/dj-studio   # 404

# The header wordmark image: 200 on voice and on www (it is a file, never redirected)
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://voice.studio-808.com/audio/studio-808-wordmark.png   # 200 image/png
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://www.studio-808.com/audio/studio-808-wordmark.png     # 200 image/png

# Enquiry API: other origins refused (403); the form itself is the real test
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Origin: https://example.com" -H "Content-Type: application/json" -d '{}' https://voice.studio-808.com/api/audio-enquiry

# www /audio: 200 until AUDIO_SUBDOMAIN_LIVE=true (and a redeploy), then
# 301 with location https://voice.studio-808.com/ and .../terms
curl -sI https://www.studio-808.com/audio | grep -iE "^HTTP|^location"
curl -sI https://www.studio-808.com/audio/terms | grep -iE "^HTTP|^location"
```

### How the www /audio 301 works, and what to check if it does not fire

`middleware.ts` (Vercel Routing Middleware) owns www and apex `/audio`: a 301
to voice when `AUDIO_SUBDOMAIN_LIVE` is `true`, otherwise a rewrite to the app
shell. Vercel places the middleware after vercel.json's own `routes`, just
before the filesystem, so **vercel.json must have no rule that ends a www or
apex `/audio` request**. One did until fix/808-voice-redirect, and the 301
never fired. `tests/vercelRoutes.test.js` now fails if such a rule comes back.

If `curl` still shows 200 with the flag on:
1. Check the flag is on the deployment that is live: in Vercel, Deployments,
   open the current production deployment, Environment Variables. If it was
   set after that deployment was built, redeploy.
2. Check the route order Vercel compiled. Locally, with the project linked:
   ```bash
   vercel build --yes && node -e "require('./.vercel/output/config.json').routes.forEach((r,i)=>console.log(i, JSON.stringify(r).slice(0,120)))"
   ```
   The `middlewarePath` rule must come before `{"handle":"filesystem"}`, and
   no rule above it may match `/audio` on www without `continue`.

Then paste https://voice.studio-808.com/ into Slack or WhatsApp, or use
LinkedIn's Post Inspector: the preview should show "Studio 808 Voice" and the
hero image. Send a test enquiry from the form and check the email arrives from
`Studio 808 Voice <voice@send.studio-808.com>` with the subject
`Studio 808 Voice enquiry: ...`.

## 7. Search Console

- Add a **Domain property** for `studio-808.com`, verified by DNS TXT record
  (Damien can add it with the CNAMEs). It covers www, voice and audio.
  Alternatively, a URL-prefix property for `https://voice.studio-808.com/`.
- Sitemaps: submit `https://voice.studio-808.com/sitemap.xml`. Resubmit the
  www sitemap (it lists no /audio paths).
- URL Inspection on `https://voice.studio-808.com/` and `/terms`:
  user-declared canonical equals Google-selected; then Request indexing.
- URL Inspection on `https://audio.studio-808.com/` and, once the flag is on,
  `https://www.studio-808.com/audio`: both should report "Page with redirect".
- Rich Results Test on `/`: LocalBusiness (named Studio 808 Voice), FAQPage
  and VideoObject should validate (video clips need a poster image).
- Watch Page indexing for a week or two while Google follows the 301s.
