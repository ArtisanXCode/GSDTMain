import { useState } from 'react';
import { ExchangeRate } from '../../../services/exchangeRates';

interface RateFormProps {
  initialData?: ExchangeRate;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  isEdit?: boolean;
}

export default function RateForm({ initialData, onSubmit, onCancel, loading, isEdit }: RateFormProps) {
  const [formData, setFormData] = useState({
    currency_from: initialData?.currency_from || '',
    currency_to: initialData?.currency_to || '',
    rate: initialData?.rate.toString() || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      rate: parseFloat(formData.rate)
    });
  };

  const inputClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 h-12 px-4 text-gray-900 bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEdit && (
        <>
          <div>
            <label htmlFor="currency_from" className="block text-sm font-medium text-gray-700 mb-2">
              From Currency
            </label>
            <input
              type="text"
              id="currency_from"
              value={formData.currency_from}
              onChange={(e) => setFormData({ ...formData, currency_from: e.target.value.toUpperCase() })}
              className={inputClasses}
              placeholder="e.g., USD"
              required
            />
          </div>

          <div>
            <label htmlFor="currency_to" className="block text-sm font-medium text-gray-700 mb-2">
              To Currency
            </label>
            <input
              type="text"
              id="currency_to"
              value={formData.currency_to}
              onChange={(e) => setFormData({ ...formData, currency_to: e.target.value.toUpperCase() })}
              className={inputClasses}
              placeholder="e.g., EUR"
              required
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-2">
          Exchange Rate
        </label>
        <input
          type="number"
          id="rate"
          step="0.000001"
          value={formData.rate}
          onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
          className={inputClasses}
          placeholder="0.000000"
          required
        />
      </div>

      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Rate'}
          </button>
        </div>
    </form>
  );
}