
import { SMART_CONTRACT_ROLES, SmartContractRole } from '../../constants/roles';

// Use the smart contract roles as the AdminRole enum
export const AdminRole = SMART_CONTRACT_ROLES;
export type AdminRole = SmartContractRole;

// Transaction Status enum
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FLAGGED = 'FLAGGED'
}

// Transaction Type enum
export enum TransactionType {
  MINT = 'MINT',
  BURN = 'BURN',
  TRANSFER = 'TRANSFER',
  BLACKLIST = 'BLACKLIST',
  KYC_UPDATE = 'KYC_UPDATE',
  ROLE_GRANT = 'ROLE_GRANT',
  ROLE_REVOKE = 'ROLE_REVOKE',
  REQUEST_REDEEM = 'REQUEST_REDEEM',
  PROCESS_REDEEM = 'PROCESS_REDEEM',
  UPDATE_KYC = 'UPDATE_KYC',
  GRANT_ROLE = 'GRANT_ROLE',
  REVOKE_ROLE = 'REVOKE_ROLE'
}

export interface AdminUser {
  id: string;
  user_address: string;
  role: AdminRole;
  name?: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

export interface PendingTransaction {
  id: string;
  transaction_type: string;
  user_address: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface FiatMintRequest {
  id: string;
  user_address: string;
  amount: number;
  currency: string;
  payment_proof: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_by?: string;
  processed_at?: string;
  rejection_reason?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
  replied_at?: string;
  replied_by?: string;
}

export interface KYCRequest {
  id: string;
  user_address: string;
  applicant_id: string;
  review_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  level_name?: string;
  created_at: string;
  updated_at?: string;
  reviewed_by?: string;
  rejection_reasons?: string[];
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  fromAddress: string;
  toAddress: string;
  timestamp: Date;
  blockNumber: number;
  txHash: string;
  riskScore: number;
}
