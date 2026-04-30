import { NextResponse } from "next/server";
import { getProfile, getProvider } from "../../../data/providers";

export const dynamic = "force-dynamic";

const CACHE_SECONDS = 60;

function textMatchesKeywords(value, keywords) {
  const text = JSON.stringify(value ?? {}).toLowerCase();
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function normalizeStatusPage(payload, provider, profile) {
  const matchingComponents = (payload.components ?? []).filter((component) =>
    textMatchesKeywords(component.name, profile.componentKeywords)
  );
  const matchingIncidents = (payload.incidents ?? []).filter((incident) =>
    textMatchesKeywords(incident, profile.componentKeywords)
  );
  const components = matchingComponents.length ? matchingComponents : payload.components ?? [];

  return {
    provider: provider.name,
    profile: profile.name,
    pageUrl: provider.statusPageUrl,
    checkedAt: new Date().toISOString(),
    updatedAt: payload.page?.updated_at ?? null,
    summary: payload.status?.description ?? "Status unavailable",
    indicator: payload.status?.indicator ?? "unknown",
    components: components.map((component) => ({
      id: component.id,
      name: component.name,
      status: component.status,
      updatedAt: component.updated_at ?? null
    })),
    incidents: matchingIncidents.map((incident) => ({
      id: incident.id,
      name: incident.name,
      status: incident.status,
      impact: incident.impact,
      updatedAt: incident.updated_at ?? incident.created_at ?? null,
      url: incident.shortlink ?? provider.statusPageUrl
    })),
    note: matchingComponents.length
      ? "Filtered to official components that match this model profile."
      : "No exact model-specific public component was found, so the provider rollup is shown."
  };
}

function normalizeGoogleIncidents(payload, provider, profile) {
  const incidents = Array.isArray(payload) ? payload : [];
  const matchingIncidents = incidents.filter((incident) => textMatchesKeywords(incident, profile.componentKeywords));
  const activeIncidents = matchingIncidents.filter((incident) => !incident.end);
  const latest = matchingIncidents[0] ?? null;

  return {
    provider: provider.name,
    profile: profile.name,
    pageUrl: provider.statusPageUrl,
    checkedAt: new Date().toISOString(),
    updatedAt: latest?.modified ?? latest?.created ?? null,
    summary: activeIncidents.length ? "Active Gemini-related incident found" : "No active Gemini-related incidents found",
    indicator: activeIncidents.length ? "minor" : "none",
    components: [
      {
        id: "vertex-gemini-api",
        name: "Vertex Gemini API incident feed",
        status: activeIncidents.length ? "degraded_performance" : "operational",
        updatedAt: latest?.modified ?? null
      }
    ],
    incidents: matchingIncidents.slice(0, 5).map((incident) => ({
      id: incident.id,
      name: incident.external_desc ?? incident.service_name ?? "Google Cloud incident",
      status: incident.end ? "resolved" : "active",
      impact: incident.severity ?? incident.status_impact ?? "unknown",
      updatedAt: incident.modified ?? incident.created ?? null,
      url: `${provider.statusPageUrl}${incident.uri ?? ""}`
    })),
    note: "Google publishes a Cloud incident feed; this view filters it for Gemini-related records."
  };
}

function normalizePageOnly(provider, profile) {
  return {
    provider: provider.name,
    profile: profile.name,
    pageUrl: provider.statusPageUrl,
    checkedAt: new Date().toISOString(),
    updatedAt: null,
    summary: "Open official status page",
    indicator: "unknown",
    components: profile.componentKeywords.map((keyword) => ({
      id: keyword.toLowerCase().replaceAll(" ", "-"),
      name: keyword,
      status: "see_official_page",
      updatedAt: null
    })),
    incidents: [],
    note:
      "Google AI Studio has a dedicated status page for AI Studio and the Gemini API, but it does not expose the same simple public JSON feed used by OpenAI and Anthropic. This view links to that official page instead of substituting Google Cloud incidents."
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const provider = getProvider(searchParams.get("provider"));
  const profile = getProfile(provider, searchParams.get("profile"));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    if (provider.adapter === "page-only") {
      return NextResponse.json(normalizePageOnly(provider, profile), {
        headers: {
          "Cache-Control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`
        }
      });
    }

    const response = await fetch(provider.endpoint, {
      headers: { accept: "application/json" },
      next: { revalidate: CACHE_SECONDS },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Official status endpoint returned ${response.status}`);
    }

    const payload = await response.json();
    const data =
      provider.adapter === "google-incidents"
        ? normalizeGoogleIncidents(payload, provider, profile)
        : normalizeStatusPage(payload, provider, profile);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        provider: provider.name,
        profile: profile.name,
        pageUrl: provider.statusPageUrl,
        checkedAt: new Date().toISOString(),
        summary: "Unable to retrieve official status",
        indicator: "unknown",
        components: [],
        incidents: [],
        note: error.message
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
