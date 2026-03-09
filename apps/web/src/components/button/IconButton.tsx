import type { ReactNode, ButtonHTMLAttributes } from 'react';

type IconButtonSize = 'small' | 'medium' | 'large';
type IconButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type IconButtonColor = 'aqua' | 'blue' | 'lime' | 'cyan' | 'yellow' | 'orange' | 'gray';
type IconButtonColorShade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  color?: IconButtonColor;
  colorShade?: {
    base?: IconButtonColorShade;
    hover?: IconButtonColorShade;
    active?: IconButtonColorShade;
  };
  ariaLabel?: string;
  fullWidth?: boolean;
  className?: string;
}

const iconSizeStyles = {
  small: 'h-8 w-8',
  medium: 'h-10 w-10',
  large: 'h-12 w-12',
};

const defaultShades = {
  base: 500,
  hover: 600,
  active: 800,
};

const colorVariantStyles = {
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

export const IconButton = ({
  icon,
  size = 'medium',
  variant = 'primary',
  color = 'aqua',
  colorShade,
  ariaLabel,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: IconButtonProps) => {
  const shades = { ...defaultShades, ...colorShade };

  const baseStyles = `
    inline-flex items-center justify-center
    font-sans rounded-lg
    transition-all duration-200 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-${shades.base}/50
  `;

  const widthClass = fullWidth ? 'w-full' : '';

  const primaryStyles = variant === 'primary'
    ? `bg-${color}-${shades.base} hover:bg-${color}-${shades.hover} active:bg-${color}-${shades.active} ${colorVariantStyles[color].primary}`
    : colorVariantStyles[color][variant];

  return (
    <button
      className={`
        ${baseStyles}
        ${iconSizeStyles[size]}
        ${primaryStyles}
        ${widthClass}
        ${className}
      `}
      aria-label={ariaLabel}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  );
};
