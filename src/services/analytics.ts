import { AnalyticsEvent, UTMParams } from "../types";

const UTM_STORAGE_KEY = "carta_magica_utm";

// Extract UTM parameters from current URL or fallback to stored UTM
export function initUTMTracking(): UTMParams {
  if (typeof window === "undefined") return {};

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source");
  const utmMedium = urlParams.get("utm_medium");
  const utmCampaign = urlParams.get("utm_campaign");
  const utmContent = urlParams.get("utm_content");
  const utmTerm = urlParams.get("utm_term");
  const ref = urlParams.get("ref");

  let params: UTMParams = {};

  if (utmSource || utmMedium || utmCampaign || utmContent || utmTerm || ref) {
    params = {
      utm_source: utmSource || undefined,
      utm_medium: utmMedium || undefined,
      utm_campaign: utmCampaign || undefined,
      utm_content: utmContent || undefined,
      utm_term: utmTerm || undefined,
      ref: ref || undefined,
    };
    try {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
    } catch {
      // safe fallback
    }
  } else {
    try {
      const stored = localStorage.getItem(UTM_STORAGE_KEY);
      if (stored) {
        params = JSON.parse(stored);
      }
    } catch {
      // safe fallback
    }
  }

  return params;
}

export function getUTMParams(): UTMParams {
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Modular Analytics Event Tracker
export function trackEvent(
  eventName: AnalyticsEvent,
  payload: Record<string, any> = {}
) {
  const utm = getUTMParams();
  const eventData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    utm,
    ...payload,
  };

  // Safe developer log
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Carta Mágica Analytics] ${eventName}`, eventData);
  }

  // Push to GTM / Meta Pixel dataLayer if present on host
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push(eventData);
  }

  // Fire-and-forget reporting to backend API
  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    }).catch(() => {});
  } catch {
    // silently catch network failures
  }
}
