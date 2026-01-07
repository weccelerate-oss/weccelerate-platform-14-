/**
 * Create User Dialog Component
 * 
 * Modal dialog for creating new users with temporary password.
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createUserAction, type CreateUserFormData } from '../actions';
import type { UserRole } from '@prisma/client';

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: 'ENTREPRENEUR', label: 'יזם', description: 'משתמש רגיל עם גישה לפורטל' },
  { value: 'MENTOR', label: 'מנטור', description: 'מנטור עם גישה לפרויקטים' },
  { value: 'INVESTOR', label: 'משקיע', description: 'משקיע עם גישת צפייה' },
  { value: 'PARTNER', label: 'שותף', description: 'שותף עסקי' },
];

export function CreateUserDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    user: { id: string; email: string; name: string };
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<CreateUserFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    role: 'ENTREPRENEUR',
    sendWelcomeEmail: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      role: 'ENTREPRENEUR',
      sendWelcomeEmail: true,
    });
    setError(null);
    setResult(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('נדרש שם ואימייל');
      return;
    }

    startTransition(async () => {
      const response = await createUserAction(formData);

      if (response.success && response.user && response.tempPassword) {
        setResult({
          user: response.user,
          tempPassword: response.tempPassword,
        });
        router.refresh();
      } else {
        setError(response.error || 'שגיאה ביצירת משתמש');
      }
    });
  };

  const handleCopyPassword = () => {
    if (result?.tempPassword) {
      navigator.clipboard.writeText(result.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl font-medium transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>הוסף משתמש</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {result ? 'משתמש נוצר בהצלחה!' : 'הוסף משתמש חדש'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {result ? (
                // Success state
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {result.user.name}
                  </h3>
                  <p className="text-slate-500 mb-6">{result.user.email}</p>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-right">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      סיסמה זמנית (העתק ושלח למשתמש)
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-4 py-2 rounded-lg border border-amber-200 font-mono text-lg">
                        {result.tempPassword}
                      </code>
                      <button
                        onClick={handleCopyPassword}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          copied
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        )}
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ הסיסמה תוצג פעם אחת בלבד. ודא שהעתקת אותה.
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    סגור
                  </button>
                </div>
              ) : (
                // Form
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      שם מלא *
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="ישראל ישראלי"
                        className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      אימייל *
                    </label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        dir="ltr"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      טלפון
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        dir="ltr"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="050-000-0000"
                        className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      />
                    </div>
                  </div>

                  {/* Company & Position */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        חברה
                      </label>
                      <div className="relative">
                        <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="שם החברה"
                          className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        תפקיד
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          placeholder="מנכ״ל"
                          className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      תפקיד במערכת
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLE_OPTIONS.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: role.value })}
                          className={cn(
                            'p-3 rounded-lg border text-right transition-all',
                            formData.role === role.value
                              ? 'border-royal-500 bg-royal-50 ring-2 ring-royal-500/20'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                        >
                          <p className="font-medium text-sm">{role.label}</p>
                          <p className="text-xs text-slate-500">{role.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Send welcome email */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendWelcomeEmail}
                      onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-royal-600 focus:ring-royal-500"
                    />
                    <span className="text-sm text-slate-700">שלח מייל ברוכים הבאים עם פרטי התחברות</span>
                  </label>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                      ביטול
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className={cn(
                        'flex-1 py-3 bg-royal-600 text-white rounded-xl font-medium',
                        'hover:bg-royal-700 disabled:opacity-70 disabled:cursor-not-allowed',
                        'transition-colors flex items-center justify-center gap-2'
                      )}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>יוצר...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>צור משתמש</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateUserDialog;
