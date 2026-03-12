const BLAZETV_SITE_UID = "blazetv";
const BLAZETV_LIVE_ASSET_ID = "5e3bad54c1885760b806a3a5";
const UPSTREAM_URL = `https://ga-prod-api.powr.tv/v2/sites/${BLAZETV_SITE_UID}/assets/${BLAZETV_LIVE_ASSET_ID}/live`;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

function normalizeEvent(event) {
  return {
    id: String(event?.uid || event?._id?.uid || event?._id || ""),
    title: String(event?.title || "").trim(),
    description: String(event?.description || "").trim(),
    start: event?.start || event?.liveEvent?.start || null,
    thumbnail: String(
      event?.metadata?.thumbnails?.maxres ||
      event?.customThumbnail ||
      event?.thumbnail ||
      ""
    ),
    status: String(event?.status || "").trim()
  };
}

export default async (request) => {
  if (request.httpMethod === "OPTIONS") {
    return json(204, {});
  }

  if (request.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const response = await fetch(UPSTREAM_URL, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return json(502, {
        error: "Failed to load BlazeTV schedule",
        upstreamStatus: response.status
      });
    }

    const payload = await response.json();
    const events = Array.isArray(payload?.events)
      ? payload.events.map(normalizeEvent).filter((event) => event.title && event.start)
      : [];

    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return json(200, {
      assetId: BLAZETV_LIVE_ASSET_ID,
      siteUid: BLAZETV_SITE_UID,
      fetchedAt: new Date().toISOString(),
      events
    });
  } catch (error) {
    return json(500, {
      error: "Unexpected error loading BlazeTV schedule",
      message: error instanceof Error ? error.message : String(error)
    });
  }
};
