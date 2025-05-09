import { Fragment, forwardRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const Select = forwardRef(
  (
    {
      label,
      options = [],
      value,
      onChange,
      error,
      helperText,
      placeholder = 'Select an option',
      disabled = false,
      multiple = false,
      searchable = false,
      className = '',
      containerClassName = '',
      labelClassName = '',
      ...props
    },
    ref
  ) => {
    // Handle display value for multiple select
    const displayValue = () => {
      if (!value) return placeholder;
      
      if (multiple) {
        if (!Array.isArray(value)) return placeholder;
        if (value.length === 0) return placeholder;
        
        const selectedOptions = options.filter(option => 
          value.includes(option.value)
        );
        
        return selectedOptions
          .map(option => option.label)
          .join(', ');
      }

      const selectedOption = options.find(option => option.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    };

    // Handle option selection
    const handleSelect = (newValue) => {
      if (multiple) {
        if (Array.isArray(value)) {
          const updatedValue = value.includes(newValue)
            ? value.filter(v => v !== newValue)
            : [...value, newValue];
          onChange(updatedValue);
        } else {
          onChange([newValue]);
        }
      } else {
        onChange(newValue);
      }
    };

    return (
      <div className={containerClassName}>
        {label && (
          <label
            className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
          >
            {label}
          </label>
        )}
        
        <Listbox
          value={value}
          onChange={handleSelect}
          multiple={multiple}
          disabled={disabled}
          ref={ref}
          {...props}
        >
          <div className="relative mt-1">
            <Listbox.Button
              className={`
                relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm
                focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm
                ${disabled ? 'bg-gray-50 text-gray-500' : ''}
                ${error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : ''}
                ${className}
              `}
            >
              <span className="block truncate">{displayValue()}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              >
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    className={({ active }) => `
                      relative cursor-default select-none py-2 pl-10 pr-4
                      ${active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'}
                    `}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {option.label}
                        </span>
                        {(selected || (multiple && value?.includes(option.value))) && (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-primary-600' : 'text-primary-500'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>

        {(helperText || error) && (
          <p
            className={`mt-2 text-sm ${
              error ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export const TaskStatusSelect = forwardRef((props, ref) => {
  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  return <Select ref={ref} options={statusOptions} {...props} />;
});

TaskStatusSelect.displayName = 'TaskStatusSelect';

export const TaskPrioritySelect = forwardRef((props, ref) => {
  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  return <Select ref={ref} options={priorityOptions} {...props} />;
});

TaskPrioritySelect.displayName = 'TaskPrioritySelect';

export default Select;
