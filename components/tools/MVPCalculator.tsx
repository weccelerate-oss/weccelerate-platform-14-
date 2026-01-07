/**
 * MVP Cost Calculator
 * 
 * Interactive lead magnet tool for capturing high-quality entrepreneur leads.
 * Multi-step wizard that calculates estimated MVP development costs.
 * 
 * Strategy:
 * - Engage users with interactive selection
 * - Build perceived value through detailed questions
 * - Gate the final result behind email capture
 * - Send rich lead data to Pipedrive
 * 
 * @module components/tools/MVPCalculator
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Globe,
  Monitor,
  Brain,
  Database,
  Lock,
  CreditCard,
  Shield,
  FileCheck,
  Users,
  Zap,
  BarChart3,
  Cloud,
  Bell,
  Map,
  MessageSquare,
  Video,
  Calendar,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Loader2,
  Send,
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createLeadAction, type FormState } from '@/app/actions/leads';

// =============================================================================
// TYPES
// =============================================================================

interface PlatformOption {
  id: string;
  label: string;
  labelHe: string;
  icon: React.ReactNode;
  basePoints: number;
  description: string;
}

interface FeatureOption {
  id: string;
  label: string;
  labelHe: string;
  icon: React.ReactNode;
  points: number;
  category: 'core' | 'advanced' | 'medical';
  description: string;
}

interface CalculatorState {
  platform: string[];
  features: string[];
  timeline: string;
  budget: string;
}

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
}

// =============================================================================
// DATA
// =============================================================================

const PLATFORMS: PlatformOption[] = [
  {
    id: 'web',
    label: 'Web App',
    labelHe: 'אפליקציית ווב',
    icon: <Globe className="w-6 h-6" />,
    basePoints: 15000,
    description: 'Responsive web application',
  },
  {
    id: 'mobile-ios',
    label: 'iOS App',
    labelHe: 'אפליקציית iOS',
    icon: <Smartphone className="w-6 h-6" />,
    basePoints: 25000,
    description: 'Native iPhone/iPad app',
  },
  {
    id: 'mobile-android',
    label: 'Android App',
    labelHe: 'אפליקציית Android',
    icon: <Smartphone className="w-6 h-6" />,
    basePoints: 20000,
    description: 'Native Android app',
  },
  {
    id: 'desktop',
    label: 'Desktop App',
    labelHe: 'אפליקציית דסקטופ',
    icon: <Monitor className="w-6 h-6" />,
    basePoints: 18000,
    description: 'Windows/Mac application',
  },
];

const FEATURES: FeatureOption[] = [
  // Core Features
  {
    id: 'auth',
    label: 'User Authentication',
    labelHe: 'מערכת הרשמה והתחברות',
    icon: <Lock className="w-5 h-5" />,
    points: 5000,
    category: 'core',
    description: 'Login, registration, password reset',
  },
  {
    id: 'database',
    label: 'Database & Storage',
    labelHe: 'מסד נתונים ואחסון',
    icon: <Database className="w-5 h-5" />,
    points: 8000,
    category: 'core',
    description: 'Data storage and management',
  },
  {
    id: 'dashboard',
    label: 'Admin Dashboard',
    labelHe: 'לוח בקרה למנהל',
    icon: <BarChart3 className="w-5 h-5" />,
    points: 10000,
    category: 'core',
    description: 'Analytics and management panel',
  },
  {
    id: 'notifications',
    label: 'Push Notifications',
    labelHe: 'התראות Push',
    icon: <Bell className="w-5 h-5" />,
    points: 4000,
    category: 'core',
    description: 'Real-time alerts and updates',
  },
  
  // Advanced Features
  {
    id: 'ai',
    label: 'AI Integration',
    labelHe: 'אינטגרציית AI',
    icon: <Brain className="w-5 h-5" />,
    points: 20000,
    category: 'advanced',
    description: 'Machine learning & AI features',
  },
  {
    id: 'payments',
    label: 'Payment Processing',
    labelHe: 'עיבוד תשלומים',
    icon: <CreditCard className="w-5 h-5" />,
    points: 8000,
    category: 'advanced',
    description: 'Credit cards, subscriptions',
  },
  {
    id: 'chat',
    label: 'Real-time Chat',
    labelHe: "צ'אט בזמן אמת",
    icon: <MessageSquare className="w-5 h-5" />,
    points: 12000,
    category: 'advanced',
    description: 'Messaging and communication',
  },
  {
    id: 'video',
    label: 'Video Calls',
    labelHe: 'שיחות וידאו',
    icon: <Video className="w-5 h-5" />,
    points: 15000,
    category: 'advanced',
    description: 'Video conferencing integration',
  },
  {
    id: 'maps',
    label: 'Maps & Location',
    labelHe: 'מפות ומיקום',
    icon: <Map className="w-5 h-5" />,
    points: 6000,
    category: 'advanced',
    description: 'GPS tracking and mapping',
  },
  {
    id: 'calendar',
    label: 'Scheduling System',
    labelHe: 'מערכת תזמון',
    icon: <Calendar className="w-5 h-5" />,
    points: 7000,
    category: 'advanced',
    description: 'Booking and appointments',
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    labelHe: 'מסחר אלקטרוני',
    icon: <ShoppingCart className="w-5 h-5" />,
    points: 15000,
    category: 'advanced',
    description: 'Shopping cart and checkout',
  },
  {
    id: 'api',
    label: 'API & Integrations',
    labelHe: 'API ואינטגרציות',
    icon: <Cloud className="w-5 h-5" />,
    points: 10000,
    category: 'advanced',
    description: 'Third-party connections',
  },
  
  // Medical/Compliance Features
  {
    id: 'hipaa',
    label: 'HIPAA Compliance',
    labelHe: 'תאימות HIPAA',
    icon: <Shield className="w-5 h-5" />,
    points: 25000,
    category: 'medical',
    description: 'Healthcare data protection',
  },
  {
    id: 'gdpr',
    label: 'GDPR Compliance',
    labelHe: 'תאימות GDPR',
    icon: <FileCheck className="w-5 h-5" />,
    points: 12000,
    category: 'medical',
    description: 'EU data privacy compliance',
  },
  {
    id: 'encryption',
    label: 'End-to-End Encryption',
    labelHe: 'הצפנה מקצה לקצה',
    icon: <Lock className="w-5 h-5" />,
    points: 15000,
    category: 'medical',
    description: 'Military-grade security',
  },
  {
    id: 'audit',
    label: 'Audit Logging',
    labelHe: 'רישום פעולות',
    icon: <FileCheck className="w-5 h-5" />,
    points: 8000,
    category: 'medical',
    description: 'Complete activity tracking',
  },
];

const TIMELINES = [
  { id: 'fast', label: '2-3 חודשים', multiplier: 1.3, description: 'פיתוח מואץ' },
  { id: 'normal', label: '4-6 חודשים', multiplier: 1.0, description: 'קצב סטנדרטי' },
  { id: 'relaxed', label: '6-9 חודשים', multiplier: 0.85, description: 'קצב נוח' },
];

// =============================================================================
// STEP COMPONENTS
// =============================================================================

interface StepProps {
  state: CalculatorState;
  setState: React.Dispatch<React.SetStateAction<CalculatorState>>;
  onNext: () => void;
  onBack: () => void;
}

// Step 1: Platform Selection
function PlatformStep({ state, setState, onNext }: StepProps) {
  const togglePlatform = (id: string) => {
    setState((prev) => ({
      ...prev,
      platform: prev.platform.includes(id)
        ? prev.platform.filter((p) => p !== id)
        : [...prev.platform, id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          באילו פלטפורמות תרצו להיות?
        </h3>
        <p className="text-slate-400">
          בחרו את הפלטפורמות עבור ה-MVP שלכם (ניתן לבחור מספר אפשרויות)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => {
          const isSelected = state.platform.includes(platform.id);
          return (
            <motion.button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative p-6 rounded-2xl border-2 transition-all duration-300',
                'flex flex-col items-center gap-3 text-center',
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 left-3 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
              <div className={cn(
                'p-3 rounded-xl',
                isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'
              )}>
                {platform.icon}
              </div>
              <div>
                <div className="font-semibold text-white">{platform.labelHe}</div>
                <div className="text-sm text-slate-500">{platform.label}</div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={onNext}
        disabled={state.platform.length === 0}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'w-full mt-6 py-4 rounded-xl font-semibold text-lg',
          'flex items-center justify-center gap-2',
          'transition-all duration-300',
          state.platform.length > 0
            ? 'bg-gradient-to-l from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        )}
      >
        <span>המשך</span>
        <ChevronLeft className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

// Step 2: Features Selection
function FeaturesStep({ state, setState, onNext, onBack }: StepProps) {
  const toggleFeature = (id: string) => {
    setState((prev) => ({
      ...prev,
      features: prev.features.includes(id)
        ? prev.features.filter((f) => f !== id)
        : [...prev.features, id],
    }));
  };

  const coreFeatures = FEATURES.filter((f) => f.category === 'core');
  const advancedFeatures = FEATURES.filter((f) => f.category === 'advanced');
  const medicalFeatures = FEATURES.filter((f) => f.category === 'medical');

  const FeatureGrid = ({ features, title }: { features: FeatureOption[]; title: string }) => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
        {title}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((feature) => {
          const isSelected = state.features.includes(feature.id);
          return (
            <motion.button
              key={feature.id}
              onClick={() => toggleFeature(feature.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'p-3 rounded-xl border transition-all duration-200',
                'flex flex-col items-center gap-2 text-center',
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
              )}
            >
              <div className={cn(
                'p-2 rounded-lg',
                isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700/50 text-slate-400'
              )}>
                {feature.icon}
              </div>
              <span className={cn(
                'text-xs font-medium',
                isSelected ? 'text-white' : 'text-slate-400'
              )}>
                {feature.labelHe}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          אילו פיצ׳רים תצטרכו?
        </h3>
        <p className="text-slate-400">
          בחרו את היכולות שה-MVP שלכם צריך לכלול
        </p>
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <FeatureGrid features={coreFeatures} title="פיצ׳רים בסיסיים" />
        <FeatureGrid features={advancedFeatures} title="פיצ׳רים מתקדמים" />
        <FeatureGrid features={medicalFeatures} title="אבטחה ורגולציה רפואית" />
      </div>

      <div className="flex gap-3 pt-4">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-4 rounded-xl font-semibold border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronRight className="w-5 h-5" />
          <span>חזרה</span>
        </motion.button>
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-4 rounded-xl font-semibold bg-gradient-to-l from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
        >
          <span>המשך</span>
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

// Step 3: Timeline Selection
function TimelineStep({ state, setState, onNext, onBack }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          מה לוח הזמנים שלכם?
        </h3>
        <p className="text-slate-400">
          בחרו את קצב הפיתוח המועדף
        </p>
      </div>

      <div className="space-y-4">
        {TIMELINES.map((timeline) => {
          const isSelected = state.timeline === timeline.id;
          return (
            <motion.button
              key={timeline.id}
              onClick={() => setState((prev) => ({ ...prev, timeline: timeline.id }))}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                'w-full p-5 rounded-2xl border-2 transition-all duration-300',
                'flex items-center justify-between',
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-slate-500'
                )}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">{timeline.label}</div>
                  <div className="text-sm text-slate-400">{timeline.description}</div>
                </div>
              </div>
              {timeline.multiplier !== 1 && (
                <span className={cn(
                  'text-xs px-3 py-1 rounded-full',
                  timeline.multiplier > 1
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-green-500/20 text-green-400'
                )}>
                  {timeline.multiplier > 1 ? '+30% (מואץ)' : '-15% (חיסכון)'}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-4">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-4 rounded-xl font-semibold border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronRight className="w-5 h-5" />
          <span>חזרה</span>
        </motion.button>
        <motion.button
          onClick={onNext}
          disabled={!state.timeline}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2',
            state.timeline
              ? 'bg-gradient-to-l from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          )}
        >
          <span>חשב עלות</span>
          <Calculator className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

// Step 4: Calculating Animation + Lead Capture
function CalculatingStep({ 
  state, 
  estimatedCost, 
  onBack,
  onSubmit,
  isSubmitting,
  submitError,
}: { 
  state: CalculatorState; 
  estimatedCost: number;
  onBack: () => void;
  onSubmit: (data: LeadFormData) => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [phase, setPhase] = useState<'calculating' | 'form'>('calculating');
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
  });
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});

  // Simulate calculation
  useEffect(() => {
    const timer = setTimeout(() => setPhase('form'), 3000);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = () => {
    const newErrors: Partial<LeadFormData> = {};
    if (!formData.name.trim()) newErrors.name = 'נדרש שם';
    if (!formData.email.trim()) newErrors.email = 'נדרש אימייל';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'אימייל לא תקין';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Calculating phase
  if (phase === 'calculating') {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30"
        >
          <Calculator className="w-12 h-12 text-white" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-4">
          מחשבים את העלות המשוערת...
        </h3>
        
        <div className="space-y-3 max-w-md mx-auto">
          {['מנתחים את הפלטפורמות...', 'מעריכים את הפיצ׳רים...', 'מחשבים לוח זמנים...'].map((text, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.8 }}
              className="flex items-center gap-3 text-slate-400"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ delay: i * 0.8 + 0.3, duration: 0.5 }}
              >
                <Check className="w-5 h-5 text-cyan-500" />
              </motion.div>
              <span>{text}</span>
            </motion.div>
          ))}
        </div>

        {/* Animated progress bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-l from-cyan-500 to-blue-600"
            />
          </div>
        </div>
      </div>
    );
  }

  // Lead capture form
  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          החישוב מוכן! 🎉
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400"
        >
          השאירו פרטים ונשלח אליכם פירוט מלא של העלות
        </motion.p>
      </div>

      {/* Teaser box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 overflow-hidden"
      >
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/50 flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
            <span className="text-sm text-slate-400">השאירו פרטים לגילוי</span>
          </div>
        </div>
        
        <div className="text-center filter blur-sm">
          <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-500">
            ${estimatedCost.toLocaleString()}
          </div>
          <div className="text-slate-500 mt-1">עלות משוערת</div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {submitError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="שם מלא *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                'w-full px-4 py-3 rounded-xl bg-slate-800 border text-white placeholder-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
                errors.name ? 'border-red-500' : 'border-slate-700'
              )}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <input
              type="email"
              placeholder="אימייל *"
              dir="ltr"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={cn(
                'w-full px-4 py-3 rounded-xl bg-slate-800 border text-white placeholder-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
                errors.email ? 'border-red-500' : 'border-slate-700'
              )}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="tel"
            placeholder="טלפון"
            dir="ltr"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <input
            type="text"
            placeholder="שם החברה"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-4 rounded-xl font-semibold border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex-1 py-4 rounded-xl font-semibold text-white',
              'bg-gradient-to-l from-emerald-500 to-teal-600',
              'shadow-lg shadow-emerald-500/25',
              'flex items-center justify-center gap-2',
              'disabled:opacity-70 disabled:cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>שולח...</span>
              </>
            ) : (
              <>
                <span>קבל את הפירוט המלא</span>
                <Send className="w-5 h-5 rotate-180" />
              </>
            )}
          </motion.button>
        </div>

        <p className="text-center text-xs text-slate-500">
          ללא התחייבות • נחזור אליך תוך 24 שעות
        </p>
      </motion.form>
    </div>
  );
}

// Step 5: Success / Results
function SuccessStep({ 
  estimatedCost, 
  state,
  onReset,
}: { 
  estimatedCost: number;
  state: CalculatorState;
  onReset: () => void;
}) {
  const selectedPlatforms = PLATFORMS.filter((p) => state.platform.includes(p.id));
  const selectedFeatures = FEATURES.filter((f) => state.features.includes(f.id));
  const selectedTimeline = TIMELINES.find((t) => t.id === state.timeline);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          תודה! הפירוט בדרך אליך 📧
        </h3>
        <p className="text-slate-400">
          נציג מצוות WeCcelerate יצור איתך קשר בהקדם
        </p>
      </div>

      {/* Results summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700"
      >
        <div className="text-center mb-6">
          <div className="text-sm text-slate-400 mb-2">עלות משוערת לפיתוח MVP</div>
          <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-500">
            ${estimatedCost.toLocaleString()}
          </div>
          <div className="text-sm text-slate-500 mt-2">
            {selectedTimeline?.label} • {selectedTimeline?.description}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-700">
          <div>
            <div className="text-sm text-slate-400 mb-2">פלטפורמות:</div>
            <div className="flex flex-wrap gap-2">
              {selectedPlatforms.map((p) => (
                <span key={p.id} className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm">
                  {p.labelHe}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-400 mb-2">פיצ׳רים ({selectedFeatures.length}):</div>
            <div className="flex flex-wrap gap-2">
              {selectedFeatures.slice(0, 6).map((f) => (
                <span key={f.id} className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-sm">
                  {f.labelHe}
                </span>
              ))}
              {selectedFeatures.length > 6 && (
                <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-400 text-sm">
                  +{selectedFeatures.length - 6} נוספים
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <div className="text-center space-y-3">
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
        >
          חישוב חדש →
        </motion.button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface MVPCalculatorProps {
  /** Callback when lead is captured */
  onLeadCaptured?: (leadId?: number) => void;
  /** Site identifier for tracking */
  site?: string;
  /** Custom class name */
  className?: string;
}

export function MVPCalculator({
  onLeadCaptured,
  site = 'main',
  className,
}: MVPCalculatorProps) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<CalculatorState>({
    platform: [],
    features: [],
    timeline: '',
    budget: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate estimated cost
  const calculateCost = useCallback(() => {
    let total = 0;

    // Platform costs
    state.platform.forEach((platformId) => {
      const platform = PLATFORMS.find((p) => p.id === platformId);
      if (platform) total += platform.basePoints;
    });

    // Feature costs
    state.features.forEach((featureId) => {
      const feature = FEATURES.find((f) => f.id === featureId);
      if (feature) total += feature.points;
    });

    // Timeline multiplier
    const timeline = TIMELINES.find((t) => t.id === state.timeline);
    if (timeline) {
      total = Math.round(total * timeline.multiplier);
    }

    // Add base project cost
    total += 5000;

    return total;
  }, [state]);

  const estimatedCost = calculateCost();

  // Build message for Pipedrive
  const buildLeadMessage = useCallback(() => {
    const selectedPlatforms = PLATFORMS.filter((p) => state.platform.includes(p.id));
    const selectedFeatures = FEATURES.filter((f) => state.features.includes(f.id));
    const selectedTimeline = TIMELINES.find((t) => t.id === state.timeline);

    const platformNames = selectedPlatforms.map((p) => p.label).join(', ');
    const featureNames = selectedFeatures.map((f) => f.label).join(', ');
    const medicalFeatures = selectedFeatures.filter((f) => f.category === 'medical');
    const hasAI = state.features.includes('ai');
    const hasHIPAA = state.features.includes('hipaa');

    let message = `🧮 MVP Calculator Lead\n\n`;
    message += `📱 Platforms: ${platformNames}\n`;
    message += `⚡ Features (${selectedFeatures.length}): ${featureNames}\n`;
    message += `⏱️ Timeline: ${selectedTimeline?.label || 'Not selected'}\n`;
    message += `💰 Estimated Budget: $${estimatedCost.toLocaleString()}\n\n`;
    
    if (hasAI || medicalFeatures.length > 0) {
      message += `🔥 Key Requirements:\n`;
      if (hasAI) message += `• AI Integration needed\n`;
      if (hasHIPAA) message += `• HIPAA Compliance required\n`;
      medicalFeatures.forEach((f) => {
        if (f.id !== 'hipaa') message += `• ${f.label}\n`;
      });
    }

    return message;
  }, [state, estimatedCost]);

  // Submit lead
  const handleSubmit = async (formData: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await createLeadAction({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      message: buildLeadMessage(),
      sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      referrerUrl: typeof document !== 'undefined' ? document.referrer : undefined,
      leadSource: 'Website 2.0',
      formType: 'mvp-calculator',
      site,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsComplete(true);
      onLeadCaptured?.(result.leadId);
    } else {
      setSubmitError(result.message);
    }
  };

  // Reset calculator
  const handleReset = () => {
    setState({
      platform: [],
      features: [],
      timeline: '',
      budget: '',
    });
    setStep(0);
    setIsComplete(false);
    setSubmitError(null);
  };

  // Steps configuration
  const steps = [
    { id: 'platform', label: 'פלטפורמה' },
    { id: 'features', label: 'פיצ׳רים' },
    { id: 'timeline', label: 'לו״ז' },
    { id: 'calculate', label: 'חישוב' },
  ];

  return (
    <div className={cn(
      'w-full max-w-2xl mx-auto',
      'rounded-3xl overflow-hidden',
      'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800',
      'border border-slate-700/50',
      'shadow-2xl shadow-black/30',
      className
    )}>
      {/* Header */}
      <div className="relative px-6 py-8 bg-gradient-to-bl from-cyan-600/20 via-transparent to-blue-600/20">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>כלי חינמי</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            מחשבון עלות MVP
          </h2>
          <p className="text-slate-400">
            גלו כמה יעלה לפתח את המוצר שלכם
          </p>
        </div>

        {/* Progress steps */}
        {!isComplete && (
          <div className="relative mt-8 flex justify-between max-w-md mx-auto">
            {/* Progress line */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-700">
              <motion.div
                className="h-full bg-gradient-to-l from-cyan-500 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {steps.map((s, i) => (
              <div key={s.id} className="relative flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: i === step ? 1.1 : 1,
                    backgroundColor: i <= step ? 'rgb(6, 182, 212)' : 'rgb(51, 65, 85)',
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium z-10"
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </motion.div>
                <span className={cn(
                  'mt-2 text-xs',
                  i <= step ? 'text-cyan-400' : 'text-slate-500'
                )}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={isComplete ? 'success' : step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isComplete ? (
              <SuccessStep
                estimatedCost={estimatedCost}
                state={state}
                onReset={handleReset}
              />
            ) : step === 0 ? (
              <PlatformStep
                state={state}
                setState={setState}
                onNext={() => setStep(1)}
                onBack={() => {}}
              />
            ) : step === 1 ? (
              <FeaturesStep
                state={state}
                setState={setState}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
              />
            ) : step === 2 ? (
              <TimelineStep
                state={state}
                setState={setState}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            ) : (
              <CalculatingStep
                state={state}
                estimatedCost={estimatedCost}
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Users className="w-4 h-4" />
          <span>מעל 500 יזמים השתמשו במחשבון</span>
        </div>
      </div>
    </div>
  );
}

export default MVPCalculator;
