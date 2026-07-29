'use client';

import { useActionState, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { setNewPassword, type SetPasswordState } from './actions';

const INITIAL: SetPasswordState = { success: false, message: '' };

export function SetPasswordForm({ userEmail }: { userEmail: string }) {
  const [state, formAction, isPending] = useActionState(setNewPassword, INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { update } = useSession();

  useEffect(() => {
    if (state.success) {
      // JWTs don't refresh from the DB on their own, so the token still
      // carries mustChangePassword=true and the portal layout would bounce
      // the user straight back here. We used to solve that by signing them
      // out — which meant a brand-new entrepreneur was kicked to /login
      // seconds after arriving. Instead we clear the flag *inside* the live
      // session (the jwt callback handles trigger==='update') and walk them
      // into the portal still signed in.
      const t = setTimeout(() => {
        update({ mustChangePassword: false })
          .then(() => {
            window.location.href = '/portal/dashboard';
          })
          .catch(() => {
            window.location.href = '/portal/dashboard';
          });
      }, 800);
      return () => clearTimeout(t);
    }
  }, [state.success, update]);

  return (
    <form
      action={formAction}
      className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-sm"
    >
      {/* Display the email so user knows which account they're securing */}
      <div className="mb-5 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">חשבון</div>
        <div className="text-sm font-mono text-white/80" dir="ltr">{userEmail}</div>
      </div>

      <Field
        name="password"
        label="סיסמה חדשה"
        show={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
        disabled={isPending}
      />
      <Field
        name="confirm"
        label="אישור סיסמה"
        show={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        disabled={isPending}
      />

      <ul className="mb-5 space-y-1 text-[11px] text-white/40">
        <li>· לפחות 8 תווים</li>
        <li>· אות גדולה אחת לפחות (A-Z)</li>
        <li>· אות קטנה אחת לפחות (a-z)</li>
        <li>· מספר אחד לפחות</li>
        <li>· תו מיוחד אחד לפחות (!@#$%^&*-)</li>
      </ul>

      {state.message && !state.success && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <div>{state.message}</div>
            {state.errors && state.errors.length > 0 && (
              <ul className="mt-1 list-disc pr-5 text-xs">
                {state.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {state.success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          <CheckCircle className="w-4 h-4" />
          הסיסמה הוגדרה. מעביר אותך להתחברות עם הסיסמה החדשה...
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || state.success}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-6 py-3 font-bold rounded-xl shadow-lg shadow-[#c8a951]/20 hover:shadow-xl hover:shadow-[#c8a951]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
        הגדר סיסמה והמשך
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  show,
  onToggle,
  disabled,
}: {
  name: string;
  label: string;
  show: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? 'text' : 'password'}
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          disabled={disabled}
          dir="ltr"
          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 pe-12 text-white placeholder:text-white/30 focus:border-[#c8a951]/50 focus:outline-none focus:ring-2 focus:ring-[#c8a951]/20 transition disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
          aria-label={show ? 'הסתר סיסמה' : 'הצג סיסמה'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
