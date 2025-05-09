import { useState } from 'react';
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { TableLoading } from './Loading';
import Button from './Button';

const Table = ({
  columns,
  data,
  loading = false,
  sortable = true,
  selectable = false,
  selectedRows = [],
  onSelectRows,
  pagination = null,
  onPageChange,
  onSort,
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null
  });

  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectRows?.(data.map(row => row.id));
    } else {
      onSelectRows?.([]);
    }
  };

  const handleSelectRow = (rowId) => {
    if (selectedRows.includes(rowId)) {
      onSelectRows?.(selectedRows.filter(id => id !== rowId));
    } else {
      onSelectRows?.([...selectedRows, rowId]);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronUpDownIcon className="h-5 w-5" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="h-5 w-5" />
    ) : (
      <ChevronDownIcon className="h-5 w-5" />
    );
  };

  return (
    <div className={`flow-root ${className}`}>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                {selectable && (
                  <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                      checked={selectedRows.length === data.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`
                      px-3 py-3.5 text-left text-sm font-semibold text-gray-900
                      ${column.sortable !== false && sortable ? 'cursor-pointer group' : ''}
                      ${column.className || ''}
                    `}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable !== false && sortable && (
                        <span className="ml-2 flex-none text-gray-400 group-hover:visible">
                          {getSortIcon(column.key)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <TableLoading colSpan={columns.length + (selectable ? 1 : 0)} />
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="py-4 text-center text-sm text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={selectedRows.includes(row.id) ? 'bg-gray-50' : undefined}
                  >
                    {selectable && (
                      <td className="relative px-7 sm:w-12 sm:px-6">
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${
                          column.tdClassName || ''
                        }`}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    pagination.currentPage * pagination.pageSize,
                    pagination.totalItems
                  )}
                </span>{' '}
                of <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <Button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  variant="outline"
                  className="rounded-l-md"
                >
                  Previous
                </Button>
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <Button
                    key={index + 1}
                    onClick={() => onPageChange(index + 1)}
                    variant={pagination.currentPage === index + 1 ? 'solid' : 'outline'}
                    className="rounded-none"
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  variant="outline"
                  className="rounded-r-md"
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
