import type { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonSize = 'small' | 'medium' | 'large';
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonColor = 'aqua' | 'blue' | 'lime' | 'cyan' | 'yellow' | 'orange' | 'gray';
type ButtonColorShade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  color?: ButtonColor;
  colorShade?: {
    base?: ButtonColorShade;
    hover?: ButtonColorShade;
    active?: ButtonColorShade;
  };
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const sizeStyles = {
  small: 'h-8 px-3 text-xs font-medium',
  medium: 'h-10 px-4 text-sm font-medium',
  large: 'h-12 px-6 text-base font-semibold',
};

const defaultShades = {
  base: 500,
  hover: 600,
  active: 800,
};

const colorVariants = {
  aqua: {
    primary: 'text-white',
    secondary: 'bg-aqua-100 text-aqua-700 hover:bg-aqua-200 active:bg-aqua-300',
    outline: 'border-2 border-aqua-500 text-aqua-500 hover:bg-aqua-500 hover:text-white',
    ghost: 'text-aqua-500 hover:bg-aqua-500/10 active:bg-aqua-500/20',
  },
  blue: {
    primary: 'text-white',
    secondary: 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
    ghost: 'text-blue-500 hover:bg-blue-500/10 active:bg-blue-500/20',
  },
  lime: {
    primary: 'text-white',
    secondary: 'bg-lime-100 text-lime-700 hover:bg-lime-200 active:bg-lime-300',
    outline: 'border-2 border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-white',
    ghost: 'text-lime-500 hover:bg-lime-500/10 active:bg-lime-500/20',
  },
  cyan: {
    primary: 'text-white',
    secondary: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 active:bg-cyan-300',
    outline: 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white',
    ghost: 'text-cyan-500 hover:bg-cyan-500/10 active:bg-cyan-500/20',
  },
  yellow: {
    primary: 'text-white',
    secondary: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 active:bg-yellow-300',
    outline: 'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white',
    ghost: 'text-yellow-500 hover:bg-yellow-500/10 active:bg-yellow-500/20',
  },
  orange: {
    primary: 'text-white',
    secondary: 'bg-orange-100 text-orange-700 hover:bg-orange-200 active:bg-orange-300',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
    ghost: 'text-orange-500 hover:bg-orange-500/10 active:bg-orange-500/20',
  },
  gray: {
    primary: 'text-white',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    outline: 'border-2 border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white',
    ghost: 'text-gray-500 hover:bg-gray-500/10 active:bg-gray-500/20',
  },
};

export const Button = ({
  children,
  size = 'medium',
  variant = 'primary',
  color = 'aqua',
  colorShade,
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const shades = { ...defaultShades, ...colorShade };

  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-sans rounded-lg
    transition-all duration-200 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-${shades.base}/50
  `;

  const widthClass = fullWidth ? 'w-full' : '';
  const loadingClass = isLoading ? 'pointer-events-none' : '';

  const primaryStyles = variant === 'primary'
    ? `bg-${color}-${shades.base} hover:bg-${color}-${shades.hover} active:bg-${color}-${shades.active} ${colorVariants[color].primary}`
    : colorVariants[color][variant];

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${primaryStyles}
        ${widthClass}
        ${loadingClass}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}

      <span>{children}</span>

      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
