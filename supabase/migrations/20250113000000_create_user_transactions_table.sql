
-- Create user_transactions table
CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mint', 'burn', 'transfer', 'deposit', 'withdrawal')),
  amount TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  hash TEXT,
  contract_address TEXT,
  gas_used TEXT,
  gas_price TEXT,
  block_number INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_address ON user_transactions(user_address);
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_transactions_hash ON user_transactions(hash);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at);

-- Create composite index for user queries
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_created ON user_transactions(user_address, created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own transactions
CREATE POLICY "Users can view own transactions" ON user_transactions
  FOR SELECT
  USING (auth.jwt() ->> 'wallet_address' = user_address);

-- Policy for admin users to view all transactions
CREATE POLICY "Admins can view all transactions" ON user_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE wallet_address = (auth.jwt() ->> 'wallet_address')
      AND role IN ('super_admin', 'admin')
    )
  );

-- Policy for system to insert transactions (no restrictions for inserts from application)
CREATE POLICY "Allow system inserts" ON user_transactions
  FOR INSERT
  WITH CHECK (true);

-- Policy for system to update transactions
CREATE POLICY "Allow system updates" ON user_transactions
  FOR UPDATE
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE user_transactions IS 'Stores all token-related transactions for users';
COMMENT ON COLUMN user_transactions.user_address IS 'Ethereum wallet address of the user';
COMMENT ON COLUMN user_transactions.type IS 'Type of transaction: mint, burn, transfer, deposit, withdrawal';
COMMENT ON COLUMN user_transactions.amount IS 'Amount of tokens involved in the transaction (stored as string to preserve precision)';
COMMENT ON COLUMN user_transactions.status IS 'Current status of the transaction';
COMMENT ON COLUMN user_transactions.hash IS 'Transaction hash from the blockchain';
COMMENT ON COLUMN user_transactions.contract_address IS 'Smart contract address involved in the transaction';
COMMENT ON COLUMN user_transactions.gas_used IS 'Gas used for the transaction';
COMMENT ON COLUMN user_transactions.gas_price IS 'Gas price for the transaction';
COMMENT ON COLUMN user_transactions.block_number IS 'Block number where transaction was mined';
