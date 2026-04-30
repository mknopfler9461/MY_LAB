# LLM Status

Config-driven LLM provider status viewer for official status sources, with provider, model profile, and timezone selection.

## Local Development

```powershell
npm install --cache .npm-cache
npm run dev -- -p 3000
```

Open `http://localhost:3000`.

## Current Sources and Rules

- OpenAI: `https://status.openai.com/api/v2/summary.json`
- Anthropic: `https://status.anthropic.com/api/v2/summary.json`
- Google Cloud / Vertex AI incidents: `https://status.cloud.google.com/incidents.json`
- OpenAI ChatGPT peak-hour acknowledgement: `https://help.openai.com/en/articles/9047779-why-is-my-chatgpt-taking-so-long-to-respond`
- Claude peak-hour citation: `https://support.claude.com/en/articles/14063676-claude-march-2026-usage-promotion`

The UI is bilingual in English and Japanese. Peak-hour windows are shown in the selected timezone.
