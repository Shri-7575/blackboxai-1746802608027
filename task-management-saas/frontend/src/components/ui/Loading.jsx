import { forwardRef } from 'react';

const Loading = forwardRef(
  ({ size = 'md', color = 'primary', className = '', fullScreen = false }, ref) => {
    const sizeClasses = {
      xs: 'h-4 w-4',
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16'
    };

    const colorClasses = {
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      white: 'text-white'
    };

    const spinner = (
      <div
        ref={ref}
        className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
          {spinner}
        </div>
      );
    }

    return spinner;
  }
);

Loading.displayName = 'Loading';

export const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading size="lg" />
  </div>
);

export const LoadingOverlay = ({ show, blur = false }) => {
  if (!show) return null;

  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75 ${
        blur ? 'backdrop-blur-sm' : ''
      }`}
    >
      <Loading size="lg" />
    </div>
  );
};

export const TableLoading = ({ colSpan, rows = 5 }) => (
  <>
    {[...Array(rows)].map((_, index) => (
      <tr key={index} className="animate-pulse">
        <td colSpan={colSpan} className="whitespace-nowrap px-3 py-4">
          <div className="flex items-center">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export const CardLoading = ({ count = 1 }) => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(count)].map((_, index) => (
      <div
        key={index}
        className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      >
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {[...Array(lines)].map((_, index) => (
      <div
        key={index}
        className={`h-3 bg-gray-200 rounded ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      ></div>
    ))}
  </div>
);

export default Loading;
