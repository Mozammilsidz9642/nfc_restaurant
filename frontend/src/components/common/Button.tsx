import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'dark' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      'bg-brand-red-700 hover:bg-brand-red-800 text-white font-bold shadow-md shadow-brand-red-900/20 border border-brand-red-600/30',
    gold:
      'bg-brand-gold-500 hover:bg-brand-gold-600 text-stone-950 font-bold shadow-md shadow-brand-gold-700/20 border border-amber-300/40',
    secondary:
      'bg-white hover:bg-stone-50 text-stone-800 font-semibold border border-stone-300 shadow-2xs',
    dark:
      'bg-stone-900 hover:bg-stone-950 text-white font-semibold border border-stone-800 shadow-sm',
    ghost:
      'bg-transparent hover:bg-stone-100 text-stone-700 font-medium',
  }[variant];

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3.5 rounded-xl gap-2.5 font-bold',
  }[size];

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-150 active:scale-97 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}

