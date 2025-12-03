import React from 'react';

interface PaginationProps {
    currentPage: number;
    onPageChange: (page: number) => void;
    hasNextPage?: boolean; // For when total count is unknown
    totalPages?: number;   // For when total count is known
    isFirstPage?: boolean;
    isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    onPageChange,
    hasNextPage,
    totalPages,
    isFirstPage = currentPage === 1,
    isLoading = false
}) => {
    // If totalPages is provided, we can show page numbers (future improvement)
    // For now, we'll focus on Simple Mode (Prev/Next) which works for both scenarios

    return (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirstPage || isLoading}
                    className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={(!hasNextPage && !totalPages) || (totalPages ? currentPage >= totalPages : false) || isLoading}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing page <span className="font-medium">{currentPage}</span>
                        {totalPages && (
                            <>
                                {' '}of <span className="font-medium">{totalPages}</span>
                            </>
                        )}
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={isFirstPage || isLoading}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>

                        {/* Current Page Indicator */}
                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-offset-0">
                            {currentPage}
                        </span>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={(!hasNextPage && !totalPages) || (totalPages ? currentPage >= totalPages : false) || isLoading}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next</span>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
