import { forwardRef } from 'react';

const Card = forwardRef(
  (
    {
      children,
      className = '',
      hover = false,
      clickable = false,
      bordered = true,
      padding = true,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-lg shadow-sm
          ${bordered ? 'border border-gray-200' : ''}
          ${padding ? 'p-4 sm:p-6' : ''}
          ${hover ? 'transition-shadow hover:shadow-md' : ''}
          ${clickable ? 'cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const TaskCard = forwardRef(
  (
    {
      title,
      description,
      status,
      priority,
      dueDate,
      assignee,
      tags = [],
      onClick,
      className = '',
      ...props
    },
    ref
  ) => {
    const statusColors = {
      PENDING: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };

    const priorityColors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    };

    return (
      <Card
        ref={ref}
        hover
        clickable={!!onClick}
        className={`relative ${className}`}
        onClick={onClick}
        {...props}
      >
        {/* Priority Indicator */}
        <div className="absolute top-0 right-0 mt-4 mr-4">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              priorityColors[priority] || priorityColors.MEDIUM
            }`}
          >
            {priority}
          </span>
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Status */}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                statusColors[status] || statusColors.PENDING
              }`}
            >
              {status}
            </span>

            {/* Due Date */}
            {dueDate && (
              <span className="text-sm text-gray-500">
                Due {new Date(dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Assignee */}
          {assignee && (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {assignee.avatar ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={assignee.avatar}
                    alt={assignee.name}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {assignee.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-700">
                  {assignee.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }
);

TaskCard.displayName = 'TaskCard';

export const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className = '',
  ...props
}) => {
  const getTrendColor = (trend) => {
    if (!trend) return '';
    return trend > 0
      ? 'text-green-600'
      : trend < 0
      ? 'text-red-600'
      : 'text-gray-600';
  };

  return (
    <Card className={`${className}`} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {trend !== undefined && (
            <p className={`mt-2 text-sm ${getTrendColor(trend)}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-full bg-primary-100 p-3">
            <Icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
