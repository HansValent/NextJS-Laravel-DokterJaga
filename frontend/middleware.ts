// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROLES = ['super admin', 'admin', 'editor', 'power user', 'igd', 'icu', 'users'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('auth_token')?.value;
  const rawRoles = req.cookies.get('user_roles')?.value;

  let roles: string[] = [];
  if (rawRoles) {
    try {
      roles = JSON.parse(decodeURIComponent(rawRoles)).map((r: string) =>
        r.trim().toLowerCase()
      );
    } catch {
      roles = [];
    }
  }

  const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r));
  const isDokter = roles.includes('dokter');
  const isPasien = roles.includes('pasien');

  // 1. Proteksi Dashboard Admin (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?message=unauthorized', req.url));
    }
    if (!isAdmin) {
      if (isDokter) return NextResponse.redirect(new URL('/dokter/dashboard', req.url));
      if (isPasien) return NextResponse.redirect(new URL('/pasien', req.url));
      return NextResponse.redirect(new URL('/login?message=unauthorized', req.url));
    }
  }

  // 2. Proteksi Dashboard Dokter (/dokter/*)
  if (pathname.startsWith('/dokter/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?message=unauthorized', req.url));
    }
    if (!isDokter && !isAdmin) {
      if (isPasien) return NextResponse.redirect(new URL('/pasien', req.url));
      return NextResponse.redirect(new URL('/login?message=unauthorized', req.url));
    }
  }

  // 3. Proteksi Portal Pasien (/pasien/*)
  if (pathname.startsWith('/pasien')) {
    if (!token || !isPasien) {
      return NextResponse.redirect(new URL('/home', req.url));
    }
  }

  // 4. Jika user sudah login dan membuka /login, arahkan sesuai role
  if (pathname === '/login' && token) {
    if (isAdmin) return NextResponse.redirect(new URL('/admin', req.url));
    if (isDokter) return NextResponse.redirect(new URL('/dokter/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dokter/dashboard/:path*', '/pasien/:path*', '/login'],
};