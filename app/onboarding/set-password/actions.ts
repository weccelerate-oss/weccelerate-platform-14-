'use server';

/**
 * Server action backing /onboarding/set-password.
 *
 * Used by users who were auto-provisioned with a temp password. They are
 * already logged in (session exists), but `mustChangePassword=true` means
 * the portal layout has redirected them here. This action validates the
 * new password and clears the flag.
 */

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/auth.utils';

export interface SetPasswordState {
  success: boolean;
  message: string;
  errors?: string[];
}

const INITIAL: SetPasswordState = { success: false, message: '' };

export async function setNewPassword(
  _prev: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { ...INITIAL, message: 'הסשן פג. התחבר מחדש.' };
  }

  const password = formData.get('password');
  const confirm = formData.get('confirm');

  if (typeof password !== 'string' || typeof confirm !== 'string') {
    return { ...INITIAL, message: 'שדות חסרים' };
  }
  if (password !== confirm) {
    return { ...INITIAL, message: 'הסיסמאות לא תואמות' };
  }

  const strength = validatePasswordStrength(password);
  if (!strength.isValid) {
    return {
      ...INITIAL,
      message: 'הסיסמה אינה עומדת בדרישות',
      errors: strength.errors,
    };
  }

  const hashed = await hashPassword(password);

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        password: hashed,
        mustChangePassword: false,
      },
    });
    // Audit
    await prisma.activityLog.create({
      data: {
        action: 'user.password_set_first_login',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session.user as any).id ?? undefined,
        description: `User ${session.user.email} set permanent password after auto-provision`,
      },
    }).catch(() => { /* swallow */ });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ...INITIAL, message: `שגיאה בעדכון הסיסמה: ${msg}` };
  }

  return {
    success: true,
    message: 'הסיסמה הוגדרה. מעביר אותך להתחברות עם הסיסמה החדשה...',
  };
}
