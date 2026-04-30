const claudeMarch2026Promotion = {
  title: "Claude March 2026 usage promotion",
  sourceUrl: "https://support.claude.com/en/articles/14063676-claude-march-2026-usage-promotion",
  startsAt: "2026-03-13T00:00:00-07:00",
  endsAt: "2026-03-28T23:59:00-07:00",
  peakWindowUtc: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    start: "12:00",
    end: "18:00"
  },
  bonusLabel: "2x usage during off-peak hours",
  planScope: "Free, Pro, Max, and Team plans; Enterprise excluded",
  surfaces: ["Claude", "Cowork", "Claude Code", "Claude for Excel", "Claude for PowerPoint"],
  sourceNote:
    "Anthropic states that five-hour usage is doubled outside 8 AM-2 PM ET / 5-11 AM PT / 12-6 PM GMT on weekdays during the promotion."
};

export const providers = [
  {
    id: "openai",
    name: "OpenAI",
    statusPageUrl: "https://status.openai.com/",
    endpoint: "https://status.openai.com/api/v2/summary.json",
    adapter: "statuspage",
    modelProfiles: [
      {
        id: "chatgpt-55",
        name: "ChatGPT 5.5",
        description:
          "Tracks ChatGPT-facing OpenAI services where the public status page provides component-level signals.",
        componentKeywords: [
          "ChatGPT",
          "App",
          "Conversations",
          "Responses",
          "Login",
          "File uploads",
          "Voice mode",
          "Connectors"
        ]
      },
      {
        id: "responses-api",
        name: "Responses API",
        description: "Tracks the OpenAI Responses API component and related platform incidents.",
        componentKeywords: ["Responses", "Chat Completions", "Files", "Batch"]
      },
      {
        id: "codex",
        name: "Codex",
        description: "Tracks Codex-related OpenAI components where available.",
        componentKeywords: ["Codex", "CLI", "VS Code extension"]
      }
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    statusPageUrl: "https://status.anthropic.com/",
    endpoint: "https://status.anthropic.com/api/v2/summary.json",
    adapter: "statuspage",
    modelProfiles: [
      {
        id: "claude-sonnet",
        name: "Claude Sonnet",
        description: "Tracks Claude.ai, Claude API, and model incidents mentioning Sonnet.",
        componentKeywords: ["Claude", "api.anthropic.com", "claude.ai", "platform.claude.com", "Sonnet"],
        usagePromotion: claudeMarch2026Promotion
      },
      {
        id: "claude-opus",
        name: "Claude Opus",
        description: "Tracks Claude services and incidents mentioning Opus.",
        componentKeywords: ["Claude", "api.anthropic.com", "claude.ai", "Opus"],
        usagePromotion: claudeMarch2026Promotion
      },
      {
        id: "claude-code",
        name: "Claude Code",
        description: "Tracks the Claude Code component on Anthropic status.",
        componentKeywords: ["Claude Code"],
        usagePromotion: claudeMarch2026Promotion
      }
    ]
  },
  {
    id: "google-cloud",
    name: "Google Cloud / Vertex AI",
    statusPageUrl: "https://status.cloud.google.com/",
    endpoint: "https://status.cloud.google.com/incidents.json",
    adapter: "google-incidents",
    modelProfiles: [
      {
        id: "vertex-gemini-api",
        name: "Vertex Gemini API",
        description: "Tracks Google Cloud incidents that list Vertex Gemini API or Gemini impact.",
        componentKeywords: ["Vertex Gemini API", "Gemini"]
      }
    ]
  }
];

export const defaultProviderId = providers[0].id;

export function getProvider(providerId) {
  return providers.find((provider) => provider.id === providerId) ?? providers[0];
}

export function getProfile(provider, profileId) {
  return provider.modelProfiles.find((profile) => profile.id === profileId) ?? provider.modelProfiles[0];
}
