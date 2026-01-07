module.exports = [
"[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Admin Server Actions
 * 
 * Server actions for content management in the admin dashboard.
 * All actions verify admin role before execution.
 */ /* __next_internal_action_entry_do_not_use__ [{"40034fc164eb1dba7e65466b788c5e9e4fb6d831d0":"deleteEventAction","4003d4fb6d7a1cc86e1ffdbac8f5ad17963f33f20b":"createUserAction","401544133c464efa021d3566366a42a5bd791e2818":"createVideoAction","4064c9275a5dd8a51cadc0c224589707f81afcb1d2":"createNewsAction","409db0a7ac0915702b227c9f5fa5fef81dae5bc3ca":"deleteNewsAction","40bd823161cabf6900e90cb4305e81d35b925124fe":"deleteVideoAction","40c888f0baa0b76a0049d380ccfd46c3dada21d6c6":"createEventAction","40ddcd56780be308d0ecaf61b2c791c4d816bdab75":"resetUserPasswordAction","40e240888895be694f8fbcd1eb82cb4838a850189a":"deleteUserAction","6039eefcab615736b376bef0e59b9ecd009f0500c1":"toggleUserActiveAction","6042942d2e43f59d874bd3c63f95d5c4b8ddfd08fb":"updateVideoAction","604af20f8edb0284e615e26c0c2df1f12b238cc1ce":"updateUserAction","60aa0a2350ac5449edf2179a1b789e931c93e23417":"updateEventAction","60b976d77fcf358c733b88e1c6ba91b72ec423d4a2":"updateNewsAction"},"",""] */ __turbopack_context__.s([
    "createEventAction",
    ()=>createEventAction,
    "createNewsAction",
    ()=>createNewsAction,
    "createUserAction",
    ()=>createUserAction,
    "createVideoAction",
    ()=>createVideoAction,
    "deleteEventAction",
    ()=>deleteEventAction,
    "deleteNewsAction",
    ()=>deleteNewsAction,
    "deleteUserAction",
    ()=>deleteUserAction,
    "deleteVideoAction",
    ()=>deleteVideoAction,
    "resetUserPasswordAction",
    ()=>resetUserPasswordAction,
    "toggleUserActiveAction",
    ()=>toggleUserActiveAction,
    "updateEventAction",
    ()=>updateEventAction,
    "updateNewsAction",
    ()=>updateNewsAction,
    "updateUserAction",
    ()=>updateUserAction,
    "updateVideoAction",
    ()=>updateVideoAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/auth/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.config.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
// =============================================================================
// HELPERS
// =============================================================================
async function verifyAdmin() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required');
    }
    return session.user;
}
async function getPrisma() {
    const { PrismaClient } = await __turbopack_context__.A("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client, async loader)");
    return new PrismaClient();
}
async function createNewsAction(data) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        const news = await prisma.newsUpdate.create({
            data: {
                title: data.title,
                titleEn: data.titleEn,
                excerpt: data.excerpt,
                link: data.link,
                urgencyLevel: data.urgencyLevel,
                isActive: data.isActive,
                isPinned: data.isPinned
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/news');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/'); // Revalidate homepage for ticker
        return {
            success: true,
            news
        };
    } catch (error) {
        console.error('[Admin] Error creating news:', error);
        return {
            success: false,
            error: 'Failed to create news update'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function updateNewsAction(id, data) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        const news = await prisma.newsUpdate.update({
            where: {
                id
            },
            data
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/news');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
        return {
            success: true,
            news
        };
    } catch (error) {
        console.error('[Admin] Error updating news:', error);
        return {
            success: false,
            error: 'Failed to update news'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function deleteNewsAction(id) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        await prisma.newsUpdate.delete({
            where: {
                id
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/news');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error deleting news:', error);
        return {
            success: false,
            error: 'Failed to delete news'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function createEventAction(data) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        const event = await prisma.event.create({
            data: {
                name: data.name,
                nameEn: data.nameEn,
                slug: data.slug,
                description: data.description,
                date: new Date(data.date),
                time: data.time,
                endTime: data.endTime,
                locationType: data.locationType,
                address: data.address,
                city: data.city,
                virtualLink: data.virtualLink,
                registrationLink: data.registrationLink,
                registrationRequired: data.registrationRequired,
                capacity: data.capacity,
                isFree: data.isFree,
                price: data.price,
                currency: data.currency,
                category: data.category,
                host: data.host,
                status: data.status,
                isActive: data.isActive,
                isFeatured: data.isFeatured,
                imageUrl: data.imageUrl
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/events');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/events');
        return {
            success: true,
            event
        };
    } catch (error) {
        console.error('[Admin] Error creating event:', error);
        return {
            success: false,
            error: 'Failed to create event'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function updateEventAction(id, data) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        const updateData = {
            ...data
        };
        if (data.date) {
            updateData.date = new Date(data.date);
        }
        const event = await prisma.event.update({
            where: {
                id
            },
            data: updateData
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/events');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/events');
        return {
            success: true,
            event
        };
    } catch (error) {
        console.error('[Admin] Error updating event:', error);
        return {
            success: false,
            error: 'Failed to update event'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function deleteEventAction(id) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        await prisma.event.delete({
            where: {
                id
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/events');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/events');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error deleting event:', error);
        return {
            success: false,
            error: 'Failed to delete event'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function createVideoAction(data) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        const video = await prisma.video.create({
            data: {
                title: data.title,
                titleEn: data.titleEn,
                slug: data.slug,
                description: data.description,
                youtubeUrl: data.youtubeUrl,
                vimeoUrl: data.vimeoUrl,
                thumbnail: data.thumbnail,
                duration: data.duration,
                category: data.category,
                tags: data.tags,
                speaker: data.speaker,
                speakerTitle: data.speakerTitle,
                isActive: data.isActive,
                isFeatured: data.isFeatured
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/videos');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/videos');
        return {
            success: true,
            video
        };
    } catch (error) {
        console.error('[Admin] Error creating video:', error);
        return {
            success: false,
            error: 'Failed to create video'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function updateVideoAction(id, data) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        const video = await prisma.video.update({
            where: {
                id
            },
            data
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/videos');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/videos');
        return {
            success: true,
            video
        };
    } catch (error) {
        console.error('[Admin] Error updating video:', error);
        return {
            success: false,
            error: 'Failed to update video'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function deleteVideoAction(id) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        await prisma.video.delete({
            where: {
                id
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/videos');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/videos');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error deleting video:', error);
        return {
            success: false,
            error: 'Failed to delete video'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function createUserAction(data) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: data.email.toLowerCase()
            }
        });
        if (existingUser) {
            return {
                success: false,
                error: 'משתמש עם אימייל זה כבר קיים'
            };
        }
        // Generate temporary password
        const tempPassword = generateTempPassword();
        const hashedPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].hash(tempPassword, 12);
        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                name: data.name,
                password: hashedPassword,
                phone: data.phone,
                company: data.company,
                position: data.position,
                role: data.role,
                isActive: true
            }
        });
        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'user.created',
                description: `User ${user.email} created by admin`,
                userId: user.id,
                metadata: {
                    createdBy: 'admin',
                    role: data.role
                }
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/users');
        // TODO: Send welcome email with temp password if sendWelcomeEmail is true
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            tempPassword
        };
    } catch (error) {
        console.error('[Admin] Error creating user:', error);
        return {
            success: false,
            error: 'Failed to create user'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function updateUserAction(id, data) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        const user = await prisma.user.update({
            where: {
                id
            },
            data: {
                name: data.name,
                phone: data.phone,
                company: data.company,
                position: data.position,
                role: data.role
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/users');
        return {
            success: true,
            user
        };
    } catch (error) {
        console.error('[Admin] Error updating user:', error);
        return {
            success: false,
            error: 'Failed to update user'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function toggleUserActiveAction(id, isActive) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        await prisma.user.update({
            where: {
                id
            },
            data: {
                isActive
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/users');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error toggling user status:', error);
        return {
            success: false,
            error: 'Failed to update user status'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function resetUserPasswordAction(id) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        const tempPassword = generateTempPassword();
        const hashedPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].hash(tempPassword, 12);
        await prisma.user.update({
            where: {
                id
            },
            data: {
                password: hashedPassword
            }
        });
        // TODO: Send email with new password
        return {
            success: true,
            tempPassword
        };
    } catch (error) {
        console.error('[Admin] Error resetting password:', error);
        return {
            success: false,
            error: 'Failed to reset password'
        };
    } finally{
        await prisma.$disconnect();
    }
}
async function deleteUserAction(id) {
    await verifyAdmin();
    const prisma = await getPrisma();
    try {
        // Soft delete - just deactivate
        await prisma.user.update({
            where: {
                id
            },
            data: {
                isActive: false
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/users');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error deleting user:', error);
        return {
            success: false,
            error: 'Failed to delete user'
        };
    } finally{
        await prisma.$disconnect();
    }
}
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
function generateTempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const specialChars = '!@#$%';
    let password = '';
    // 8 alphanumeric chars
    for(let i = 0; i < 8; i++){
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Add 1-2 special chars
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    return password;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createNewsAction,
    updateNewsAction,
    deleteNewsAction,
    createEventAction,
    updateEventAction,
    deleteEventAction,
    createVideoAction,
    updateVideoAction,
    deleteVideoAction,
    createUserAction,
    updateUserAction,
    toggleUserActiveAction,
    resetUserPasswordAction,
    deleteUserAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createNewsAction, "4064c9275a5dd8a51cadc0c224589707f81afcb1d2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateNewsAction, "60b976d77fcf358c733b88e1c6ba91b72ec423d4a2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteNewsAction, "409db0a7ac0915702b227c9f5fa5fef81dae5bc3ca", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createEventAction, "40c888f0baa0b76a0049d380ccfd46c3dada21d6c6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateEventAction, "60aa0a2350ac5449edf2179a1b789e931c93e23417", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteEventAction, "40034fc164eb1dba7e65466b788c5e9e4fb6d831d0", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createVideoAction, "401544133c464efa021d3566366a42a5bd791e2818", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateVideoAction, "6042942d2e43f59d874bd3c63f95d5c4b8ddfd08fb", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteVideoAction, "40bd823161cabf6900e90cb4305e81d35b925124fe", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createUserAction, "4003d4fb6d7a1cc86e1ffdbac8f5ad17963f33f20b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateUserAction, "604af20f8edb0284e615e26c0c2df1f12b238cc1ce", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(toggleUserActiveAction, "6039eefcab615736b376bef0e59b9ecd009f0500c1", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resetUserPasswordAction, "40ddcd56780be308d0ecaf61b2c791c4d816bdab75", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteUserAction, "40e240888895be694f8fbcd1eb82cb4838a850189a", null);
}),
"[project]/.next-internal/server/app/(admin)/admin/users/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
}),
"[project]/.next-internal/server/app/(admin)/admin/users/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "4003d4fb6d7a1cc86e1ffdbac8f5ad17963f33f20b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createUserAction"],
    "40ddcd56780be308d0ecaf61b2c791c4d816bdab75",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resetUserPasswordAction"],
    "40e240888895be694f8fbcd1eb82cb4838a850189a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteUserAction"],
    "6039eefcab615736b376bef0e59b9ecd009f0500c1",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toggleUserActiveAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$admin$292f$admin$2f$users$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(admin)/admin/users/page/actions.js { ACTIONS_MODULE0 => "[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_3ce0ecc8._.js.map