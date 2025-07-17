import { useState } from 'react';
import { TransactionStatus, TransactionType } from '../services/admin';
import TransactionFilters from './transaction/TransactionFilters';
import TransactionTable from './transaction/TransactionTable';
import TransactionPagination from './transaction/TransactionPagination';
import { useTransactions } from '../hooks/useTransactions';
import LoadingSpinner from './LoadingSpinner';

export default function TransactionList() {
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>();
  const [selectedType, setSelectedType] = useState<TransactionType>();
  const [currentPage, setCurrentPage] = useState(1);

  const { transactions, pagination, isLoading, error, refresh } = useTransactions(
    selectedStatus,
    selectedType,
    currentPage,
    10
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 text-orange-600 hover:text-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TransactionFilters
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        onStatusChange={setSelectedStatus}
        onTypeChange={setSelectedType}
      />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Records</h3>
          <p className="text-sm text-gray-600 mt-1">
            Complete history of your GSDC transactions
          </p>
        </div>
        
        <TransactionTable transactions={transactions} />

        <TransactionPagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}