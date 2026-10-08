import type { ReactNode } from 'react';
import { Star, Flame, Sparkles } from 'lucide-react';

interface BadgeProps {
  label: string;
  variant?: 'gold' | 'red' | 'dark' | 'emerald' | 'amber';
  size?: 'xs' | 'sm';
  icon?: ReactNode;
}

export function Badge({ label, variant = 'gold', size = 'xs', icon }: BadgeProps) {
  const getAutoVariant = (name: string): 'gold' | 'red' | 'dark' | 'emerald' | 'amber' => {
    const lower = name.toLowerCase();
    if (lower.includes('bestseller') || lower.includes('signature')) return 'gold';
    if (lower.includes('chef') || lower.includes('legend')) return 'red';
    if (lower.includes('charcoal') || lower.includes('clay') || lower.includes('dum')) return 'dark';
    if (lower.includes('veg') || lower.includes('pure')) return 'emerald';
    return 'amber';
  };

  const chosenVariant = variant === 'gold' && label ? getAutoVariant(label) : variant;

  const variantStyles = {
    gold: 'bg-amber-500/15 text-amber-900 border-amber-500/30 font-bold',
    red: 'bg-brand-red-700 text-white border-brand-red-600/40 font-bold',
    dark: 'bg-stone-900/90 text-stone-100 border-stone-700/60 font-semibold',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
    amber: 'bg-amber-100/80 text-amber-900 border-amber-300 font-bold',
  }[chosenVariant];

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 tracking-wider uppercase',
    sm: 'text-xs px-2.5 py-1 tracking-wide',
  }[size];

  const renderDefaultIcon = () => {
    if (icon) return icon;
    const lower = label.toLowerCase();
    if (lower.includes('bestseller')) return <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />;
    if (lower.includes('chef')) return <Sparkles className="w-2.5 h-2.5 text-amber-200" />;
    if (lower.includes('charcoal') || lower.includes('spicy')) return <Flame className="w-2.5 h-2.5 text-orange-400" />;
    return null;
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border shadow-2xs backdrop-blur-xs ${variantStyles} ${sizeStyles}`}
    >
      {renderDefaultIcon()}
      <span>{label}</span>
    </span>
  );
}

