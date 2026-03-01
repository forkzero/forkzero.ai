/**
 * CloudFront Function (viewer-request): rewrite clean URLs to /index.html.
 *
 * Converts paths like /blog/my-post → /blog/my-post/index.html so that
 * S3 REST API origin resolves pre-rendered HTML files.
 *
 * - Skips URIs that already have a file extension (.js, .css, .xml, etc.)
 * - Skips root "/" (handled by CloudFront Default Root Object)
 * - Non-pre-rendered routes still work: S3 returns 404 → CloudFront custom
 *   error response serves the SPA shell (/index.html with 200).
 *
 * Runtime: cloudfront-js-2.0
 */
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Skip root — CloudFront Default Root Object handles it
  if (uri === '/') {
    return request;
  }

  // Skip URIs that already have a file extension
  if (/\.\w+$/.test(uri)) {
    return request;
  }

  // Strip trailing slash, then append /index.html
  if (uri.endsWith('/')) {
    uri = uri.slice(0, -1);
  }
  request.uri = uri + '/index.html';

  return request;
}
