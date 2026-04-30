const openAiChatGptPeakEstimate = {
  title: "Estimated ChatGPT peak demand window",
  label: "Likely peak: 8 PM-5 AM EST",
  sourceUrl: "https://help.openai.com/en/articles/9047779-why-is-my-chatgpt-taking-so-long-to-respond",
  sourceLabel: "OpenAI Help Center",
  windowUtc: {
    start: "01:00",
    end: "10:00"
  },
  sourceNote:
    "OpenAI officially acknowledges that ChatGPT users may notice slowness during peak hours, but does not publish exact peak times. This window is an unofficial estimate based on likely North America evening demand.",
  offPeakNote: "Expected off-peak is outside this estimated window."
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
        ],
        peakWindow: openAiChatGptPeakEstimate
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
        componentKeywords: ["Claude", "api.anthropic.com", "claude.ai", "platform.claude.com", "Sonnet"]
      },
      {
        id: "claude-opus",
        name: "Claude Opus",
        description: "Tracks Claude services and incidents mentioning Opus.",
        componentKeywords: ["Claude", "api.anthropic.com", "claude.ai", "Opus"]
      },
      {
        id: "claude-code",
        name: "Claude Code",
        description: "Tracks the Claude Code component on Anthropic status.",
        componentKeywords: ["Claude Code"]
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
