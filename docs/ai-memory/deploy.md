# Deploy — the VPS site

Server: zetta (`ssh zetta`, the CI SSH port). App dir `/var/www/alexa-plus`,
pm2 name `alexa-plus`, **port 3029** (first free after 3028 in nginx, checked 2026-09-20).
Workflow: `.github/workflows/deploy.yml` (house pattern from zetta-claims-web: server pulls +
builds, `.env` is server-owned, health check on `/health`). Process: `ecosystem.config.cjs`.

## First-time setup — Joy runs these once (the assistant's classifier refuses server deploys)

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
