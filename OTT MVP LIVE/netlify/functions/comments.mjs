import { getStore } from "@netlify/blobs";

const store = getStore("comments");
const ALLOWED_TIP_AMOUNTS = new Set([0, 5, 20, 50]);

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

function getCommentsKey(contentId) {
  return `content/${String(contentId).replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
}

function getPinDurationMs(tipAmount) {
  if (tipAmount >= 50) return 60 * 60 * 1000;
  if (tipAmount >= 20) return 30 * 60 * 1000;
  if (tipAmount >= 5) return 10 * 60 * 1000;
  return 0;
}

function normalizeComment(input) {
  const requestedTipAmount = Math.max(0, Number(input.tipAmount) || 0);
  const tipAmount = ALLOWED_TIP_AMOUNTS.has(requestedTipAmount) ? requestedTipAmount : 0;
  const timestamp = input.timestamp || new Date().toISOString();
  const pinDurationMs = getPinDurationMs(tipAmount);
  const pinnedUntil = pinDurationMs
    ? new Date(new Date(timestamp).getTime() + pinDurationMs).toISOString()
    : null;

  return {
    id: input.id || Date.now(),
    userId: String(input.userId || "").slice(0, 200),
    displayName: String(input.displayName || "BlazeTV Fan").slice(0, 80),
    avatar: String(input.avatar || "🔥").slice(0, 8),
    text: String(input.text || "").trim().slice(0, 1000),
    tipAmount,
    timestamp,
    pinnedUntil
  };
}

export default async (request) => {
  if (request.httpMethod === "OPTIONS") {
    return json(204, {});
  }

  const contentId = request.queryStringParameters?.contentId;
  if (!contentId) {
    return json(400, { error: "Missing contentId" });
  }

  const key = getCommentsKey(contentId);

  if (request.httpMethod === "GET") {
    const comments = await store.get(key, {
      type: "json",
      consistency: "strong"
    });

    return json(200, { comments: Array.isArray(comments) ? comments : [] });
  }

  if (request.httpMethod === "POST") {
    let payload;

    try {
      payload = JSON.parse(request.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON body" });
    }

    const comment = normalizeComment(payload);
    if (!comment.text) {
      return json(400, { error: "Comment text is required" });
    }

    const existing = await store.get(key, {
      type: "json",
      consistency: "strong"
    });

    const comments = Array.isArray(existing) ? existing : [];
    comments.push(comment);

    await store.setJSON(key, comments.slice(-250));

    return json(201, { comment, comments: comments.slice(-250) });
  }

  return json(405, { error: "Method not allowed" });
};
