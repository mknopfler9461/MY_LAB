"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultProviderId, getProfile, getProvider, providers } from "../data/providers";

const timezones = [
  { id: "auto", label: "Auto" },
  { id: "UTC", label: "UTC" },
  { id: "Asia/Tokyo", label: "Tokyo" },
  { id: "America/Los_Angeles", label: "Los Angeles" },
  { id: "America/New_York", label: "New York" },
  { id: "Europe/London", label: "London" },
  { id: "Australia/Sydney", label: "Sydney" },
  { id: "GMT+11", label: "GMT+11 fixed" }
];

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const indicatorLabels = {
  none: "Operational",
  minor: "Minor issue",
  major: "Major issue",
  critical: "Critical issue",
  unknown: "Unknown"
};

function resolveTimeZone(timezoneId) {
  if (timezoneId === "auto") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }
  return timezoneId;
}

function formatDateTime(value, timezoneId) {
  if (!value) return "Not published";
  const date = new Date(value);
  const resolved = resolveTimeZone(timezoneId);

  if (resolved.startsWith("GMT")) {
    const sign = resolved.includes("-") ? -1 : 1;
    const hours = Number(resolved.replace("GMT", "").replace("+", "").replace("-", "")) || 0;
    const shifted = new Date(date.getTime() + sign * hours * 60 * 60 * 1000);
    return `${shifted.toISOString().slice(0, 16).replace("T", " ")} ${resolved}`;
  }

  return new Intl.DateTimeFormat("en", {
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

function formatWindowPoint(value, timezoneId) {
  const date = new Date(value);
  const resolved = resolveTimeZone(timezoneId);
  const offset = getFixedOffsetHours(resolved);

  if (offset !== null) {
    const shifted = new Date(date.getTime() + offset * 60 * 60 * 1000);
    const day = weekdayLabels[shifted.getUTCDay()];
    const time = shifted.toISOString().slice(11, 16);
    return `${day} ${time}`;
  }

  return new Intl.DateTimeFormat("en", {
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

function getPeakWindowView(peakWindow, timezoneId) {
  if (!peakWindow) return null;
  const sampleDate = "2026-01-06";
  const start = `${sampleDate}T${peakWindow.windowUtc.start}:00Z`;
  const end = `${sampleDate}T${peakWindow.windowUtc.end}:00Z`;

  return {
    peakWindow: `${formatWindowPoint(start, timezoneId)} - ${formatWindowPoint(end, timezoneId)}`,
    offPeakWindow: `Outside ${formatWindowPoint(start, timezoneId)} - ${formatWindowPoint(end, timezoneId)}`
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
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const profile = useMemo(() => getProfile(provider, profileId), [provider, profileId]);
  const resolvedTimeZone = resolveTimeZone(timezoneId);
  const peakWindowView = getPeakWindowView(profile.peakWindow, timezoneId);

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
          <p className="eyebrow">Official status monitor</p>
          <h1>LLM Status</h1>
          <p className="lede">
            Choose a provider, model profile, and timezone to read live signals from official status sources without hardcoded peak-time claims.
          </p>
        </div>
        <a className="sourceLink" href={provider.statusPageUrl} target="_blank" rel="noreferrer">
          Open official page
        </a>
      </section>

      <section className="controlPanel" aria-label="Status controls">
        <label>
          <span>Provider</span>
          <select value={providerId} onChange={(event) => setProviderId(event.target.value)}>
            {providers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Model profile</span>
          <select value={profileId} onChange={(event) => setProfileId(event.target.value)}>
            {provider.modelProfiles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Timezone</span>
          <select value={timezoneId} onChange={(event) => setTimezoneId(event.target.value)}>
            {timezones.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="statusGrid">
        <article className={`statusCard ${statusClass(status?.indicator)}`}>
          <div className="cardHeader">
            <span>Status</span>
            <strong>{isLoading ? "Checking..." : indicatorLabels[status?.indicator] ?? status?.summary}</strong>
          </div>
          <h2>{isLoading ? "Retrieving official status" : status?.summary}</h2>
          <p>{profile.description}</p>
          <dl>
            <div>
              <dt>Updated</dt>
              <dd>{formatDateTime(status?.updatedAt, timezoneId)}</dd>
            </div>
            <div>
              <dt>Checked</dt>
              <dd>{formatDateTime(status?.checkedAt, timezoneId)}</dd>
            </div>
            <div>
              <dt>Timezone</dt>
              <dd>{resolvedTimeZone}</dd>
            </div>
          </dl>
        </article>

        {profile.peakWindow ? (
          <article className="panel peakPanel">
            <div className="sectionTitle">
              <h2>Peak Window</h2>
              <span>Estimate</span>
            </div>
            <div className="peakHero">
              <strong>{profile.peakWindow.label}</strong>
              <p>{profile.peakWindow.title}</p>
            </div>
            <dl className="peakFacts">
              <div>
                <dt>Converted peak</dt>
                <dd>{peakWindowView.peakWindow}</dd>
              </div>
              <div>
                <dt>Off-peak</dt>
                <dd>{peakWindowView.offPeakWindow}</dd>
              </div>
            </dl>
            <p className="peakCopy">{profile.peakWindow.sourceNote}</p>
            <p className="peakCopy">{profile.peakWindow.offPeakNote}</p>
            <a className="inlineLink" href={profile.peakWindow.sourceUrl} target="_blank" rel="noreferrer">
              Read {profile.peakWindow.sourceLabel}
            </a>
          </article>
        ) : null}

        <article className="panel">
          <div className="sectionTitle">
            <h2>Components</h2>
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
                <time>{formatDateTime(component.updatedAt, timezoneId)}</time>
              </div>
            ))}
            {!isLoading && !status?.components?.length ? <p className="empty">No matching official components were returned.</p> : null}
          </div>
        </article>

        <article className="panel incidents">
          <div className="sectionTitle">
            <h2>Incidents</h2>
            <span>{status?.incidents?.length ?? 0}</span>
          </div>
          <div className="list">
            {(status?.incidents ?? []).map((incident) => (
              <a className="incident" href={incident.url} target="_blank" rel="noreferrer" key={incident.id}>
                <strong>{incident.name}</strong>
                <span>
                  {incident.status} · {incident.impact}
                </span>
                <time>{formatDateTime(incident.updatedAt, timezoneId)}</time>
              </a>
            ))}
            {!isLoading && !status?.incidents?.length ? (
              <p className="empty">No matching active incidents from the official source.</p>
            ) : null}
          </div>
        </article>

        <aside className="note">
          <strong>Source note</strong>
          <p>{status?.note ?? "Waiting for the official status response."}</p>
        </aside>
      </section>
    </main>
  );
}
