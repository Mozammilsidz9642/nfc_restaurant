import type { ReactNode } from 'react';
import { SearchX, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  type?: 'search' | 'cart' | 'general' | 'menu';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({
  type = 'general',
  title,
  description,
  actionText,
  onAction,
  icon,
}: EmptyStateProps) {
  const defaults = {
    search: {
      icon: <SearchX className="w-12 h-12 text-stone-400 stroke-1" />,
      title: 'No dishes found',
      description: "We couldn't find anything matching your search. Try searching for Biryani, Kebabs, or Roti.",
      actionText: 'Browse Full Menu',
    },
    cart: {
      icon: <ShoppingBag className="w-12 h-12 text-stone-400 stroke-1" />,
      title: 'Your cart is waiting',
      description: 'Add something delicious to get started. Tandoori Kebabs & Dum Biryanis are hot & ready.',
      actionText: 'Explore Menu',
    },
    menu: {
      icon: <UtensilsCrossed className="w-12 h-12 text-stone-400 stroke-1" />,
      title: 'Menu currently unavailable',
      description: 'The kitchen is currently updating the digital menu. Please check back shortly.',
      actionText: 'Refresh Menu',
    },
    general: {
      icon: <UtensilsCrossed className="w-12 h-12 text-stone-400 stroke-1" />,
      title: 'No items available',
      description: 'Check back soon for freshly prepared delicacies.',
      actionText: 'Back to Menu',
    },
  }[type];

  const displayIcon = icon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;
  const displayActionText = actionText || defaults.actionText;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-4 border border-stone-200/60 shadow-inner">
        {displayIcon}
      </div>
      <h3 className="text-lg font-bold text-stone-800 font-serif tracking-wide mb-1.5">
        {displayTitle}
      </h3>
      <p className="text-xs text-stone-500 leading-relaxed mb-5">
        {displayDescription}
      </p>
      {onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {displayActionText}
        </Button>
      )}
    </div>
  );
}

