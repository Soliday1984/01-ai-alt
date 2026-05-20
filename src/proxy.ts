import { NextResponse, type NextRequest } from 'next/server';

const blockedPrefixes = ['/api/', '/admin/', '/dashboard/', '/settings/', '/auth/'];

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (blockedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return applySecurityHeaders(
      new NextResponse('Not found', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      }),
    );
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
