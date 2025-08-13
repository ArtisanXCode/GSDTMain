
import { supabase } from '../../lib/supabase';

export enum TransactionType {
  MINT = 'mint',
  BURN = 'burn',
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface Transaction {
  id?: string;
  user_address: string;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  hash?: string;
  contract_address?: string;
  gas_used?: string;
  gas_price?: string;
  block_number?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTransactionRequest {
  user_address: string;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  hash?: string | null;
  contract_address?: string;
  gas_used?: string;
  gas_price?: string;
  block_number?: number;
  notes?: string;
}

// Create a new transaction record
export async function createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
  try {
    console.log('Creating transaction:', transaction);
    
    const { data, error } = await supabase
      .from('user_transactions')
      .insert([{
        user_address: transaction.user_address.toLowerCase(),
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        hash: transaction.hash,
        contract_address: transaction.contract_address?.toLowerCase(),
        gas_used: transaction.gas_used,
        gas_price: transaction.gas_price,
        block_number: transaction.block_number,
        notes: transaction.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return data;
  } catch (err: any) {
    console.error('Error in createTransaction:', err);
    throw err;
  }
}

// Update transaction status
export async function updateTransactionStatus(
  transactionId: string, 
  status: TransactionStatus, 
  additionalData?: Partial<Transaction>
): Promise<Transaction> {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    const { data, error } = await supabase
      .from('user_transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw new Error(`Failed to update transaction: ${error.message}`);
    }

    return data;
  } catch (err: any) {
    console.error('Error in updateTransactionStatus:', err);
    throw err;
  }
}

// Update transaction by hash
export async function updateTransactionByHash(
  hash: string, 
  status: TransactionStatus, 
  additionalData?: Partial<Transaction>
): Promise<Transaction | null> {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    const { data, error } = await supabase
      .from('user_transactions')
      .update(updateData)
      .eq('hash', hash)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error updating transaction by hash:', error);
      throw new Error(`Failed to update transaction: ${error.message}`);
    }

    return data;
  } catch (err: any) {
    console.error('Error in updateTransactionByHash:', err);
    throw err;
  }
}

// Get user transactions
export async function getUserTransactions(
  userAddress: string, 
  limit: number = 50,
  offset: number = 0
): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('user_transactions')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user transactions:', error);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    return data || [];
  } catch (err: any) {
    console.error('Error in getUserTransactions:', err);
    throw err;
  }
}

// Get transaction by ID
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('user_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching transaction:', error);
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }

    return data;
  } catch (err: any) {
    console.error('Error in getTransactionById:', err);
    throw err;
  }
}

// Get transaction by hash
export async function getTransactionByHash(hash: string): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('user_transactions')
      .select('*')
      .eq('hash', hash)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching transaction by hash:', error);
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }

    return data;
  } catch (err: any) {
    console.error('Error in getTransactionByHash:', err);
    throw err;
  }
}

// Get all transactions (admin only)
export async function getAllTransactions(
  limit: number = 100,
  offset: number = 0,
  filters?: {
    type?: TransactionType;
    status?: TransactionStatus;
    user_address?: string;
    start_date?: string;
    end_date?: string;
  }
): Promise<{ transactions: Transaction[]; total: number }> {
  try {
    let query = supabase
      .from('user_transactions')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.user_address) {
      query = query.eq('user_address', filters.user_address.toLowerCase());
    }
    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching all transactions:', error);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    return {
      transactions: data || [],
      total: count || 0
    };
  } catch (err: any) {
    console.error('Error in getAllTransactions:', err);
    throw err;
  }
}

// Get transaction statistics
export async function getTransactionStats(userAddress?: string): Promise<{
  totalMinted: string;
  totalBurned: string;
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
}> {
  try {
    let query = supabase
      .from('user_transactions')
      .select('type, amount, status');

    if (userAddress) {
      query = query.eq('user_address', userAddress.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transaction stats:', error);
      throw new Error(`Failed to fetch transaction stats: ${error.message}`);
    }

    const stats = {
      totalMinted: '0',
      totalBurned: '0',
      totalTransactions: 0,
      pendingTransactions: 0,
      completedTransactions: 0,
      failedTransactions: 0
    };

    if (data) {
      stats.totalTransactions = data.length;

      data.forEach(tx => {
        // Count by status
        switch (tx.status) {
          case TransactionStatus.PENDING:
            stats.pendingTransactions++;
            break;
          case TransactionStatus.COMPLETED:
            stats.completedTransactions++;
            break;
          case TransactionStatus.FAILED:
            stats.failedTransactions++;
            break;
        }

        // Sum amounts by type (only for completed transactions)
        if (tx.status === TransactionStatus.COMPLETED) {
          const amount = parseFloat(tx.amount || '0');
          if (tx.type === TransactionType.MINT) {
            stats.totalMinted = (parseFloat(stats.totalMinted) + amount).toString();
          } else if (tx.type === TransactionType.BURN) {
            stats.totalBurned = (parseFloat(stats.totalBurned) + amount).toString();
          }
        }
      });
    }

    return stats;
  } catch (err: any) {
    console.error('Error in getTransactionStats:', err);
    throw err;
  }
}
