function json(statusCode, body) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

function matchValue(pattern, source) {
  const match = source.match(pattern);
  return match ? match[1] : "";
}

function firstMatch(patterns, source) {
  for (const pattern of patterns) {
    const value = matchValue(pattern, source);
    if (value) {
      return value;
    }
  }

  return "";
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return json(204, {});
  }

  if (request.method !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const videoId = String(new URL(request.url).searchParams.get("videoId") || "").trim();
  if (!/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) {
    return json(400, { error: "Missing or invalid videoId" });
  }

  try {
    const [oembedResponse, watchResponse] = await Promise.all([
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
        headers: { Accept: "application/json" }
      }),
      fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          Accept: "text/html"
        }
      })
    ]);

    if (!oembedResponse.ok) {
      return json(502, {
        error: "Failed to load YouTube oEmbed metadata",
        upstreamStatus: oembedResponse.status
      });
    }

    if (!watchResponse.ok) {
      return json(502, {
        error: "Failed to load YouTube watch page",
        upstreamStatus: watchResponse.status
      });
    }

    const oembed = await oembedResponse.json();
    const watchHtml = await watchResponse.text();

    const uploadDate = firstMatch([
      /uploadDate":"([0-9-]+)"/,
      /uploadDate\\":\\"([0-9-]+)\\"/,
      /dateText":\{"simpleText":"([^"]+)"/,
      /dateText\\":\{\\?"simpleText\\?":\\"([^"]+)\\"/
    ], watchHtml);
    const lengthSeconds = Number(firstMatch([
      /lengthSeconds":"([0-9]+)"/,
      /lengthSeconds\\":\\"([0-9]+)\\"/,
      /"lengthSeconds":"([0-9]+)"/
    ], watchHtml));
    const approxDurationMs = Number(firstMatch([
      /approxDurationMs":"([0-9]+)"/,
      /approxDurationMs\\":\\"([0-9]+)\\"/,
      /"approxDurationMs":"([0-9]+)"/
    ], watchHtml));

    return json(200, {
      videoId,
      title: String(oembed?.title || "").trim(),
      authorName: String(oembed?.author_name || "").trim(),
      authorHandle: String(oembed?.author_url || "").split("@")[1] || "",
      thumbnailUrl: String(oembed?.thumbnail_url || "").trim(),
      uploadDate: uploadDate || null,
      runtimeSeconds: Number.isFinite(lengthSeconds) && lengthSeconds > 0
        ? lengthSeconds
        : (Number.isFinite(approxDurationMs) && approxDurationMs > 0
          ? Math.round(approxDurationMs / 1000)
          : null)
    });
  } catch (error) {
    return json(500, {
      error: "Unexpected error loading video metadata",
      message: error instanceof Error ? error.message : String(error)
    });
  }
};
