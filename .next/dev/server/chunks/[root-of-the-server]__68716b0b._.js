module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/auth/auth.config.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "auth",
    ()=>auth,
    "authConfig",
    ()=>authConfig,
    "authOptions",
    ()=>authOptions,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
/**
 * NextAuth.js v5 Configuration
 * 
 * Authentication configuration for WeCcelerate platform.
 * 
 * Security Features:
 * - Credentials provider with bcrypt password hashing
 * - JWT session strategy with encrypted tokens
 * - Role-based access control (ADMIN, ENTREPRENEUR, etc.)
 * - Session includes user ID and role for authorization
 * - Protection against common attack vectors
 * 
 * @see https://authjs.dev/getting-started/installation
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/node_modules/@auth/core/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
;
// =============================================================================
// AUTH CONFIGURATION
// =============================================================================
const authConfig = {
    // Session configuration
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60
    },
    // JWT configuration
    jwt: {
        maxAge: 30 * 24 * 60 * 60
    },
    // Pages configuration
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
        verifyRequest: '/verify-email',
        newUser: '/onboarding'
    },
    // Providers
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            id: 'credentials',
            name: 'Email & Password',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'your@email.com'
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
            async authorize (credentials) {
                // Validate input
                if (!credentials?.email || !credentials?.password) {
                    console.error('[Auth] Missing credentials');
                    return null;
                }
                const email = credentials.email;
                const password = credentials.password;
                // Basic validation
                if (!email.includes('@') || password.length < 6) {
                    console.error('[Auth] Invalid email or password format');
                    return null;
                }
                try {
                    // Dynamic import Prisma only in Node.js runtime (not edge)
                    // This authorize function runs in Node.js, not edge
                    const { prisma } = await __turbopack_context__.A("[project]/lib/db.ts [app-route] (ecmascript, async loader)");
                    // Find user by email
                    const user = await prisma.user.findUnique({
                        where: {
                            email: email.toLowerCase().trim()
                        },
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            password: true,
                            role: true,
                            image: true,
                            avatar: true,
                            company: true,
                            isActive: true
                        }
                    });
                    // User not found
                    if (!user) {
                        console.error('[Auth] User not found:', email);
                        return null;
                    }
                    // Check if user is active
                    if (!user.isActive) {
                        console.error('[Auth] User is deactivated:', email);
                        return null;
                    }
                    // Check if user has password (might be OAuth-only user)
                    if (!user.password) {
                        console.error('[Auth] User has no password (OAuth only):', email);
                        return null;
                    }
                    // Verify password
                    const isValidPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, user.password);
                    if (!isValidPassword) {
                        console.error('[Auth] Invalid password for:', email);
                        return null;
                    }
                    // Update last login time (non-blocking)
                    prisma.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            lastLoginAt: new Date()
                        }
                    }).catch((err)=>console.error('[Auth] Failed to update last login:', err));
                    // Log successful login (non-blocking)
                    prisma.activityLog.create({
                        data: {
                            action: 'user.login',
                            description: 'User logged in successfully',
                            userId: user.id,
                            metadata: {
                                provider: 'credentials',
                                timestamp: new Date().toISOString()
                            }
                        }
                    }).catch((err)=>console.error('[Auth] Failed to log activity:', err));
                    console.log('[Auth] Login successful:', email);
                    // Return user object (without password)
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image || user.avatar,
                        company: user.company,
                        isActive: user.isActive
                    };
                } catch (error) {
                    console.error('[Auth] Error during authentication:', error);
                    return null;
                }
            }
        })
    ],
    // Callbacks
    callbacks: {
        /**
     * JWT Callback
     * Called whenever a JWT is created or updated
     * This is where we add custom claims to the token
     */ async jwt ({ token, user, trigger, session }) {
            // Initial sign in - add user data to token
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.company = user.company;
            }
            // Handle session update (e.g., user updates their profile)
            if (trigger === 'update' && session) {
                if (session.name) token.name = session.name;
                if (session.company) token.company = session.company;
            }
            return token;
        },
        /**
     * Session Callback
     * Called whenever a session is checked
     * This is where we expose token data to the client
     */ async session ({ session, token }) {
            // Add custom fields to session
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.company = token.company;
            }
            return session;
        },
        /**
     * Authorized Callback
     * Called to check if user is authorized to access a route
     * Used by middleware for route protection
     * 
     * NOTE: This runs in edge runtime - no Prisma access here!
     */ async authorized ({ auth, request }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = request.nextUrl;
            // Define protected routes
            const protectedRoutes = [
                '/portal',
                '/dashboard',
                '/admin'
            ];
            const adminRoutes = [
                '/admin'
            ];
            // Check if current path is protected
            const isProtectedRoute = protectedRoutes.some((route)=>pathname.startsWith(route));
            const isAdminRoute = adminRoutes.some((route)=>pathname.startsWith(route));
            // Redirect unauthenticated users from protected routes
            if (isProtectedRoute && !isLoggedIn) {
                return false; // Will redirect to signIn page
            }
            // Check admin access
            if (isAdminRoute && auth?.user?.role !== 'ADMIN') {
                return false;
            }
            // Redirect authenticated users away from auth pages
            const authRoutes = [
                '/login',
                '/register',
                '/forgot-password'
            ];
            const isAuthRoute = authRoutes.some((route)=>pathname.startsWith(route));
            if (isAuthRoute && isLoggedIn) {
                // Redirect based on role
                const redirectUrl = auth?.user?.role === 'ADMIN' ? '/admin' : '/portal/dashboard';
                return Response.redirect(new URL(redirectUrl, request.nextUrl));
            }
            return true;
        },
        /**
     * SignIn Callback
     * Called after a successful sign in
     * Can be used to add additional checks
     */ async signIn ({ user }) {
            // Check if user is active
            if (user && 'isActive' in user && !user.isActive) {
                return false;
            }
            return true;
        }
    },
    // Events
    events: {
        async signIn ({ user, account }) {
            console.log(`[Auth Event] User signed in: ${user.email} via ${account?.provider}`);
        },
        async signOut ({ token }) {
            console.log(`[Auth Event] User signed out: ${token?.email}`);
        }
    },
    // Security options
    trustHost: true,
    debug: ("TURBOPACK compile-time value", "development") === 'development'
};
const { handlers: { GET, POST }, auth, signIn, signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(authConfig);
;
const authOptions = authConfig;
}),
"[project]/lib/auth/auth.utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCurrentUser",
    ()=>getCurrentUser,
    "getSession",
    ()=>getSession,
    "hasAnyRole",
    ()=>hasAnyRole,
    "hasRole",
    ()=>hasRole,
    "hashPassword",
    ()=>hashPassword,
    "isAuthenticated",
    ()=>isAuthenticated,
    "requireAnyRole",
    ()=>requireAnyRole,
    "requireAuth",
    ()=>requireAuth,
    "requireRole",
    ()=>requireRole,
    "validatePasswordStrength",
    ()=>validatePasswordStrength,
    "verifyPassword",
    ()=>verifyPassword
]);
/**
 * Authentication Utilities
 * 
 * Helper functions for authentication and authorization.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.config.ts [app-route] (ecmascript)");
;
;
async function hashPassword(password) {
    const saltRounds = 12; // Higher = more secure but slower
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, saltRounds);
}
async function verifyPassword(password, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hash);
}
function validatePasswordStrength(password) {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
async function getSession() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
}
async function getCurrentUser() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    return session?.user ?? null;
}
async function isAuthenticated() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    return !!session?.user;
}
async function hasRole(role) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    return session?.user?.role === role;
}
async function hasAnyRole(roles) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    return !!session?.user?.role && roles.includes(session.user.role);
}
async function requireAuth() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    if (!session?.user) {
        throw new Error('Unauthorized: Authentication required');
    }
    return session.user;
}
async function requireRole(role) {
    const user = await requireAuth();
    if (user.role !== role) {
        throw new Error(`Forbidden: ${role} role required`);
    }
    return user;
}
async function requireAnyRole(roles) {
    const user = await requireAuth();
    if (!roles.includes(user.role)) {
        throw new Error(`Forbidden: One of [${roles.join(', ')}] roles required`);
    }
    return user;
} // =============================================================================
 // TYPES - exported above
 // =============================================================================
}),
"[project]/lib/auth/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * Authentication Module
 * 
 * Exports all authentication-related functionality.
 */ // Main auth exports
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.config.ts [app-route] (ecmascript)");
// Utility functions
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.utils.ts [app-route] (ecmascript)");
;
;
}),
"[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * NextAuth.js API Route Handler
 * 
 * Handles all authentication requests:
 * - POST /api/auth/signin
 * - POST /api/auth/signout
 * - GET  /api/auth/session
 * - GET  /api/auth/csrf
 * - GET  /api/auth/providers
 * - GET  /api/auth/callback/:provider
 * 
 * @module app/api/auth/[...nextauth]/route
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/auth/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.config.ts [app-route] (ecmascript)");
;
;
}),
"[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GET"],
    "POST",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["POST"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.config.ts [app-route] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__68716b0b._.js.map