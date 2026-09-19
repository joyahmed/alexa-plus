// pm2 process definition for the VPS. Deployed by .github/workflows/deploy.yml; port 3029 is
// registered in nginx by `sudo new-site.sh alexa-plus <domain> 3029 --type api` (server runbook).
module.exports = {
  apps: [
    {
      name: 'alexa-plus',
      // Run node directly, never `pnpm start`: packageManager is pinned, so pnpm under pm2
      // goes through corepack, which tries to download itself and dies (see zetta-claims-web).
      script: 'apps/mcp/dist/server.js',
      cwd: '/var/www/alexa-plus',
      interpreter: '/home/joy/.nvm/versions/node/v24.11.1/bin/node',
      // MCP_TOKEN, PROPERTY_ID and DB_PATH come from /var/www/alexa-plus/.env (server-owned,
      // never written by CI) via --update-env + dotenv-less export in the deploy step.
      env: { NODE_ENV: 'production', PORT: 3029, SEED: '1' },
      watch: false,
      autorestart: true,
      max_memory_restart: '300M',
    },
    {
      // The simulated Alexa+ (Next standalone). nginx serves it at / on the same domain, the MCP
      // server at /mcp. Port 3030 — next free after 3029.
      name: 'alexa-plus-sim',
      script: 'apps/sim/.next/standalone/apps/sim/server.js',
      cwd: '/var/www/alexa-plus',
      interpreter: '/home/joy/.nvm/versions/node/v24.11.1/bin/node',
      env: {
        NODE_ENV: 'production',
        PORT: 3030,
        HOSTNAME: '127.0.0.1',
        MCP_URL: 'http://127.0.0.1:3029/mcp',
        AGENT: process.env.GEMINI_API_KEY ? 'gemini' : 'scripted',
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '400M',
    },
  ],
};
