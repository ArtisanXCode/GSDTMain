import { motion } from 'framer-motion';
import RateForm from './RateForm';
import { ExchangeRate } from '../../../services/exchangeRates';

interface EditRateModalProps {
  rate: ExchangeRate;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<ExchangeRate>) => Promise<void>;
  loading: boolean;
}

export default function EditRateModal({ rate, onClose, onSubmit, loading }: EditRateModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Exchange Rate</h3>
        <RateForm
          initialData={rate}
          onSubmit={(data) => onSubmit(rate.id, data)}
          onCancel={onClose}
          loading={loading}
          isEdit
        />
        <div className="mt-6 flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Updating...' : 'Update Rate'}
        </button>
      </div>
      </motion.div>
    </div>
  );
}