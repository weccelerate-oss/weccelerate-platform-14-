'use server';

/**
 * Auth Server Actions — Password Reset Flow
 *
 * Security:
 * - Tokens are hashed (SHA-256) before storage; only the raw token goes in the email
 * - Always returns success for email lookup (doesn't reveal if account exists)
 * - Tokens expire after 1 hour
 * - Old tokens are deleted before creating new ones
 */

import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/auth.utils';

// =============================================================================
// TYPES
// =============================================================================

export interface AuthActionState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// =============================================================================
// HELPERS
// =============================================================================

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getBaseUrl(): string {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// =============================================================================
// EMAIL TEMPLATE
// =============================================================================

function buildResetEmail(resetUrl: string, lang: string = 'he'): { html: string; text: string } {
  const isHe = lang === 'he';
  const dir = isHe ? 'rtl' : 'ltr';

  const subject = isHe ? 'איפוס סיסמה — WeCcelerate' : 'Password Reset — WeCcelerate';
  const heading = isHe ? 'איפוס סיסמה' : 'Password Reset';
  const intro = isHe
    ? 'קיבלנו בקשה לאיפוס הסיסמה שלכם. לחצו על הכפתור למטה כדי לבחור סיסמה חדשה:'
    : 'We received a request to reset your password. Click the button below to choose a new password:';
  const buttonText = isHe ? 'איפוס סיסמה' : 'Reset Password';
  const expiry = isHe
    ? 'קישור זה תקף לשעה אחת בלבד.'
    : 'This link is valid for one hour only.';
  const ignore = isHe
    ? 'אם לא ביקשתם איפוס סיסמה, ניתן להתעלם מהודעה זו.'
    : "If you didn't request a password reset, you can safely ignore this email.";
  const footer = isHe ? 'WeCcelerate — Venture Builder & Startup Accelerator' : 'WeCcelerate — Venture Builder & Startup Accelerator';

  const html = `
<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:500px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#070b1e,#0d1321);padding:32px 24px;text-align:center;">
            <h1 style="margin:0;color:#c8a951;font-size:22px;letter-spacing:1px;">WeCcelerate</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 24px;text-align:${isHe ? 'right' : 'left'};direction:${dir};">
            <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">${heading}</h2>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">${intro}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:8px 0 24px;">
                <a href="${resetUrl}" target="_blank" style="display:inline-block;background:linear-gradient(to right,#c8a951,#e8d48b);color:#070b1e;font-weight:bold;font-size:16px;padding:14px 36px;border-radius:8px;text-decoration:none;">${buttonText}</a>
              </td></tr>
            </table>
            <p style="margin:0 0 12px;color:#888;font-size:13px;line-height:1.6;">${expiry}</p>
            <p style="margin:0;color:#aaa;font-size:12px;line-height:1.6;">${ignore}</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 24px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;color:#bbb;font-size:11px;">${footer}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${heading}\n\n${intro}\n\n${resetUrl}\n\n${expiry}\n${ignore}\n\n${footer}`;

  return { html, text };
}

// =============================================================================
// REQUEST PASSWORD RESET
// =============================================================================

const requestResetSchema = z.object({
  email: z.string().min(1).email(),
});

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  // Validate
  const raw = { email: formData.get('email') as string };
  const parsed = requestResetSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid email',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const lang = (formData.get('lang') as string) || 'he';

  try {
    // Look up user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isActive: true },
    });

    // If user exists and is active, create token and send email
    if (user?.isActive) {
      // Generate token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = hashToken(rawToken);
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete any existing tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Create new token
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: hashedToken,
          expires,
        },
      });

      // Build reset URL with raw (unhashed) token
      const baseUrl = getBaseUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

      // Send email via Resend
      if (!process.env.RESEND_API_KEY) {
        console.error('[Auth] RESEND_API_KEY is not configured — cannot send password reset email');
        console.log('[Auth] Reset URL (for dev):', resetUrl);
        // In development, still return success so we can test the flow
      } else {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { html, text } = buildResetEmail(resetUrl, lang);

        const emailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'WeCcelerate <noreply@weccelerate.com>',
          to: email,
          subject: lang === 'he' ? 'איפוס סיסמה — WeCcelerate' : 'Password Reset — WeCcelerate',
          html,
          text,
        });

        if (emailResult.error) {
          console.error('[Auth] Failed to send reset email:', emailResult.error);
          return {
            success: false,
            message: 'Email send failed',
          };
        }
      }
    }

    // Always return success (don't reveal if account exists)
    return {
      success: true,
      message: 'Reset link sent',
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: 'Server error',
    };
  }
}

// =============================================================================
// RESET PASSWORD
// =============================================================================

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function resetPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    token: formData.get('token') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation error',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { token, email, password } = parsed.data;
  const hashedToken = hashToken(token);

  try {
    // Look up token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase().trim(),
        token: hashedToken,
      },
    });

    if (!verificationToken) {
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }

    // Check expiry
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.deleteMany({
        where: { identifier: email.toLowerCase().trim(), token: hashedToken },
      });
      return {
        success: false,
        message: 'Token expired',
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase().trim() },
    });

    return {
      success: true,
      message: 'Password updated',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message: 'Server error',
    };
  }
}
