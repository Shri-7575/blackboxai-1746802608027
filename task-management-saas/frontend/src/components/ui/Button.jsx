import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

const baseStyles = {
  solid: 'inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  outline: 'inline-flex items-center justify-center rounded-md border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
};

const sizeStyles = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm leading-4',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-base'
};

const variantStyles = {
  solid: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    light: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    dark: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500'
  },
  outline: {
    primary: 'border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    secondary: 'border-secondary-600 text-secondary-600 hover:bg-secondary-50 focus:ring-secondary-500',
    success: 'border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
    danger: 'border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
    warning: 'border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
    info: 'border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    light: 'border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    dark: 'border-gray-800 text-gray-800 hover:bg-gray-100 focus:ring-gray-500'
  }
};

const Button = forwardRef(
  (
    {
      variant = 'solid',
      color = 'primary',
      size = 'md',
      className = '',
      href,
      disabled,
      loading,
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      baseStyles[variant],
      sizeStyles[size],
      variantStyles[variant][color],
      disabled && 'opacity-50 cursor-not-allowed',
      loading && 'cursor-wait',
      className
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        {children}
      </>
    );

    if (href) {
      return (
        <Link to={href} className={classes} ref={ref} {...props}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
