# LLM Status

Config-driven LLM provider status viewer for official status sources, with provider, model profile, and timezone selection.

## Local Development

```powershell
npm install --cache .npm-cache
npm run dev -- -p 3000
```

Open `http://localhost:3000`.

## Current Sources

- OpenAI: `https://status.openai.com/api/v2/summary.json`
- Anthropic: `https://status.anthropic.com/api/v2/summary.json`
- Google Cloud incidents: `https://status.cloud.google.com/incidents.json`
