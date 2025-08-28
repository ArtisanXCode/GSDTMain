
import { Contract } from 'ethers';
import { MULTISIG_ADMIN_ADDRESS, MULTISIG_ADMIN_ABI } from '../contracts/GSDC';

export interface PendingTransaction {
  id: string;
  txType: number;
  status: number;
  initiator: string;
  target: string;
  amount: string;
  data: string;
  timestamp: string;
  executeAfter: string;
  rejectionReason: string;
  approver: string;
  exists: boolean;
}

export enum TransactionType {
  MINT = 0,
  BURN = 1,
  BURN_BLACKLISTED = 2,
  TRANSFER_OWNERSHIP = 3,
  BLACKLIST = 4,
  FREEZE = 5,
  UNFREEZE = 6,
  ROLE_GRANT = 7,
  ROLE_REVOKE = 8,
  PAUSE_TOKEN = 9,
  UNPAUSE_TOKEN = 10,
  UPDATE_TOKEN_CONTRACT = 11
}

export enum TransactionStatus {
  PENDING = 0,
  REJECTED = 1,
  EXECUTED = 2,
  AUTO_EXECUTED = 3
}

export class MultiSigAdminService {
  private contract: Contract;

  constructor(contract: Contract) {
    this.contract = contract;
  }

  // Transaction Management
  async queueMintTransaction(to: string, amount: string): Promise<any> {
    return await this.contract.mintTokens(to, amount);
  }

  async queueBurnTransaction(from: string, amount: string): Promise<any> {
    return await this.contract.burnTokens(from, amount);
  }

  async queueBlacklistTransaction(account: string, status: boolean): Promise<any> {
    return await this.contract.setBlacklistStatus(account, status);
  }

  async queueFreezeTransaction(account: string): Promise<any> {
    return await this.contract.freezeAddress(account);
  }

  async queueUnfreezeTransaction(account: string): Promise<any> {
    return await this.contract.unfreezeAddress(account);
  }

  // Transaction Approval
  async approveTransaction(txId: string): Promise<any> {
    return await this.contract.approveTransaction(txId);
  }

  async rejectTransaction(txId: string, reason: string): Promise<any> {
    return await this.contract.rejectTransaction(txId, reason);
  }

  async executeTransaction(txId: string): Promise<any> {
    return await this.contract.executeTransaction(txId);
  }

  // Query Functions
  async getPendingTransactionIds(): Promise<string[]> {
    return await this.contract.getPendingTransactionIds();
  }

  async getPendingTransaction(txId: string): Promise<PendingTransaction> {
    return await this.contract.getPendingTransaction(txId);
  }

  async getApprovalCount(txId: string): Promise<number> {
    return await this.contract.approvalCount(txId);
  }

  async hasApproved(txId: string, approver: string): Promise<boolean> {
    return await this.contract.hasApproved(txId, approver);
  }

  async getRequiredApprovals(): Promise<number> {
    return await this.contract.requiredApprovals();
  }

  // Role Management
  async grantRole(role: string, account: string): Promise<any> {
    return await this.contract.grantRole(role, account);
  }

  async revokeRole(role: string, account: string): Promise<any> {
    return await this.contract.revokeRole(role, account);
  }

  async hasRole(role: string, account: string): Promise<boolean> {
    return await this.contract.hasRole(role, account);
  }

  // Role Constants
  async getAdminRole(): Promise<string> {
    return await this.contract.ADMIN_ROLE();
  }

  async getMinterRole(): Promise<string> {
    return await this.contract.MINTER_ROLE();
  }

  async getBurnerRole(): Promise<string> {
    return await this.contract.BURNER_ROLE();
  }

  async getApproverRole(): Promise<string> {
    return await this.contract.APPROVER_ROLE();
  }

  async getBlacklistManagerRole(): Promise<string> {
    return await this.contract.BLACKLIST_MANAGER_ROLE();
  }

  async getFreezeManagerRole(): Promise<string> {
    return await this.contract.FREEZE_MANAGER_ROLE();
  }

  async getPauserRole(): Promise<string> {
    return await this.contract.PAUSER_ROLE();
  }

  async getUpgraderRole(): Promise<string> {
    return await this.contract.UPGRADER_ROLE();
  }

  // Address Status
  async isBlacklisted(account: string): Promise<boolean> {
    return await this.contract.isBlacklisted(account);
  }

  async isFrozen(account: string): Promise<boolean> {
    return await this.contract.isFrozen(account);
  }

  // Emergency Functions
  async emergencyPause(): Promise<any> {
    return await this.contract.emergencyPause();
  }

  async emergencyUnpause(): Promise<any> {
    return await this.contract.emergencyUnpause();
  }

  async pauseToken(): Promise<any> {
    return await this.contract.pauseToken();
  }

  async unpauseToken(): Promise<any> {
    return await this.contract.unpauseToken();
  }

  // Contract Management
  async transferTokenOwnership(newOwner: string): Promise<any> {
    return await this.contract.transferTokenOwnership(newOwner);
  }

  async updateTokenContract(newTokenContract: string): Promise<any> {
    return await this.contract.updateTokenContract(newTokenContract);
  }

  async setRequiredApprovals(required: number): Promise<any> {
    return await this.contract.setRequiredApprovals(required);
  }

  // View Functions
  async getCooldownPeriod(): Promise<number> {
    return await this.contract.COOLDOWN_PERIOD();
  }

  async getGsdcTokenAddress(): Promise<string> {
    return await this.contract.gsdcToken();
  }

  async getNextTransactionId(): Promise<number> {
    return await this.contract.nextTransactionId();
  }
}
