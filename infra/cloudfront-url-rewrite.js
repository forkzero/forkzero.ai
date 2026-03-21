/**
 * CloudFront Function (viewer-request): rewrite clean URLs to /index.html
 * and redirect trailing slashes to their canonical non-trailing form.
 *
 * Converts paths like /blog/my-post → /blog/my-post/index.html so that
 * S3 REST API origin resolves pre-rendered HTML files.
 *
 * - Redirects trailing slashes: /blog/ → 301 → /blog
 * - Skips URIs that already have a file extension (.js, .css, .xml, etc.)
 * - Skips root "/" (handled by CloudFront Default Root Object)
 * - Non-pre-rendered routes: S3 returns 404 → CloudFront custom error
 *   response serves /404.html with HTTP 404.
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

  // Redirect trailing slash to non-trailing (301)
  if (uri.endsWith('/')) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: uri.slice(0, -1) },
        'cache-control': { value: 'public, max-age=86400' },
      },
    };
  }

  // Rewrite clean URL to /index.html for S3 lookup
  request.uri = uri + '/index.html';

  return request;
}
