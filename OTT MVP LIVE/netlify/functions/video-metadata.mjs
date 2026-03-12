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

function matchValue(pattern, source) {
  const match = source.match(pattern);
  return match ? match[1] : "";
}

export default async (request) => {
  if (request.httpMethod === "OPTIONS") {
    return json(204, {});
  }

  if (request.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const videoId = String(request.queryStringParameters?.videoId || "").trim();
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

    const uploadDate = matchValue(/uploadDate":"([0-9-]+)"/, watchHtml)
      || matchValue(/dateText":\{"simpleText":"([^"]+)"/, watchHtml);
    const lengthSeconds = Number(matchValue(/lengthSeconds":"([0-9]+)"/, watchHtml));
    const approxDurationMs = Number(matchValue(/approxDurationMs":"([0-9]+)"/, watchHtml));

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
