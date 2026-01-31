import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_ID_COOKIE_NAME = process.env.SESSION_ID_COOKIE_NAME || "emn_sid";
const SESSION_KEY_PREFIX = "emn:sess:";

function parseCookies(header: string | null) {
  const out: Record<string, string> = {};
  if (!header) return out;

  const parts = header.split(";");
  for (const p of parts) {
    const i = p.indexOf("=");
    if (i === -1) continue;
    const k = p.slice(0, i).trim();
    const v = p.slice(i + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function sessionKey(sid: string) {
  return `${SESSION_KEY_PREFIX}${sid}`;
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);

  const sid = String(cookies[SESSION_ID_COOKIE_NAME] ?? "").trim();
  let redisHit = false;

  if (sid) {
    try {
      const redis = Redis.fromEnv();
      const got = await redis.get(sessionKey(sid));
      redisHit = !!got;
    } catch {
      redisHit = false;
    }
  }

  return NextResponse.json({
    ok: true,
    host: req.headers.get("host"),
    ua: req.headers.get("user-agent"),
    hasCookieHeader: !!cookieHeader,
    cookieNames: Object.keys(cookies),
    sidPresent: !!sid,
    sidPrefix: sid ? sid.slice(0, 6) : null,
    redisHit,
  });
}
