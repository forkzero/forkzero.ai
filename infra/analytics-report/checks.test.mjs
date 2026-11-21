import { describe, it, expect } from "vitest";
import { runRouteChecks, runDriftChecks, formatHealth, MONITOR_USER_AGENT } from "./checks.mjs";

const BASE = "https://forkzero.ai";
const API = "https://api.example.test/subscribe";

function html(title, body = "") {
  return `<html><head><title>${title}</title><script type="module" src="/assets/index-abc.js"></script></head><body>${body}</body></html>`;
}

/** A healthy site; tests override individual routes. */
function healthySite() {
  return {
    "/sitemap.xml": {
      body: `<?xml version="1.0"?><urlset><url><loc>${BASE}/</loc></url><url><loc>${BASE}/lattice/getting-started</loc></url></urlset>`,
      type: "application/xml",
    },
    "/": { body: html("Lattice by Forkzero"), type: "text/html" },
    "/lattice/getting-started": { body: html("Get Started with Lattice"), type: "text/html" },
    "/assets/index-abc.js": { body: "", type: "text/javascript" },
    "/lattice/install.sh": { body: "#!/bin/sh\necho hi", type: "text/plain" },
    "/lattice/install.ps1": { body: "$ErrorActionPreference = 'Stop'", type: "text/plain" },
    "/getting-started": { status: 301, location: "/lattice/getting-started" },
    "/blog/": { status: 301, location: "/blog" },
    "/__forkzero-monitor-404-check": { status: 404, body: html("Page not found — Forkzero"), type: "text/html" },
    "/robots.txt": { body: "User-agent: *", type: "text/plain" },
    "/llms.txt": { body: "# Forkzero", type: "text/plain" },
    [API]: { status: 403, body: '{"error":"Forbidden"}', type: "application/json" },
  };
}

function fakeFetch(site, seen = []) {
  return async (url, opts) => {
    seen.push({ url, opts });
    const key = url.startsWith(BASE) ? url.slice(BASE.length) : url;
    const route = site[key];
    if (route === "network-error") throw new Error("connect ECONNREFUSED");
    const r = route ?? { status: 404, body: html("Page not found — Forkzero"), type: "text/html" };
    return {
      status: r.status ?? 200,
      headers: new Map([
        ["content-type", r.type ?? ""],
        ["location", r.location ?? ""],
      ]),
      text: async () => r.body ?? "",
    };
  };
}

const goodCert = async () => new Date("2027-01-01T00:00:00Z");
const NOW = new Date("2026-11-21T00:00:00Z");

async function run(site, extra = {}) {
  return runRouteChecks({
    baseUrl: BASE,
    subscribeApiUrl: API,
    fetchImpl: fakeFetch(site),
    getCertExpiry: goodCert,
    now: NOW,
    ...extra,
  });
}

const failingNames = (checks) => checks.filter((c) => !c.ok).map((c) => c.name);

describe("runRouteChecks", () => {
  it("passes every check on a healthy site", async () => {
    const checks = await run(healthySite());
    expect(failingNames(checks)).toEqual([]);
    expect(checks.map((c) => c.name)).toEqual(
      expect.arrayContaining(["/", "/lattice/getting-started", "page assets", "/lattice/install.sh", "404 page", "subscribe API", "TLS certificate"]),
    );
  });

  it("sends the monitor user agent and never follows redirects", async () => {
    const seen = [];
    await runRouteChecks({ baseUrl: BASE, fetchImpl: fakeFetch(healthySite(), seen), getCertExpiry: goodCert, now: NOW });
    expect(seen.length).toBeGreaterThan(0);
    for (const { opts } of seen) {
      expect(opts.headers["User-Agent"]).toBe(MONITOR_USER_AGENT);
      expect(opts.redirect).toBe("manual");
    }
  });

  it("catches a sitemap page that returns 404 (the Nov 4 getting-started break)", async () => {
    const site = healthySite();
    site["/lattice/getting-started"] = { status: 404, body: html("Page not found — Forkzero"), type: "text/html" };
    const checks = await run(site);
    expect(failingNames(checks)).toEqual(["/lattice/getting-started"]);
    expect(checks.find((c) => c.name === "/lattice/getting-started").detail).toBe("HTTP 404");
  });

  it("catches the 404 page served with HTTP 200", async () => {
    const site = healthySite();
    site["/lattice/getting-started"] = { body: html("Page not found — Forkzero"), type: "text/html" };
    expect(failingNames(await run(site))).toEqual(["/lattice/getting-started"]);
  });

  it("catches a page served as the wrong content type", async () => {
    const site = healthySite();
    site["/"] = { body: "{}", type: "application/json" };
    expect(failingNames(await run(site))).toContain("/");
  });

  it("reports a missing or broken sitemap", async () => {
    const site = healthySite();
    site["/sitemap.xml"] = { status: 403, body: "denied" };
    expect(failingNames(await run(site))).toEqual(["sitemap.xml"]);

    site["/sitemap.xml"] = { body: "<urlset></urlset>", type: "application/xml" };
    expect(failingNames(await run(site))).toEqual(["sitemap.xml"]);
  });

  it("catches page assets that disappeared", async () => {
    const site = healthySite();
    delete site["/assets/index-abc.js"];
    const checks = await run(site);
    expect(failingNames(checks)).toEqual(["page assets"]);
    expect(checks.find((c) => c.name === "page assets").detail).toContain("/assets/index-abc.js HTTP 404");
  });

  it("catches an installer replaced by an HTML error page", async () => {
    const site = healthySite();
    site["/lattice/install.sh"] = { body: html("Error"), type: "text/html" };
    site["/lattice/install.ps1"] = { body: html("Error"), type: "text/html" };
    expect(failingNames(await run(site))).toEqual(["/lattice/install.sh", "/lattice/install.ps1"]);
  });

  it("catches missing or wrong redirects", async () => {
    const site = healthySite();
    site["/getting-started"] = { body: html("Old page"), type: "text/html" };
    site["/blog/"] = { status: 301, location: "/somewhere-else" };
    const checks = await run(site);
    expect(failingNames(checks)).toEqual(["/getting-started → /lattice/getting-started", "/blog/ → /blog"]);
    expect(checks.find((c) => c.name === "/blog/ → /blog").detail).toBe("redirects to /somewhere-else");
  });

  it("accepts absolute redirect locations on the same site", async () => {
    const site = healthySite();
    site["/blog/"] = { status: 301, location: `${BASE}/blog` };
    expect(failingNames(await run(site))).toEqual([]);
  });

  it("catches soft 404s", async () => {
    const site = healthySite();
    site["/__forkzero-monitor-404-check"] = { body: html("Lattice by Forkzero"), type: "text/html" };
    expect(failingNames(await run(site))).toEqual(["404 page"]);
  });

  it("catches a subscribe API that is down or accepting requests without Origin", async () => {
    const site = healthySite();
    site[API] = "network-error";
    const checks = await run(site);
    expect(failingNames(checks)).toEqual(["subscribe API"]);
    expect(checks.find((c) => c.name === "subscribe API").detail).toContain("request failed");
  });

  it("skips the subscribe API check when no URL is configured", async () => {
    const checks = await run(healthySite(), { subscribeApiUrl: undefined });
    expect(checks.map((c) => c.name)).not.toContain("subscribe API");
  });

  it("warns when the TLS certificate is close to expiry or unreadable", async () => {
    const soon = await run(healthySite(), { getCertExpiry: async () => new Date("2026-11-30T00:00:00Z") });
    expect(soon.find((c) => c.name === "TLS certificate")).toMatchObject({ ok: false, detail: "expires in 9 days" });

    const broken = await run(healthySite(), {
      getCertExpiry: async () => {
        throw new Error("timed out");
      },
    });
    expect(broken.find((c) => c.name === "TLS certificate").detail).toContain("timed out");
  });
});

const FN_ARN = "arn:aws:cloudfront::000000000000:function/forkzero-url-rewrite";
const fnAssoc = { Quantity: 1, Items: [{ EventType: "viewer-request", FunctionARN: FN_ARN }] };

function healthyConfig() {
  return {
    DefaultCacheBehavior: { TargetOriginId: "site-s3", FunctionAssociations: fnAssoc, ResponseHeadersPolicyId: "policy" },
    CacheBehaviors: {
      Quantity: 2,
      Items: [
        { PathPattern: "lattice/getting-started*", TargetOriginId: "site-s3", FunctionAssociations: fnAssoc },
        { PathPattern: "lattice/*", TargetOriginId: "installer-s3", FunctionAssociations: { Quantity: 0 } },
      ],
    },
    CustomErrorResponses: { Quantity: 1, Items: [{ ErrorCode: 404, ResponsePagePath: "/404.html", ResponseCode: "404" }] },
  };
}

async function drift({ live = "code\n", expected = "code", config = healthyConfig(), sitePaths = ["lattice/getting-started*"] } = {}) {
  return runDriftChecks({
    getLiveFunctionCode: typeof live === "function" ? live : async () => live,
    getDistributionConfig: typeof config === "function" ? config : async () => config,
    expectedFunctionCode: expected,
    sitePaths,
  });
}

describe("runDriftChecks", () => {
  it("passes when live CloudFront matches the repo", async () => {
    expect(failingNames(await drift())).toEqual([]);
  });

  it("catches a function that was edited but never published (the Nov 4 case)", async () => {
    const checks = await drift({ live: "old code" });
    expect(failingNames(checks)).toEqual(["CloudFront function matches repo"]);
    expect(checks[0].detail).toContain("setup-cloudfront.sh");
  });

  it("catches a missing site-path behavior (what caused the 404)", async () => {
    const config = healthyConfig();
    config.CacheBehaviors.Items.shift();
    const checks = await drift({ config });
    expect(checks.find((c) => !c.ok).detail).toContain("no behavior for lattice/getting-started*");
  });

  it("catches a site-path behavior ordered after the installer behavior", async () => {
    const config = healthyConfig();
    config.CacheBehaviors.Items.reverse();
    expect((await drift({ config })).find((c) => !c.ok).detail).toContain("ordered after lattice/*");
  });

  it("catches a site-path behavior pointing at the wrong bucket or without the function", async () => {
    const config = healthyConfig();
    config.CacheBehaviors.Items[0] = { PathPattern: "lattice/getting-started*", TargetOriginId: "installer-s3", FunctionAssociations: { Quantity: 0 } };
    const detail = (await drift({ config })).find((c) => !c.ok).detail;
    expect(detail).toContain("targets installer-s3");
    expect(detail).toContain("lattice/getting-started* is missing the URL function");
  });

  it("catches a default behavior without the function, headers policy or 404 page", async () => {
    const config = healthyConfig();
    config.DefaultCacheBehavior.FunctionAssociations = { Quantity: 0 };
    delete config.DefaultCacheBehavior.ResponseHeadersPolicyId;
    config.CustomErrorResponses = { Quantity: 0 };
    const detail = (await drift({ config })).find((c) => !c.ok).detail;
    expect(detail).toContain("default behavior is missing the URL function");
    expect(detail).toContain("security headers policy");
    expect(detail).toContain("404 errors are not served as /404.html");
  });

  it("reports AWS read errors as failing checks instead of throwing", async () => {
    const denied = async () => {
      throw new Error("AccessDenied");
    };
    const checks = await drift({ live: denied, config: denied });
    expect(failingNames(checks)).toEqual(["CloudFront function matches repo", "CloudFront distribution matches repo"]);
    expect(checks.every((c) => c.detail.includes("AccessDenied"))).toBe(true);
  });
});

describe("formatHealth", () => {
  it("summarises a healthy run in one line", () => {
    expect(formatHealth([{ name: "a", ok: true }, { name: "b", ok: true }])).toEqual(["Health: all 2 checks passing"]);
  });

  it("lists each failing check", () => {
    expect(
      formatHealth([
        { name: "a", ok: true },
        { name: "/lattice/getting-started", ok: false, detail: "HTTP 404" },
      ]),
    ).toEqual(["⚠ HEALTH: 1 of 2 checks failing", "  ✗ /lattice/getting-started: HTTP 404"]);
  });
});
