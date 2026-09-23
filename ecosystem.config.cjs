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
      env: { NODE_ENV: 'production', PORT: 3029, SEED: '1', RESEED_HOURS: '6' },
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
      // The model keys are named here rather than left to inherit from the deploy shell.
      // `pm2 startOrRestart --update-env` does not reliably refresh the environment of a process
      // that is already running: GROQ_API_KEY was added to .env, the deploy sourced it, and the
      // sim still came up without it and answered from the scripted agent. Only a manual
      // `pm2 restart --update-env` picked it up. Listing them makes what the app needs explicit,
      // and a conditional spread keeps an absent key absent rather than the string "undefined".
      env: {
        NODE_ENV: 'production',
        PORT: 3030,
        HOSTNAME: '127.0.0.1',
        MCP_URL: 'http://127.0.0.1:3029/mcp',
        ...(process.env.MCP_TOKEN ? { MCP_TOKEN: process.env.MCP_TOKEN } : {}),
        ...(process.env.GROQ_API_KEY ? { GROQ_API_KEY: process.env.GROQ_API_KEY } : {}),
        ...(process.env.GROQ_MODEL ? { GROQ_MODEL: process.env.GROQ_MODEL } : {}),
        ...(process.env.GEMINI_API_KEY ? { GEMINI_API_KEY: process.env.GEMINI_API_KEY } : {}),
        ...(process.env.GEMINI_MODEL ? { GEMINI_MODEL: process.env.GEMINI_MODEL } : {}),
        ...(process.env.AGENT ? { AGENT: process.env.AGENT } : {}),
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '400M',
    },
  ],
};
