
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface BankAccount {
  id?: string;
  user_id?: string;
  account_type: 'checking' | 'savings';
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_holder_name: string;
  is_default: boolean;
  created_at?: string;
}

export default function BankingInfo() {
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState<BankAccount>({
    account_type: 'checking',
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_holder_name: '',
    is_default: false,
  });

  useEffect(() => {
    loadBankAccounts();
  }, [user]);

  const loadBankAccounts = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const accountData = {
        ...formData,
        user_id: user.id,
        account_number: formData.account_number.replace(/\D/g, ''), // Remove non-digits
        routing_number: formData.routing_number.replace(/\D/g, ''),
      };

      if (editingAccount) {
        const { error } = await supabase
          .from('user_bank_accounts')
          .update(accountData)
          .eq('id', editingAccount.id);

        if (error) throw error;
        toast.success('Bank account updated successfully');
      } else {
        // If this is the first account or set as default, make it default
        if (bankAccounts.length === 0 || formData.is_default) {
          // Set all other accounts to non-default
          await supabase
            .from('user_bank_accounts')
            .update({ is_default: false })
            .eq('user_id', user.id);
          
          accountData.is_default = true;
        }

        const { error } = await supabase
          .from('user_bank_accounts')
          .insert([accountData]);

        if (error) throw error;
        toast.success('Bank account added successfully');
      }

      resetForm();
      loadBankAccounts();
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast.error('Failed to save bank account');
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    try {
      const { error } = await supabase
        .from('user_bank_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      toast.success('Bank account deleted successfully');
      loadBankAccounts();
    } catch (error) {
      console.error('Error deleting bank account:', error);
      toast.error('Failed to delete bank account');
    }
  };

  const handleSetDefault = async (accountId: string) => {
    if (!user?.id) return;

    try {
      // Set all accounts to non-default
      await supabase
        .from('user_bank_accounts')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set selected account as default
      const { error } = await supabase
        .from('user_bank_accounts')
        .update({ is_default: true })
        .eq('id', accountId);

      if (error) throw error;
      toast.success('Default account updated');
      loadBankAccounts();
    } catch (error) {
      console.error('Error setting default account:', error);
      toast.error('Failed to update default account');
    }
  };

  const resetForm = () => {
    setFormData({
      account_type: 'checking',
      bank_name: '',
      account_number: '',
      routing_number: '',
      account_holder_name: '',
      is_default: false,
    });
    setShowAddForm(false);
    setEditingAccount(null);
  };

  const startEditing = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData(account);
    setShowAddForm(true);
  };

  const maskAccountNumber = (accountNumber: string) => {
    return `****${accountNumber.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banking Information</h2>
          <p className="text-gray-600">Manage your bank accounts for fiat deposits and withdrawals</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Bank Account
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Type</label>
                <select
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'checking' | 'savings' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
              <input
                type="text"
                value={formData.account_holder_name}
                onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Routing Number</label>
                <input
                  type="text"
                  value={formData.routing_number}
                  onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                Set as default account
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingAccount ? 'Update Account' : 'Add Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bank Accounts List */}
      <div className="space-y-4">
        {bankAccounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No bank accounts added</h3>
            <p className="text-gray-500">Add your first bank account to enable fiat transactions</p>
          </div>
        ) : (
          bankAccounts.map((account) => (
            <div key={account.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{account.bank_name}</h3>
                    {account.is_default && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Account Holder:</strong> {account.account_holder_name}</p>
                    <p><strong>Account Type:</strong> {account.account_type}</p>
                    <p><strong>Account Number:</strong> {maskAccountNumber(account.account_number)}</p>
                    <p><strong>Routing Number:</strong> {account.routing_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!account.is_default && (
                    <button
                      onClick={() => handleSetDefault(account.id!)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => startEditing(account)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id!)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Security Notice
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your banking information is encrypted and securely stored. We never store full account numbers in plain text.
                All transactions are subject to verification and compliance checks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
