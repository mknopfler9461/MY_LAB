const openAiChatGptPeakEstimate = {
  kind: "estimate",
  title: "Estimated ChatGPT peak demand window",
  titleJa: "ChatGPTの推定ピーク時間帯",
  titleZh: "ChatGPT 预估高峰需求时段",
  label: "Likely peak: 8 PM-5 AM EST",
  labelJa: "推定ピーク: 米国東部標準時 20:00-翌5:00",
  labelZh: "可能高峰：美国东部标准时间 20:00-次日 5:00",
  sourceUrl: "https://help.openai.com/en/articles/9047779-why-is-my-chatgpt-taking-so-long-to-respond",
  sourceLabel: "OpenAI Help Center",
  sourceLabelJa: "OpenAIヘルプセンター",
  sourceLabelZh: "OpenAI 帮助中心",
  sampleDate: "2026-01-06",
  activeDaysUtc: [0, 1, 2, 3, 4, 5, 6],
  windowUtc: {
    start: "01:00",
    end: "10:00"
  },
  sourceNote:
    "OpenAI officially acknowledges that ChatGPT users may notice slowness during peak hours, but does not publish exact peak times. This window is an unofficial estimate based on likely North America evening demand.",
  sourceNoteJa:
    "OpenAIは、ピーク時間帯にChatGPTの応答が遅くなる場合があることを公式に認めていますが、具体的な時間帯は公開していません。この時間帯は北米の夜間需要をもとにした非公式の推定です。",
  sourceNoteZh:
    "OpenAI 官方承认 ChatGPT 用户可能会在高峰时段感到响应变慢，但未发布具体高峰时间。此窗口是基于北美晚间需求的非官方估算。",
  offPeakNote: "Expected off-peak is outside this estimated window.",
  offPeakNoteJa: "推定オフピークは、この時間帯以外です。",
  offPeakNoteZh: "预计非高峰为此估算窗口之外的时段。"
};

const claudePeakWindow = {
  kind: "official",
  title: "Claude peak demand window",
  titleJa: "Claudeのピーク時間帯",
  titleZh: "Claude 高峰需求时段",
  label: "Peak: 8 AM-2 PM ET on weekdays",
  labelJa: "ピーク: 平日 米国東部時間 8:00-14:00",
  labelZh: "高峰：工作日美国东部时间 8:00-14:00",
  sourceUrl: "https://support.claude.com/en/articles/14063676-claude-march-2026-usage-promotion",
  sourceLabel: "Claude support article",
  sourceLabelJa: "Claudeサポート記事",
  sourceLabelZh: "Claude 支持文章",
  sampleDate: "2026-03-16",
  activeDaysUtc: [1, 2, 3, 4, 5],
  windowUtc: {
    start: "12:00",
    end: "18:00"
  },
  sourceNote:
    "Anthropic officially cited 8 AM-2 PM ET on weekdays as the peak usage window.",
  sourceNoteJa:
    "Anthropicは、平日の米国東部時間8:00-14:00をピーク利用時間帯として公式に示しています。",
  sourceNoteZh:
    "Anthropic 官方指出，工作日美国东部时间 8:00-14:00 为高峰使用时段。",
  offPeakNote: "Expected off-peak is outside this weekday window and on weekends.",
  offPeakNoteJa: "想定オフピークは、平日のこの時間帯以外および週末です。",
  offPeakNoteZh: "预计非高峰为工作日此窗口之外以及周末。"
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
        descriptionJa:
          "公式ステータスページで確認できるChatGPT関連のOpenAIサービスを追跡します。",
        descriptionZh:
          "跟踪公开状态页可提供组件级信号的 ChatGPT 相关 OpenAI 服务。",
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
        descriptionJa: "OpenAI Responses APIと関連するプラットフォーム障害情報を追跡します。",
        descriptionZh: "跟踪 OpenAI Responses API 组件及相关平台事件。",
        componentKeywords: ["Responses", "Chat Completions", "Files", "Batch"]
      },
      {
        id: "codex",
        name: "Codex",
        description: "Tracks Codex-related OpenAI components where available.",
        descriptionJa: "公開されているCodex関連コンポーネントを追跡します。",
        descriptionZh: "跟踪可公开获取的 Codex 相关 OpenAI 组件。",
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
        descriptionJa: "Claude.ai、Claude API、およびSonnetに関連する障害情報を追跡します。",
        descriptionZh: "跟踪 Claude.ai、Claude API 以及提到 Sonnet 的模型事件。",
        componentKeywords: ["Claude", "api.anthropic.com", "claude.ai", "platform.claude.com", "Sonnet"],
        peakWindow: claudePeakWindow
      },
      {
        id: "claude-opus",
        name: "Claude Opus",
        description: "Tracks Claude services and incidents mentioning Opus.",
        descriptionJa: "ClaudeサービスおよびOpusに関連する障害情報を追跡します。",
        descriptionZh: "跟踪 Claude 服务以及提到 Opus 的事件。",
        componentKeywords: ["Claude", "api.anthropic.com", "claude.ai", "Opus"],
        peakWindow: claudePeakWindow
      },
      {
        id: "claude-code",
        name: "Claude Code",
        description: "Tracks the Claude Code component on Anthropic status.",
        descriptionJa: "Anthropicステータス上のClaude Codeコンポーネントを追跡します。",
        descriptionZh: "跟踪 Anthropic 状态页上的 Claude Code 组件。",
        componentKeywords: ["Claude Code"],
        peakWindow: claudePeakWindow
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
        descriptionJa: "Vertex Gemini APIまたはGeminiへの影響を含むGoogle Cloud障害情報を追跡します。",
        descriptionZh: "跟踪列出 Vertex Gemini API 或 Gemini 影响的 Google Cloud 事件。",
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
