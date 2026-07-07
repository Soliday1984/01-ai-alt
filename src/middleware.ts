import { NextResponse, type NextRequest } from 'next/server';

const allowedPrefixes = ['/api/self-serve/'];
const blockedPrefixes = ['/api/', '/admin/', '/dashboard/', '/settings/', '/auth/'];
const blockedExactPaths = new Set([
  '/api',
  '/admin',
  '/dashboard',
  '/settings',
  '/auth',
  '/.env',
  '/.git',
  '/phpmyadmin',
  '/server-status',
  '/wp-admin',
  '/wp-login.php',
  '/xmlrpc.php',
]);
const blockedPathFragments = [
  '/.git/',
  '/.svn/',
  '/.hg/',
  '/wp-content/',
  '/wp-includes/',
  '/vendor/phpunit/',
  '/cgi-bin/',
];
const blockedExtensions = ['.php', '.asp', '.aspx', '.jsp'];
const blockedUserAgentPatterns = [
  /acunetix/i,
  /dirbuster/i,
  /masscan/i,
  /nikto/i,
  /nmap/i,
  /nuclei/i,
  /sqlmap/i,
  /wpscan/i,
  /zgrab/i,
];

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
}

function isBlockedPath(pathname: string) {
  const normalizedPath = pathname.toLowerCase();

  if (allowedPrefixes.some((prefix) => normalizedPath.startsWith(prefix))) {
    return false;
  }

  return (
    blockedExactPaths.has(normalizedPath) ||
    blockedPrefixes.some((prefix) => normalizedPath.startsWith(prefix)) ||
    blockedPathFragments.some((fragment) => normalizedPath.includes(fragment)) ||
    blockedExtensions.some((extension) => normalizedPath.endsWith(extension))
  );
}

function isBlockedUserAgent(userAgent: string) {
  return blockedUserAgentPatterns.some((pattern) => pattern.test(userAgent));
}

function textResponse(message: string, status: number) {
  return applySecurityHeaders(
    new NextResponse(message, {
      status,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    }),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') ?? '';
  const hostname = request.nextUrl.hostname.toLowerCase();

  if (hostname === 'www.imageseofix.com') {
    const url = request.nextUrl.clone();
    url.hostname = 'imageseofix.com';
    return applySecurityHeaders(NextResponse.redirect(url, 301));
  }

  if (isBlockedUserAgent(userAgent)) {
    return textResponse('Forbidden', 403);
  }

  if (isBlockedPath(pathname)) {
    return textResponse('Not found', 404);
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
