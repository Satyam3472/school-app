import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import { hasAccess } from './lib/permissions';
import type { Role } from './lib/auth';

// Routes that do not require authentication
const PUBLIC_PATHS = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/register',
    '/api/health',
];

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes through
    if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
        return NextResponse.next();
    }

    // Check for auth token
    const token = request.cookies.get('token')?.value;
    if (!token) {
        // API routes get JSON 401; pages get redirected to login
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized — please log in' },
                { status: 401 }
            );
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = verifyToken(token);
    if (!payload) {
        // Token is invalid or expired — clear cookie
        if (pathname.startsWith('/api/')) {
            const response = NextResponse.json(
                { success: false, error: 'Invalid or expired token' },
                { status: 401 }
            );
            response.cookies.delete('token');
            return response;
        }
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
    }

    // Role-based access control for sub-routes
    // /dashboard and its children are open to all authenticated users.
    // Specific sub-paths can be locked down via hasAccess.
    if (pathname !== '/dashboard' && !hasAccess(payload.role as Role, pathname)) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { success: false, error: 'Forbidden — insufficient permissions' },
                { status: 403 }
            );
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Forward user context to server components via headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-role', payload.role);
    return response;
}

export const config = {
    // Apply to all routes except Next.js internals, static files, and public assets
    matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'],
};
