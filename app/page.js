"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultProviderId, getProfile, getProvider, providers } from "../data/providers";

const timezones = [
  { id: "auto", labels: { en: "Auto", ja: "自動", zh: "自动" } },
  { id: "UTC", labels: { en: "UTC", ja: "協定世界時", zh: "协调世界时" } },
  { id: "Asia/Tokyo", labels: { en: "Tokyo", ja: "東京", zh: "东京" } },
  { id: "Asia/Shanghai", labels: { en: "Shanghai", ja: "上海", zh: "上海" } },
  { id: "Asia/Kolkata", labels: { en: "Bangalore", ja: "ベンガルール", zh: "班加罗尔" } },
  { id: "Asia/Dubai", labels: { en: "Dubai", ja: "ドバイ", zh: "迪拜" } },
  { id: "America/Los_Angeles", labels: { en: "Los Angeles", ja: "ロサンゼルス", zh: "洛杉矶" } },
  { id: "America/New_York", labels: { en: "New York", ja: "ニューヨーク", zh: "纽约" } },
  { id: "Europe/London", labels: { en: "London", ja: "ロンドン", zh: "伦敦" } },
  { id: "Europe/Paris", labels: { en: "Paris", ja: "パリ", zh: "巴黎" } },
  { id: "Australia/Sydney", labels: { en: "Sydney", ja: "シドニー", zh: "悉尼" } }
];

const weekdayLabels = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ja: ["日", "月", "火", "水", "木", "金", "土"],
  zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
};

const copy = {
  en: {
    language: "Language",
    english: "English",
    japanese: "Japanese",
    chinese: "Simplified Chinese",
    eyebrow: "Official status monitor",
    title: "LLM Status",
    lede:
      "Choose a provider, model profile, and timezone to read live signals from official status sources and compare peak-time windows.",
    openOfficialPage: "Open official page",
    provider: "Provider",
    modelProfile: "Model profile",
    timezone: "Timezone",
    status: "Status",
    checking: "Checking...",
    retrieving: "Retrieving official status",
    updated: "Updated",
    checked: "Checked",
    localTime: "Local time",
    peakWindow: "Peak Window",
    estimate: "Estimate",
    officialCitation: "Official citation",
    convertedPeak: "Converted peak",
    offPeak: "Off-peak",
    countdownPeak: "Next peak in",
    countdownOffPeak: "Off-peak in",
    peakNow: "Peak now",
    offPeakNow: "Off-peak now",
    read: "Read",
    components: "Components",
    incidents: "Incidents",
    sourceNote: "Source note",
    waiting: "Waiting for the official status response.",
    noComponents: "No matching official components were returned.",
    noIncidents: "No matching active incidents from the official source.",
    statusNotes: {
      matched_components: "Filtered to official components that match this model profile.",
      provider_rollup: "No exact model-specific public component was found, so the provider rollup is shown.",
      google_cloud_incidents: "Google publishes a Cloud incident feed; this view filters it for Gemini-related records.",
      fetch_error: "Unable to retrieve the official status source."
    },
    indicators: {
      none: "Operational",
      minor: "Minor issue",
      major: "Major issue",
      critical: "Critical issue",
      unknown: "Unknown"
    },
    statusSummaries: {
      none: "All tracked services look operational",
      minor: "Minor issue reported",
      major: "Major issue reported",
      critical: "Critical issue reported",
      unknown: "Status unavailable",
      activeGemini: "Active Gemini-related incident found",
      noActiveGemini: "No active Gemini-related incidents found"
    },
    notPublished: "Not published",
    outside: "Outside"
  },
  ja: {
    language: "言語",
    english: "英語",
    japanese: "日本語",
    chinese: "簡体字中国語",
    eyebrow: "公式ステータスモニター",
    title: "LLMステータス",
    lede:
      "プロバイダー、モデル、タイムゾーンを選択して、公式ステータス情報とピーク時間帯を確認できます。",
    openOfficialPage: "公式ページを開く",
    provider: "プロバイダー",
    modelProfile: "モデル",
    timezone: "タイムゾーン",
    status: "ステータス",
    checking: "確認中...",
    retrieving: "公式ステータスを取得中",
    updated: "更新",
    checked: "確認",
    localTime: "現地時刻",
    peakWindow: "ピーク時間帯",
    estimate: "推定",
    officialCitation: "公式記載",
    convertedPeak: "変換後のピーク",
    offPeak: "オフピーク",
    countdownPeak: "次のピークまで",
    countdownOffPeak: "オフピークまで",
    peakNow: "ピーク中",
    offPeakNow: "オフピーク中",
    read: "読む",
    components: "コンポーネント",
    incidents: "障害情報",
    sourceNote: "出典メモ",
    waiting: "公式ステータスの応答を待っています。",
    noComponents: "該当する公式コンポーネントは返されませんでした。",
    noIncidents: "公式ソースに該当するアクティブな障害情報はありません。",
    statusNotes: {
      matched_components: "このモデルに一致する公式コンポーネントに絞り込んでいます。",
      provider_rollup: "モデル専用の公開コンポーネントが見つからないため、プロバイダー全体の概要を表示しています。",
      google_cloud_incidents: "Google Cloudの障害フィードをGemini関連レコードで絞り込んでいます。",
      fetch_error: "公式ステータス情報を取得できませんでした。"
    },
    indicators: {
      none: "正常",
      minor: "軽微な問題",
      major: "重大な問題",
      critical: "深刻な問題",
      unknown: "不明"
    },
    statusSummaries: {
      none: "追跡対象サービスは正常に見えます",
      minor: "軽微な問題が報告されています",
      major: "重大な問題が報告されています",
      critical: "深刻な問題が報告されています",
      unknown: "ステータスを取得できません",
      activeGemini: "Gemini関連のアクティブな障害があります",
      noActiveGemini: "Gemini関連のアクティブな障害はありません"
    },
    notPublished: "未公開",
    outside: "以下の時間帯以外"
  },
  zh: {
    language: "显示语言",
    english: "英语",
    japanese: "日语",
    chinese: "简体中文",
    eyebrow: "官方状态监控",
    title: "LLM 状态",
    lede:
      "选择供应商、模型配置和时区，读取官方状态来源的实时信号，并对照高峰时段窗口。",
    openOfficialPage: "打开官方页面",
    provider: "供应商",
    modelProfile: "模型配置",
    timezone: "时区",
    status: "状态",
    checking: "检查中...",
    retrieving: "正在获取官方状态",
    updated: "更新于",
    checked: "检查于",
    localTime: "当地时间",
    peakWindow: "高峰时段",
    estimate: "估算",
    officialCitation: "官方引用",
    convertedPeak: "换算后高峰",
    offPeak: "非高峰",
    countdownPeak: "距离下一次高峰",
    countdownOffPeak: "距离非高峰",
    peakNow: "当前为高峰",
    offPeakNow: "当前为非高峰",
    read: "阅读",
    components: "组件",
    incidents: "事件",
    sourceNote: "来源说明",
    waiting: "正在等待官方状态响应。",
    noComponents: "官方来源未返回匹配组件。",
    noIncidents: "官方来源没有匹配的活跃事件。",
    statusNotes: {
      matched_components: "已筛选出与此模型配置匹配的官方组件。",
      provider_rollup: "未找到公开的模型专属组件，因此显示供应商整体状态。",
      google_cloud_incidents: "Google 发布 Cloud 事件源；此视图筛选 Gemini 相关记录。",
      fetch_error: "无法获取官方状态来源。"
    },
    indicators: {
      none: "运行正常",
      minor: "轻微问题",
      major: "重大问题",
      critical: "严重问题",
      unknown: "未知"
    },
    statusSummaries: {
      none: "跟踪的服务看起来运行正常",
      minor: "报告了轻微问题",
      major: "报告了重大问题",
      critical: "报告了严重问题",
      unknown: "状态不可用",
      activeGemini: "发现 Gemini 相关活跃事件",
      noActiveGemini: "未发现 Gemini 相关活跃事件"
    },
    notPublished: "未发布",
    outside: "以下时段之外"
  }
};

function getBrowserLanguage() {
  if (typeof navigator === "undefined") return "en";
  const language = navigator.languages?.[0] ?? navigator.language ?? "en";
  const normalized = language.toLowerCase();
  if (normalized.startsWith("zh")) return "zh";
  if (normalized.startsWith("ja")) return "ja";
  return "en";
}

function resolveTimeZone(timezoneId) {
  if (timezoneId === "auto") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }
  return timezoneId;
}

function localizedText(value, lang, fallback = "") {
  if (lang === "zh") return value?.zh ?? value?.descriptionZh ?? value?.titleZh ?? value?.labelZh ?? value?.sourceNoteZh ?? value?.offPeakNoteZh ?? value?.sourceLabelZh ?? fallback;
  if (lang === "ja") return value?.ja ?? value?.descriptionJa ?? value?.titleJa ?? value?.labelJa ?? value?.sourceNoteJa ?? value?.offPeakNoteJa ?? value?.sourceLabelJa ?? fallback;
  return value?.en ?? value?.description ?? value?.title ?? value?.label ?? value?.sourceNote ?? value?.offPeakNote ?? value?.sourceLabel ?? fallback;
}

function formatDateTime(value, timezoneId, lang) {
  if (!value) return copy[lang].notPublished;
  const date = new Date(value);
  const resolved = resolveTimeZone(timezoneId);
  const locale = lang === "ja" ? "ja-JP" : lang === "zh" ? "zh-CN" : "en";

  if (resolved.startsWith("GMT")) {
    const sign = resolved.includes("-") ? -1 : 1;
    const hours = Number(resolved.replace("GMT", "").replace("+", "").replace("-", "")) || 0;
    const shifted = new Date(date.getTime() + sign * hours * 60 * 60 * 1000);
    return `${shifted.toISOString().slice(0, 16).replace("T", " ")} ${resolved}`;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: resolved
  }).format(date);
}

function getFixedOffsetHours(timezoneId) {
  if (!timezoneId.startsWith("GMT")) return null;
  const sign = timezoneId.includes("-") ? -1 : 1;
  const hours = Number(timezoneId.replace("GMT", "").replace("+", "").replace("-", "")) || 0;
  return sign * hours;
}

function parseUtcTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return { hours, minutes };
}

function createUtcDate(baseDate, timeValue, dayOffset = 0) {
  const time = parseUtcTime(timeValue);
  return new Date(Date.UTC(
    baseDate.getUTCFullYear(),
    baseDate.getUTCMonth(),
    baseDate.getUTCDate() + dayOffset,
    time.hours,
    time.minutes,
    0,
    0
  ));
}

function formatWindowPoint(value, timezoneId, lang) {
  const date = new Date(value);
  const resolved = resolveTimeZone(timezoneId);
  const offset = getFixedOffsetHours(resolved);
  const locale = lang === "ja" ? "ja-JP" : lang === "zh" ? "zh-CN" : "en";

  if (offset !== null) {
    const shifted = new Date(date.getTime() + offset * 60 * 60 * 1000);
    const day = weekdayLabels[lang][shifted.getUTCDay()];
    const time = shifted.toISOString().slice(11, 16);
    return `${day} ${time}`;
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: resolved
  }).format(date);
}

function getTimezoneLabel(timezoneId, lang) {
  const timezone = timezones.find((item) => item.id === timezoneId);
  return timezone?.labels?.[lang] ?? timezone?.labels?.en ?? timezoneId;
}

function getStatusHeadline(status, providerId, lang) {
  if (!status) return copy[lang].waiting;
  if (status.noteCode === "fetch_error") return copy[lang].statusSummaries.unknown;
  if (providerId === "google-cloud") {
    return status.indicator === "none"
      ? copy[lang].statusSummaries.noActiveGemini
      : copy[lang].statusSummaries.activeGemini;
  }
  return copy[lang].statusSummaries[status.indicator] ?? status.summary ?? copy[lang].statusSummaries.unknown;
}

function statusClass(indicator) {
  if (indicator === "none" || indicator === "operational") return "good";
  if (indicator === "minor" || indicator === "degraded_performance") return "warn";
  if (indicator === "major" || indicator === "critical" || indicator === "partial_outage" || indicator === "major_outage") {
    return "bad";
  }
  return "neutral";
}

function getPeakWindowView(peakWindow, timezoneId, lang) {
  if (!peakWindow) return null;
  const sampleDate = peakWindow.sampleDate ?? "2026-01-06";
  const start = `${sampleDate}T${peakWindow.windowUtc.start}:00Z`;
  const end = `${sampleDate}T${peakWindow.windowUtc.end}:00Z`;
  const startText = formatWindowPoint(start, timezoneId, lang);
  const endText = formatWindowPoint(end, timezoneId, lang);

  return {
    peakWindow: `${startText} - ${endText}`,
    offPeakWindow: `${copy[lang].outside} ${startText} - ${endText}`
  };
}

function getPeakCountdown(peakWindow, now = new Date()) {
  if (!peakWindow?.windowUtc) return null;

  const activeDays = peakWindow.activeDaysUtc ?? [0, 1, 2, 3, 4, 5, 6];
  const windows = [];

  for (let dayOffset = -1; dayOffset <= 8; dayOffset += 1) {
    const start = createUtcDate(now, peakWindow.windowUtc.start, dayOffset);
    let end = createUtcDate(now, peakWindow.windowUtc.end, dayOffset);

    if (end <= start) {
      end = createUtcDate(now, peakWindow.windowUtc.end, dayOffset + 1);
    }

    if (activeDays.includes(start.getUTCDay())) {
      windows.push({ start, end });
    }
  }

  const currentWindow = windows.find((window) => now >= window.start && now < window.end);
  const target = currentWindow?.end ?? windows.find((window) => window.start > now)?.start;

  if (!target) return null;

  const minutesUntil = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 60000));
  const hours = Math.floor(minutesUntil / 60);
  const minutes = minutesUntil % 60;

  return {
    isPeakNow: Boolean(currentWindow),
    value: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  };
}

function formatStatus(value) {
  return String(value ?? "unknown").replaceAll("_", " ");
}

function getStatusNote(status, lang) {
  if (!status) return copy[lang].waiting;
  return copy[lang].statusNotes[status.noteCode] ?? status.note ?? copy[lang].waiting;
}

export default function Home() {
  const [providerId, setProviderId] = useState(defaultProviderId);
  const provider = useMemo(() => getProvider(providerId), [providerId]);
  const [profileId, setProfileId] = useState(provider.modelProfiles[0].id);
  const [timezoneId, setTimezoneId] = useState("auto");
  const [lang, setLang] = useState("en");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());

  const t = copy[lang];
  const profile = useMemo(() => getProfile(provider, profileId), [provider, profileId]);
  const resolvedTimeZone = resolveTimeZone(timezoneId);
  const timezoneDisplay = `${getTimezoneLabel(timezoneId, lang)} (${resolvedTimeZone})`;
  const peakWindowView = getPeakWindowView(profile.peakWindow, timezoneId, lang);
  const peakCountdown = getPeakCountdown(profile.peakWindow, now);

  useEffect(() => {
    setLang(getBrowserLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang === "ja" ? "ja" : "en";
  }, [lang]);

  useEffect(() => {
    setProfileId(provider.modelProfiles[0].id);
  }, [providerId, provider.modelProfiles]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    fetch(`/api/status?provider=${provider.id}&profile=${profile.id}`)
      .then((response) => response.json())
      .then((data) => {
        if (isCurrent) setStatus(data);
      })
      .catch(() => {
        if (isCurrent) {
          setStatus({
            summary: "Unable to retrieve official status",
            indicator: "unknown",
            components: [],
            incidents: [],
            note: "The local browser could not reach the app API."
          });
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [provider.id, profile.id]);

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="lede">{t.lede}</p>
        </div>
        <a className="sourceLink" href={provider.statusPageUrl} target="_blank" rel="noreferrer">
          {t.openOfficialPage}
        </a>
      </section>

      <section className="controlPanel" aria-label="Status controls">
        <label>
          <span>{t.provider}</span>
          <select value={providerId} onChange={(event) => setProviderId(event.target.value)}>
            {providers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{t.modelProfile}</span>
          <select value={profileId} onChange={(event) => setProfileId(event.target.value)}>
            {provider.modelProfiles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{t.timezone}</span>
          <select value={timezoneId} onChange={(event) => setTimezoneId(event.target.value)}>
            {timezones.map((item) => (
              <option key={item.id} value={item.id}>
                {item.labels[lang] ?? item.labels.en}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{t.language}</span>
          <select value={lang} onChange={(event) => setLang(event.target.value)}>
            <option value="en">{t.english}</option>
            <option value="ja">{t.japanese}</option>
            <option value="zh">{t.chinese}</option>
          </select>
        </label>
      </section>

      <section className="statusGrid">
        <article className={`statusCard ${statusClass(status?.indicator)}`}>
          <div className="cardHeader">
            <span>{t.status}</span>
            <strong>{isLoading ? t.checking : t.indicators[status?.indicator] ?? status?.summary}</strong>
          </div>
          <h2>{isLoading ? t.retrieving : getStatusHeadline(status, providerId, lang)}</h2>
          <p>{localizedText(profile, lang, profile.description)}</p>
          <dl>
            <div>
              <dt>{t.updated}</dt>
              <dd>{formatDateTime(status?.updatedAt, timezoneId, lang)}</dd>
            </div>
            <div>
              <dt>{t.checked}</dt>
              <dd>{formatDateTime(status?.checkedAt, timezoneId, lang)}</dd>
            </div>
            <div>
              <dt>{t.timezone}</dt>
              <dd>{timezoneDisplay}</dd>
            </div>
            <div>
              <dt>{t.localTime}</dt>
              <dd>{formatDateTime(now, timezoneId, lang)}</dd>
            </div>
          </dl>
        </article>

        {profile.peakWindow ? (
          <article className="panel peakPanel">
            <div className="sectionTitle">
              <h2>{t.peakWindow}</h2>
              <span>{profile.peakWindow.kind === "official" ? t.officialCitation : t.estimate}</span>
            </div>
            <div className="peakHero">
              <strong>{localizedText({ label: profile.peakWindow.label, labelJa: profile.peakWindow.labelJa, labelZh: profile.peakWindow.labelZh }, lang, profile.peakWindow.label)}</strong>
              <p>{localizedText({ title: profile.peakWindow.title, titleJa: profile.peakWindow.titleJa, titleZh: profile.peakWindow.titleZh }, lang, profile.peakWindow.title)}</p>
            </div>
            {peakCountdown ? (
              <div className={`countdown ${peakCountdown.isPeakNow ? "isPeak" : "isOffPeak"}`}>
                <div>
                  <span>{peakCountdown.isPeakNow ? t.countdownOffPeak : t.countdownPeak}</span>
                  <strong>{peakCountdown.value}</strong>
                </div>
                <em>{peakCountdown.isPeakNow ? t.peakNow : t.offPeakNow}</em>
              </div>
            ) : null}
            <dl className="peakFacts">
              <div>
                <dt>{t.convertedPeak}</dt>
                <dd>{peakWindowView.peakWindow}</dd>
              </div>
              <div>
                <dt>{t.offPeak}</dt>
                <dd>{peakWindowView.offPeakWindow}</dd>
              </div>
            </dl>
            <p className="peakCopy">{localizedText({ sourceNote: profile.peakWindow.sourceNote, sourceNoteJa: profile.peakWindow.sourceNoteJa, sourceNoteZh: profile.peakWindow.sourceNoteZh }, lang, profile.peakWindow.sourceNote)}</p>
            <p className="peakCopy">{localizedText({ offPeakNote: profile.peakWindow.offPeakNote, offPeakNoteJa: profile.peakWindow.offPeakNoteJa, offPeakNoteZh: profile.peakWindow.offPeakNoteZh }, lang, profile.peakWindow.offPeakNote)}</p>
            <a className="inlineLink" href={profile.peakWindow.sourceUrl} target="_blank" rel="noreferrer">
              {t.read} {localizedText({ sourceLabel: profile.peakWindow.sourceLabel, sourceLabelJa: profile.peakWindow.sourceLabelJa, sourceLabelZh: profile.peakWindow.sourceLabelZh }, lang, profile.peakWindow.sourceLabel)}
            </a>
          </article>
        ) : null}

        <article className="panel">
          <div className="sectionTitle">
            <h2>{t.components}</h2>
            <span>{status?.components?.length ?? 0}</span>
          </div>
          <div className="list">
            {(status?.components ?? []).slice(0, 8).map((component) => (
              <div className="row" key={component.id}>
                <span className={`dot ${statusClass(component.status)}`} />
                <div>
                  <strong>{component.name}</strong>
                  <small>{formatStatus(component.status)}</small>
                </div>
                <time>{formatDateTime(component.updatedAt, timezoneId, lang)}</time>
              </div>
            ))}
            {!isLoading && !status?.components?.length ? <p className="empty">{t.noComponents}</p> : null}
          </div>
        </article>

        <article className="panel incidents">
          <div className="sectionTitle">
            <h2>{t.incidents}</h2>
            <span>{status?.incidents?.length ?? 0}</span>
          </div>
          <div className="list">
            {(status?.incidents ?? []).map((incident) => (
              <a className="incident" href={incident.url} target="_blank" rel="noreferrer" key={incident.id}>
                <strong>{incident.name}</strong>
                <span>
                  {incident.status} · {incident.impact}
                </span>
                <time>{formatDateTime(incident.updatedAt, timezoneId, lang)}</time>
              </a>
            ))}
            {!isLoading && !status?.incidents?.length ? (
              <p className="empty">{t.noIncidents}</p>
            ) : null}
          </div>
        </article>

        <aside className="note">
          <strong>{t.sourceNote}</strong>
          <p>{getStatusNote(status, lang)}</p>
        </aside>
      </section>
    </main>
  );
}
