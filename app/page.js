"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultProviderId, getProfile, getProvider, providers } from "../data/providers";

const timezones = [
  { id: "auto", label: "Auto", labelJa: "自動" },
  { id: "UTC", label: "UTC", labelJa: "協定世界時" },
  { id: "Asia/Tokyo", label: "Tokyo", labelJa: "東京" },
  { id: "America/Los_Angeles", label: "Los Angeles", labelJa: "ロサンゼルス" },
  { id: "America/New_York", label: "New York", labelJa: "ニューヨーク" },
  { id: "Europe/London", label: "London", labelJa: "ロンドン" },
  { id: "Europe/Paris", label: "Paris", labelJa: "パリ" },
  { id: "Australia/Sydney", label: "Sydney", labelJa: "シドニー" }
];

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const copy = {
  en: {
    language: "Language",
    english: "English",
    japanese: "Japanese",
    eyebrow: "Official status monitor",
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
    peakWindow: "Peak Window",
    estimate: "Estimate",
    officialCitation: "Official citation",
    convertedPeak: "Converted peak",
    offPeak: "Off-peak",
    read: "Read",
    components: "Components",
    incidents: "Incidents",
    sourceNote: "Source note",
    waiting: "Waiting for the official status response.",
    noComponents: "No matching official components were returned.",
    noIncidents: "No matching active incidents from the official source.",
    indicators: {
      none: "Operational",
      minor: "Minor issue",
      major: "Major issue",
      critical: "Critical issue",
      unknown: "Unknown"
    },
    notPublished: "Not published",
    outside: "Outside"
  },
  ja: {
    language: "言語",
    english: "英語",
    japanese: "日本語",
    eyebrow: "公式ステータスモニター",
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
    peakWindow: "ピーク時間帯",
    estimate: "推定",
    officialCitation: "公式記載",
    convertedPeak: "変換後のピーク",
    offPeak: "オフピーク",
    read: "読む",
    components: "コンポーネント",
    incidents: "障害情報",
    sourceNote: "出典メモ",
    waiting: "公式ステータスの応答を待っています。",
    noComponents: "該当する公式コンポーネントは返されませんでした。",
    noIncidents: "公式ソースに該当するアクティブな障害情報はありません。",
    indicators: {
      none: "正常",
      minor: "軽微な問題",
      major: "重大な問題",
      critical: "深刻な問題",
      unknown: "不明"
    },
    notPublished: "未公開",
    outside: "以下の時間帯以外"
  }
};

function resolveTimeZone(timezoneId) {
  if (timezoneId === "auto") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }
  return timezoneId;
}

function localizedText(value, lang, fallback = "") {
  if (lang === "ja") return value?.ja ?? value?.descriptionJa ?? value?.titleJa ?? value?.labelJa ?? value?.sourceNoteJa ?? value?.offPeakNoteJa ?? value?.sourceLabelJa ?? fallback;
  return value?.en ?? value?.description ?? value?.title ?? value?.label ?? value?.sourceNote ?? value?.offPeakNote ?? value?.sourceLabel ?? fallback;
}

function formatDateTime(value, timezoneId, lang) {
  if (!value) return copy[lang].notPublished;
  const date = new Date(value);
  const resolved = resolveTimeZone(timezoneId);
  const locale = lang === "ja" ? "ja-JP" : "en";

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

function formatWindowPoint(value, timezoneId, lang) {
  const date = new Date(value);
  const resolved = resolveTimeZone(timezoneId);
  const offset = getFixedOffsetHours(resolved);
  const locale = lang === "ja" ? "ja-JP" : "en";

  if (offset !== null) {
    const shifted = new Date(date.getTime() + offset * 60 * 60 * 1000);
    const day = weekdayLabels[shifted.getUTCDay()];
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

function formatStatus(value) {
  return String(value ?? "unknown").replaceAll("_", " ");
}

export default function Home() {
  const [providerId, setProviderId] = useState(defaultProviderId);
  const provider = useMemo(() => getProvider(providerId), [providerId]);
  const [profileId, setProfileId] = useState(provider.modelProfiles[0].id);
  const [timezoneId, setTimezoneId] = useState("auto");
  const [lang, setLang] = useState("en");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const t = copy[lang];
  const profile = useMemo(() => getProfile(provider, profileId), [provider, profileId]);
  const resolvedTimeZone = resolveTimeZone(timezoneId);
  const peakWindowView = getPeakWindowView(profile.peakWindow, timezoneId, lang);

  useEffect(() => {
    setProfileId(provider.modelProfiles[0].id);
  }, [providerId, provider.modelProfiles]);

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
          <h1>LLM Status</h1>
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
                {lang === "ja" ? item.labelJa : item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{t.language}</span>
          <select value={lang} onChange={(event) => setLang(event.target.value)}>
            <option value="en">{t.english}</option>
            <option value="ja">{t.japanese}</option>
          </select>
        </label>
      </section>

      <section className="statusGrid">
        <article className={`statusCard ${statusClass(status?.indicator)}`}>
          <div className="cardHeader">
            <span>{t.status}</span>
            <strong>{isLoading ? t.checking : t.indicators[status?.indicator] ?? status?.summary}</strong>
          </div>
          <h2>{isLoading ? t.retrieving : status?.summary}</h2>
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
              <dd>{resolvedTimeZone}</dd>
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
              <strong>{localizedText({ label: profile.peakWindow.label, labelJa: profile.peakWindow.labelJa }, lang, profile.peakWindow.label)}</strong>
              <p>{localizedText({ title: profile.peakWindow.title, titleJa: profile.peakWindow.titleJa }, lang, profile.peakWindow.title)}</p>
            </div>
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
            <p className="peakCopy">{localizedText({ sourceNote: profile.peakWindow.sourceNote, sourceNoteJa: profile.peakWindow.sourceNoteJa }, lang, profile.peakWindow.sourceNote)}</p>
            <p className="peakCopy">{localizedText({ offPeakNote: profile.peakWindow.offPeakNote, offPeakNoteJa: profile.peakWindow.offPeakNoteJa }, lang, profile.peakWindow.offPeakNote)}</p>
            <a className="inlineLink" href={profile.peakWindow.sourceUrl} target="_blank" rel="noreferrer">
              {t.read} {localizedText({ sourceLabel: profile.peakWindow.sourceLabel, sourceLabelJa: profile.peakWindow.sourceLabelJa }, lang, profile.peakWindow.sourceLabel)}
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
          <p>{status?.note ?? t.waiting}</p>
        </aside>
      </section>
    </main>
  );
}
