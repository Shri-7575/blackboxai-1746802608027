import { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      helperText,
      startIcon,
      endIcon,
      className = '',
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      ...props
    },
    ref
  ) => {
    const baseInputStyles = `
      block w-full rounded-md border-gray-300 shadow-sm
      focus:border-primary-500 focus:ring-primary-500 sm:text-sm
      disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
      ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''}
      ${inputClassName}
    `;

    const renderHelperText = () => {
      if (!helperText && !error) return null;
      
      return (
        <p
          className={`mt-2 text-sm ${
            error ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {error || helperText}
        </p>
      );
    };

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
          >
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {startIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {startIcon}
            </div>
          )}
          
          {type === 'textarea' ? (
            <textarea
              ref={ref}
              className={`${baseInputStyles} ${
                startIcon ? 'pl-10' : ''
              } ${endIcon ? 'pr-10' : ''}`}
              {...props}
            />
          ) : (
            <input
              ref={ref}
              type={type}
              className={`${baseInputStyles} ${
                startIcon ? 'pl-10' : ''
              } ${endIcon ? 'pr-10' : ''}`}
              {...props}
            />
          )}

          {endIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {endIcon}
            </div>
          )}
        </div>
        {renderHelperText()}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const PasswordInput = forwardRef(
  ({ showPassword, onTogglePassword, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        endIcon={
          <button
            type="button"
            onClick={onTogglePassword}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            {showPassword ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export const SearchInput = forwardRef((props, ref) => {
  return (
    <Input
      ref={ref}
      type="search"
      startIcon={
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

export default Input;
