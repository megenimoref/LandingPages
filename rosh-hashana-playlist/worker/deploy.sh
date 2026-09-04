#!/usr/bin/env bash
# Deploy the paskol-form Worker end to end.
#
#   ./deploy.sh
#
# Requires Cloudflare auth, either:
#   npx wrangler login                       (browser OAuth, once)
# or:
#   export CLOUDFLARE_API_TOKEN=...          (Workers Scripts:Edit + Workers KV Storage:Edit)
#
# Idempotent: re-running reuses the existing KV namespace.

set -euo pipefail
cd "$(dirname "$0")"

WRANGLER="npx --yes wrangler@4"

echo "==> checking auth"
$WRANGLER whoami

echo "==> ensuring KV namespace DEDICATIONS"
# `kv namespace list` returns JSON; find ours by title (wrangler names it <worker>-<binding>).
KV_ID=$($WRANGLER kv namespace list 2>/dev/null \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      try{const j=JSON.parse(s.slice(s.indexOf("[")));
        const n=j.find(x=>/DEDICATIONS/i.test(x.title));
        process.stdout.write(n?n.id:"");}catch(e){process.stdout.write("");}})' || true)

if [ -z "$KV_ID" ]; then
  echo "    creating…"
  OUT=$($WRANGLER kv namespace create DEDICATIONS)
  echo "$OUT"
  KV_ID=$(printf '%s' "$OUT" | grep -oE '[0-9a-f]{32}' | head -1)
fi

if [ -z "$KV_ID" ]; then
  echo "!! could not determine the KV namespace id — paste it into wrangler.toml by hand" >&2
  exit 1
fi
echo "    KV id: $KV_ID"

echo "==> writing id into wrangler.toml"
node -e '
  const fs=require("fs"), f="wrangler.toml";
  const s=fs.readFileSync(f,"utf8").replace(/^id = ".*"$/m, `id = "${process.argv[1]}"`);
  fs.writeFileSync(f,s);
' "$KV_ID"

echo "==> ADMIN_TOKEN"
if $WRANGLER secret list 2>/dev/null | grep -q ADMIN_TOKEN; then
  echo "    already set, leaving it alone"
else
  echo "    set it with:  npx wrangler@4 secret put ADMIN_TOKEN"
fi

echo "==> deploying"
$WRANGLER deploy

cat <<'EOF'

Done. Take the URL printed above and put it in ../index.html:

    const CONFIG = {
      endpoint: 'https://<that-url>/api/dedication',
      ...
    };

Then reload the page and send one test dedication.
EOF
