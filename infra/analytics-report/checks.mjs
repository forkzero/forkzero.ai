/**
 * Health checks for forkzero.ai, shared by the 5-minute monitor
 * (monitor.mjs) and the daily analytics email (index.mjs).
 *
 * Every check returns { name, ok, detail }. Nothing here talks to AWS
 * directly: CloudFront reads and the TLS lookup are passed in, so the logic
 * is unit-tested in checks.test.mjs without network or credentials.
 */

import tls from "node:tls";

/** Sent on every check request; the daily report filters it out of traffic stats. */
export const MONITOR_USER_AGENT = "forkzero-monitor/1.0 (+https://forkzero.ai)";

const TIMEOUT_MS = 10_000;
const CERT_MIN_DAYS = 14;

function pass(name, detail = "") {
  return { name, ok: true, detail };
}

function fail(name, detail) {
  return { name, ok: false, detail };
}

function makeRequester(baseUrl, fetchImpl) {
  return async function request(pathOrUrl, { method = "GET", headers = {}, body } = {}) {
    const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${baseUrl}${pathOrUrl}`;
    try {
      const res = await fetchImpl(url, {
        method,
        body,
        redirect: "manual",
        headers: { "User-Agent": MONITOR_USER_AGENT, ...headers },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const text = method === "HEAD" ? "" : await res.text();
      return {
        status: res.status,
        location: res.headers.get("location") || "",
        contentType: res.headers.get("content-type") || "",
        text,
      };
    } catch (err) {
      return { status: 0, location: "", contentType: "", text: "", error: err?.message || String(err) };
    }
  };
}

function describe(res) {
  return res.status === 0 ? `request failed: ${res.error}` : `HTTP ${res.status}`;
}

function sitemapPaths(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    const url = new URL(m[1].trim());
    return url.pathname + url.search;
  });
}

function assetPaths(html) {
  return [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
}

function getCertExpiryDefault(host) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port: 443, servername: host, timeout: TIMEOUT_MS }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      resolve(new Date(cert.valid_to));
    });
    socket.on("timeout", () => socket.destroy(new Error("TLS connect timed out")));
    socket.on("error", reject);
  });
}

/**
 * Checks what visitors see: every sitemap page, the JS/CSS those pages load,
 * the installer, redirects, the 404 page, crawler files, the subscribe API
 * and the TLS certificate.
 */
export async function runRouteChecks({
  baseUrl = "https://forkzero.ai",
  subscribeApiUrl,
  fetchImpl = fetch,
  getCertExpiry = getCertExpiryDefault,
  now = new Date(),
} = {}) {
  const request = makeRequester(baseUrl, fetchImpl);
  const checks = [];

  // Pages from the sitemap (new pages and posts are covered automatically)
  const sitemap = await request("/sitemap.xml");
  let pages = [];
  if (sitemap.status === 200 && sitemap.text.includes("<urlset")) {
    pages = sitemapPaths(sitemap.text);
    checks.push(pages.length > 0 ? pass("sitemap.xml", `${pages.length} pages`) : fail("sitemap.xml", "no <loc> entries"));
  } else {
    checks.push(fail("sitemap.xml", describe(sitemap)));
  }

  const assets = new Set();
  const pageResults = await Promise.all(pages.map(async (path) => [path, await request(path)]));
  for (const [path, res] of pageResults) {
    if (res.status !== 200) {
      checks.push(fail(path, describe(res)));
    } else if (!res.contentType.startsWith("text/html")) {
      checks.push(fail(path, `expected HTML, got ${res.contentType || "no content-type"}`));
    } else if (res.text.includes("<title>Page not found")) {
      checks.push(fail(path, "served the 404 page with HTTP 200"));
    } else {
      checks.push(pass(path));
      assetPaths(res.text).forEach((a) => assets.add(a));
    }
  }

  // Every JS/CSS file the pages reference (catches a deploy that dropped chunks)
  const assetResults = await Promise.all([...assets].map(async (path) => [path, await request(path, { method: "HEAD" })]));
  const missing = assetResults.filter(([, res]) => res.status !== 200);
  checks.push(
    missing.length === 0
      ? pass("page assets", `${assets.size} files`)
      : fail("page assets", missing.map(([p, res]) => `${p} ${describe(res)}`).join(", ")),
  );

  // Installer (served from a different bucket through the lattice/* behavior)
  const sh = await request("/lattice/install.sh");
  checks.push(
    sh.status === 200 && sh.text.startsWith("#!")
      ? pass("/lattice/install.sh")
      : fail("/lattice/install.sh", sh.status === 200 ? "not a shell script" : describe(sh)),
  );
  const ps1 = await request("/lattice/install.ps1");
  checks.push(
    ps1.status === 200 && ps1.text.length > 0 && !ps1.text.trimStart().startsWith("<")
      ? pass("/lattice/install.ps1")
      : fail("/lattice/install.ps1", ps1.status === 200 ? "not a PowerShell script" : describe(ps1)),
  );

  // Redirects
  for (const [from, to] of [
    ["/getting-started", "/lattice/getting-started"],
    ["/blog/", "/blog"],
  ]) {
    const res = await request(from, { method: "HEAD" });
    const target = res.location.replace(baseUrl, "");
    checks.push(
      res.status === 301 && target === to
        ? pass(`${from} → ${to}`)
        : fail(`${from} → ${to}`, res.status === 301 ? `redirects to ${res.location}` : describe(res)),
    );
  }

  // Unknown paths get a real 404
  const missingPage = await request("/__forkzero-monitor-404-check");
  checks.push(
    missingPage.status === 404 && missingPage.text.includes("Page not found")
      ? pass("404 page")
      : fail("404 page", missingPage.status === 404 ? "404 without the 404 page" : describe(missingPage)),
  );

  // Crawler files
  for (const path of ["/robots.txt", "/llms.txt"]) {
    const res = await request(path);
    checks.push(res.status === 200 ? pass(path) : fail(path, describe(res)));
  }

  // Subscribe API is up (a request without Origin is rejected; nobody is subscribed)
  if (subscribeApiUrl) {
    const res = await request(subscribeApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "monitor@forkzero.ai" }),
    });
    checks.push(res.status === 403 ? pass("subscribe API") : fail("subscribe API", `expected 403 for a request without Origin, got ${describe(res)}`));
  }

  // TLS certificate
  try {
    const host = new URL(baseUrl).hostname;
    const expires = await getCertExpiry(host);
    const days = Math.floor((expires.getTime() - now.getTime()) / 86_400_000);
    checks.push(days >= CERT_MIN_DAYS ? pass("TLS certificate", `${days} days left`) : fail("TLS certificate", `expires in ${days} days`));
  } catch (err) {
    checks.push(fail("TLS certificate", `lookup failed: ${err?.message || err}`));
  }

  return checks;
}

/**
 * Checks the live CloudFront setup matches the repo: the published URL
 * function equals infra/cloudfront-url-rewrite.js, and the distribution has
 * the behaviors and error responses infra/setup-cloudfront.sh configures.
 * A failure usually means setup-cloudfront.sh needs running.
 */
export async function runDriftChecks({
  getLiveFunctionCode,
  getDistributionConfig,
  expectedFunctionCode,
  sitePaths,
  functionName = "forkzero-url-rewrite",
}) {
  const checks = [];
  const hint = "run infra/setup-cloudfront.sh";

  try {
    const live = await getLiveFunctionCode();
    checks.push(
      live.trimEnd() === expectedFunctionCode.trimEnd()
        ? pass("CloudFront function matches repo")
        : fail("CloudFront function matches repo", `live code differs from infra/cloudfront-url-rewrite.js; ${hint}`),
    );
  } catch (err) {
    checks.push(fail("CloudFront function matches repo", `could not read live function: ${err?.message || err}`));
  }

  let config;
  try {
    config = await getDistributionConfig();
  } catch (err) {
    checks.push(fail("CloudFront distribution matches repo", `could not read config: ${err?.message || err}`));
    return checks;
  }

  const hasFunction = (behavior) =>
    (behavior?.FunctionAssociations?.Items || []).some(
      (a) => a.EventType === "viewer-request" && a.FunctionARN.endsWith(`:function/${functionName}`),
    );

  const problems = [];
  const defaults = config.DefaultCacheBehavior;
  if (!hasFunction(defaults)) problems.push("default behavior is missing the URL function");
  if (!defaults?.ResponseHeadersPolicyId) problems.push("default behavior is missing the security headers policy");

  const behaviors = config.CacheBehaviors?.Items || [];
  const firstOtherIndex = behaviors.findIndex((b) => !sitePaths.includes(b.PathPattern));
  for (const path of sitePaths) {
    const index = behaviors.findIndex((b) => b.PathPattern === path);
    const behavior = behaviors[index];
    if (!behavior) {
      problems.push(`no behavior for ${path}`);
      continue;
    }
    if (firstOtherIndex !== -1 && index > firstOtherIndex) problems.push(`${path} is ordered after ${behaviors[firstOtherIndex].PathPattern}`);
    if (behavior.TargetOriginId !== defaults?.TargetOriginId) problems.push(`${path} targets ${behavior.TargetOriginId}, not the site bucket`);
    if (!hasFunction(behavior)) problems.push(`${path} is missing the URL function`);
  }

  const notFound = (config.CustomErrorResponses?.Items || []).find((e) => e.ErrorCode === 404);
  if (!notFound || notFound.ResponsePagePath !== "/404.html" || String(notFound.ResponseCode) !== "404") {
    problems.push("404 errors are not served as /404.html with status 404");
  }

  checks.push(
    problems.length === 0
      ? pass("CloudFront distribution matches repo")
      : fail("CloudFront distribution matches repo", `${problems.join("; ")}; ${hint}`),
  );
  return checks;
}

/** Plain-text health section for emails and logs. */
export function formatHealth(checks) {
  const failing = checks.filter((c) => !c.ok);
  if (failing.length === 0) return [`Health: all ${checks.length} checks passing`];
  return [
    `⚠ HEALTH: ${failing.length} of ${checks.length} checks failing`,
    ...failing.map((c) => `  ✗ ${c.name}: ${c.detail}`),
  ];
}
