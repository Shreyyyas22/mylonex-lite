import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  const buyerPath = path.startsWith('/buyer');
  const supplierPath = path.startsWith('/supplier');

  if (buyerPath || supplierPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const role = (token as any).role;
    if (buyerPath && role !== 'BUYER') {
      return NextResponse.redirect(new URL('/login?error=Forbidden', req.url));
    }
    if (supplierPath && role !== 'SUPPLIER') {
      return NextResponse.redirect(new URL('/login?error=Forbidden', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/buyer/:path*', '/supplier/:path*'],
};
