
import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionStatus, TransactionType } from '../services/admin';
import TransactionFilters from './transaction/TransactionFilters';
import TransactionTable from './transaction/TransactionTable';
import TransactionPagination from './transaction/TransactionPagination';
import { motion } from 'framer-motion';

export default function TransactionList() {
  const { account } = useWallet();
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | undefined>();
  const [selectedType, setSelectedType] = useState<TransactionType | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { transactions, isLoading, pagination } = useTransactions({
    address: account || '',
    status: selectedStatus,
    type: selectedType,
    page: currentPage,
    pageSize,
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-2 text-white">Loading transactions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section with blue gradient background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl shadow-lg overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #5a7c9a 0%, #3d5875 100%)",
        }}
      >
        <TransactionFilters
          selectedStatus={selectedStatus}
          selectedType={selectedType}
          onStatusChange={setSelectedStatus}
          onTypeChange={setSelectedType}
        />
      </motion.div>

      {/* Transaction Table Section with blue gradient background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl shadow-lg overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #5a7c9a 0%, #3d5875 100%)",
        }}
      >
        <div className="overflow-hidden">
          <TransactionTable transactions={transactions} />
          <TransactionPagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </motion.div>
    </div>
  );
}
