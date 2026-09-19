# Deploy — the VPS site

Server: zetta (`ssh zetta`, the CI SSH port). App dir `/var/www/alexa-plus`,
pm2 name `alexa-plus`, **port 3029** (first free after 3028 in nginx, checked 2026-09-20).
Workflow: `.github/workflows/deploy.yml` (house pattern from zetta-claims-web: server pulls +
builds, `.env` is server-owned, health check on `/health`). Process: `ecosystem.config.cjs`.

## State on 2026-09-20

- ✅ `/var/www/alexa-plus` cloned at `7eaab71`, `.env` written on the server (MCP_TOKEN generated
  there, `chmod 600`), built, **pm2 `alexa-plus` online on 3029**, `/health` OK.
- ✅ DNS: `alexa.zettabyteincorp.com` A + AAAA → this server (`~/scripts/dns.sh add alexa`), resolving.
- ✅ **Sim too:** pm2 `alexa-plus-sim` on **3030** (Next standalone, `AGENT=scripted` until a
  `GEMINI_API_KEY` is in `.env`), `/api/agent` answers through the MCP server, static files 200.
- ⏳ **nginx + TLS — Joy, needs the sudo password.** The sim is the site root and the MCP server is
  `/mcp`, so ONE domain: run the script for the sim, then add the `/mcp` location by hand:
  `sudo /var/www/server/scripts/new-site.sh alexa-plus alexa.zettabyteincorp.com 3030 --type next --no-www`
  then in `/etc/nginx/sites-available/alexa-plus` add, inside the `server` block:
  `location /mcp { proxy_pass http://127.0.0.1:3029/mcp; proxy_http_version 1.1; proxy_set_header Host $host; proxy_buffering off; proxy_read_timeout 300; }`
  and `location /health { proxy_pass http://127.0.0.1:3029/health; }` — `sudo nginx -t && sudo systemctl reload nginx`.
- ⏳ **CI key — Joy.** The classifier refused authorising a new key on the server. Either reuse
  the deploy key the other eight repos use as the `SSH_KEY` secret of `joyahmed/alexa-plus`, or
  make a dedicated ed25519 key, authorise its public half for `joy` on the server, and set the
  private half as that secret. Until then a push to `main` fails at "Set up SSH" (harmless) and
  the server is redeployed by hand: `cd /var/www/alexa-plus && git pull && pnpm install
  --frozen-lockfile && pnpm build && pm2 startOrRestart ecosystem.config.cjs --update-env`
  (with `.env` exported and nvm's node 24.11.1 on PATH).

## First-time setup (reference — step 1 and DNS are done)

```bash
# 1. clone + .env + first start, no sudo needed
ssh zetta
export PATH=/home/joy/.nvm/versions/node/v24.11.1/bin:$PATH
cd /var/www && git clone git@github.com:joyahmed/alexa-plus.git && cd alexa-plus
printf 'MCP_TOKEN=%s\nPROPERTY_ID=lakeview\nDB_PATH=/var/www/alexa-plus/data/house.sqlite\n' "$(openssl rand -hex 24)" > .env && chmod 600 .env
pnpm install --frozen-lockfile && pnpm build
set -a; . ./.env; set +a; pm2 startOrRestart ecosystem.config.cjs --update-env && pm2 save
node -e "fetch('http://127.0.0.1:3029/health').then(r=>r.json()).then(console.log)"

# 2. nginx + TLS (+ DNS via --dns) — the one sudo line. Subdomain is Joy's pick; assumed:
sudo /var/www/server/scripts/new-site.sh alexa-plus alexa.zettabyteincorp.com 3029 --type api --dns

# 3. CI key — the same deploy key the other eight repos use (repo secret SSH_KEY)
gh secret set SSH_KEY --repo joyahmed/alexa-plus
```

After that every push to `main` deploys. Endpoint for judges / Alexa+:
`https://alexa.zettabyteincorp.com/mcp` with `Authorization: Bearer <MCP_TOKEN from .env>`.

The MCP_TOKEN in `.env` is the one value to hand to Alexa+ / the sim / the Devpost testing
instructions. Rotate by editing `.env` and `pm2 restart alexa-plus --update-env`.
