import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOGO_PATH = '/img/logo/LogoStronaPrzezroczyste.png';
const FAVICON_PATH = '/img/logo/LogoFav.png';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === LOGO_PATH) {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = '/api/branding/logo';
    return NextResponse.rewrite(nextUrl);
  }

  if (request.nextUrl.pathname === FAVICON_PATH) {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = '/api/branding/favicon';
    return NextResponse.rewrite(nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [LOGO_PATH, FAVICON_PATH],
};
