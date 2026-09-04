# paskol-form — Cloudflare Worker

Receives the dedications submitted on
`/rosh-hashana-playlist/` and stores them in Cloudflare KV.
Replaces the embedded Google Form used by the older landing pages.

## Endpoints

| Method | Path               | Purpose                                                |
| ------ | ------------------ | ------------------------------------------------------ |
| `POST` | `/api/dedication`  | Accepts one dedication as JSON. CORS-locked to our origins. |
| `GET`  | `/api/export`      | NDJSON dump of every dedication. Requires `?token=$ADMIN_TOKEN`. |

Origins allowed to POST are hard-coded in `src/index.js` (`ALLOWED_ORIGINS`):
`https://megenimoref.github.io` plus localhost for development.

## Data stored

One KV key per submission, `ded:<ISO timestamp>:<random>`:

```json
{
  "id": "ded:2026-09-04T09:41:02.117Z:1a2b3c4d",
  "soldier": "…", "phone": "…", "unit": "…",
  "song": "…", "link": "…", "msg": "…",
  "sender": "…", "senderPhone": "…",
  "campaign": "rosh-hashana-5787",
  "receivedAt": "2026-09-04T09:41:02.117Z",
  "country": "IL"
}
```

Rate limiting: max 8 submissions per IP per hour (`rl:` keys, 2h TTL).

## Deploy

```bash
cd rosh-hashana-playlist/worker
npx wrangler login                          # or: export CLOUDFLARE_API_TOKEN=...
npx wrangler kv namespace create DEDICATIONS   # paste the id into wrangler.toml
npx wrangler secret put ADMIN_TOKEN            # any long random string
npx wrangler deploy
```

`wrangler deploy` prints the live URL, e.g.
`https://paskol-form.<account>.workers.dev`.

## Wire the page to it

In `../index.html`, set the endpoint at the top of the script block:

```js
const CONFIG = {
  endpoint: 'https://paskol-form.<account>.workers.dev/api/dedication',
  ...
};
```

Until that value is filled in, the form validates normally but tells the
visitor it is not connected yet — it never silently drops a dedication.

### Optional: custom hostname

To serve it from `paskol.oref-main.com` instead of `workers.dev`, uncomment the
`[[routes]]` block in `wrangler.toml` and redeploy. Worker routes attach at the
edge — this does **not** go through the `oref-main` cloudflared tunnel and needs
no DNS CNAME to `cfargotunnel.com`.

## Reading the dedications

```bash
curl "https://paskol-form.<account>.workers.dev/api/export?token=$ADMIN_TOKEN" > dedications.ndjson
```

or from the Cloudflare dashboard: **Workers & Pages → KV → DEDICATIONS**.
