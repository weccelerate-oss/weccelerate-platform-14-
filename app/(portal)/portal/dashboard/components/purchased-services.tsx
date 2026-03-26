/**
 * Purchased Services Component
 *
 * Shows what the entrepreneur purchased via Pipedrive deal products
 * and their completion status based on the deal stage progress.
 */

'use client';

import { motion } from 'framer-motion';
import {
  Package,
  CheckCircle2,
  Circle,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface DealProductDisplay {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sum: number;
  currency: string;
  completed: boolean;
  active: boolean;
}

interface PurchasedServicesProps {
  products: DealProductDisplay[];
}

// =============================================================================
// HELPERS
// =============================================================================

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency || 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PurchasedServices({ products }: PurchasedServicesProps) {
  if (!products || products.length === 0) return null;

  const completedCount = products.filter((p) => p.completed).length;
  const totalCount = products.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-white/90">השירותים שרכשת</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/50">
            {completedCount}/{totalCount} הושלמו
          </span>
          <div className="p-1.5 bg-violet-50 rounded-lg">
            <ShoppingBag className="w-3.5 h-3.5 text-violet-500" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-3">
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-l from-[#e8d48b] to-[#c8a951] rounded-full"
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 mb-2">
          <span className="text-[11px] text-white/40">התקדמות כללית</span>
          <span className="text-[11px] font-semibold text-[#c8a951]">{progressPercent}%</span>
        </div>
      </div>

      {/* Products list */}
      <div className="px-3 pb-3 space-y-1">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.04 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl transition-all',
              product.completed ? 'bg-emerald-500/5' : 'hover:bg-white/[0.03]'
            )}
          >
            {/* Status icon */}
            <div className="flex-shrink-0">
              {product.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : product.active ? (
                <Clock className="w-5 h-5 text-amber-500" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300" />
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium',
                product.completed ? 'text-emerald-400' : 'text-white/90'
              )}>
                {product.name}
              </p>
              {product.quantity > 1 && (
                <p className="text-[11px] text-white/40">
                  כמות: {product.quantity}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex-shrink-0 text-left">
              <span className={cn(
                'text-xs font-semibold',
                product.completed ? 'text-emerald-400' : 'text-white/50'
              )}>
                {formatPrice(product.sum, product.currency)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total */}
      <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-medium text-white/50">סה״כ</span>
        <span className="text-sm font-bold text-[#c8a951]">
          {formatPrice(
            products.reduce((sum, p) => sum + p.sum, 0),
            products[0]?.currency || 'ILS'
          )}
        </span>
      </div>
    </div>
  );
}

export default PurchasedServices;
