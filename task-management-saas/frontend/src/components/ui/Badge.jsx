import { forwardRef } from 'react';

const Badge = forwardRef(
  (
    {
      children,
      variant = 'solid',
      color = 'primary',
      size = 'md',
      rounded = 'full',
      className = '',
      dot = false,
      count,
      maxCount = 99,
      showZero = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = {
      solid: {
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800'
      },
      outline: {
        primary: 'border border-primary-500 text-primary-500',
        secondary: 'border border-secondary-500 text-secondary-500',
        success: 'border border-green-500 text-green-500',
        danger: 'border border-red-500 text-red-500',
        warning: 'border border-yellow-500 text-yellow-500',
        info: 'border border-blue-500 text-blue-500',
        gray: 'border border-gray-500 text-gray-500'
      }
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base'
    };

    const roundedStyles = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full'
    };

    // If it's a dot badge
    if (dot) {
      return (
        <span className="relative inline-flex" ref={ref} {...props}>
          {children}
          <span
            className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${
              baseStyles.solid[color].split(' ')[0]
            }`}
          />
        </span>
      );
    }

    // If it's a count badge
    if (typeof count !== 'undefined') {
      if (count === 0 && !showZero) {
        return children || null;
      }

      const displayCount = count > maxCount ? `${maxCount}+` : count;

      return (
        <span className="relative inline-flex" ref={ref} {...props}>
          {children}
          <span
            className={`
              absolute -top-1 -right-1 flex items-center justify-center
              min-w-[1.25rem] h-5 rounded-full px-1
              text-xs font-medium
              ${baseStyles.solid[color]}
            `}
          >
            {displayCount}
          </span>
        </span>
      );
    }

    // Regular badge
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-medium
          ${baseStyles[variant][color]}
          ${sizeStyles[size]}
          ${roundedStyles[rounded]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export const TaskStatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { color: 'gray', label: 'Pending' },
    IN_PROGRESS: { color: 'info', label: 'In Progress' },
    COMPLETED: { color: 'success', label: 'Completed' },
    ON_HOLD: { color: 'warning', label: 'On Hold' },
    CANCELLED: { color: 'danger', label: 'Cancelled' }
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Badge color={config.color}>
      {config.label}
    </Badge>
  );
};

export const TaskPriorityBadge = ({ priority }) => {
  const priorityConfig = {
    LOW: { color: 'success', label: 'Low' },
    MEDIUM: { color: 'warning', label: 'Medium' },
    HIGH: { color: 'danger', label: 'High' },
    URGENT: { color: 'danger', label: 'Urgent' }
  };

  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <Badge color={config.color}>
      {config.label}
    </Badge>
  );
};

export const NotificationBadge = ({ count }) => (
  <Badge count={count} color="danger" maxCount={99} />
);

export const OnlineBadge = ({ online }) => (
  <Badge dot color={online ? 'success' : 'gray'} />
);

export default Badge;
