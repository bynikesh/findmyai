import React from 'react';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    actions?: (item: T) => React.ReactNode;
    loading?: boolean;
    emptyMessage?: string;
}

function DataTable<T extends { id: number | string }>({
    data,
    columns,
    onRowClick,
    actions,
    loading,
    emptyMessage = 'No data available',
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                {column.header}
                            </th>
                        ))}
                        {actions && (
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Actions</span>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => onRowClick?.(item)}
                            className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                                >
                                    {column.render
                                        ? column.render(item)
                                        : String((item as any)[column.key] || '-')}
                                </td>
                            ))}
                            {actions && (
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    {actions(item)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
