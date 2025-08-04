
// Smart Contract Roles from GSDC.sol
export const SMART_CONTRACT_ROLES = {
  MINTER_ROLE: 'MINTER_ROLE',
  BURNER_ROLE: 'BURNER_ROLE', 
  PAUSER_ROLE: 'PAUSER_ROLE',
  PRICE_UPDATER_ROLE: 'PRICE_UPDATER_ROLE',
  BLACKLIST_MANAGER_ROLE: 'BLACKLIST_MANAGER_ROLE',
  APPROVER_ROLE: 'APPROVER_ROLE',
  SUPER_ADMIN_ROLE: 'SUPER_ADMIN_ROLE'
} as const;

export type SmartContractRole = typeof SMART_CONTRACT_ROLES[keyof typeof SMART_CONTRACT_ROLES];

// Role metadata for UI display
export const ROLE_METADATA = {
  [SMART_CONTRACT_ROLES.MINTER_ROLE]: {
    name: 'MINTER',
    description: 'Can mint new tokens',
    color: 'green'
  },
  [SMART_CONTRACT_ROLES.BURNER_ROLE]: {
    name: 'BURNER', 
    description: 'Can burn tokens and process redemptions',
    color: 'red'
  },
  [SMART_CONTRACT_ROLES.PAUSER_ROLE]: {
    name: 'PAUSER',
    description: 'Can pause/unpause contract operations',
    color: 'yellow'
  },
  [SMART_CONTRACT_ROLES.PRICE_UPDATER_ROLE]: {
    name: 'PRICE_UPDATER',
    description: 'Can update token price',
    color: 'blue'
  },
  [SMART_CONTRACT_ROLES.BLACKLIST_MANAGER_ROLE]: {
    name: 'BLACKLIST_MANAGER',
    description: 'Can manage blacklisted addresses',
    color: 'gray'
  },
  [SMART_CONTRACT_ROLES.APPROVER_ROLE]: {
    name: 'APPROVER',
    description: 'Can approve pending transactions',
    color: 'purple'
  },
  [SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE]: {
    name: 'SUPER_ADMIN',
    description: 'Full admin access to all functions',
    color: 'orange'
  }
} as const;

// Helper functions
export const getRoleDisplayName = (role: SmartContractRole): string => {
  return ROLE_METADATA[role]?.name || role;
};

export const getRoleDescription = (role: SmartContractRole): string => {
  return ROLE_METADATA[role]?.description || 'Smart contract role';
};

export const getRoleColor = (role: SmartContractRole): string => {
  return ROLE_METADATA[role]?.color || 'gray';
};

export const getAllRoles = (): SmartContractRole[] => {
  return Object.values(SMART_CONTRACT_ROLES);
};

// Role validation
export const isValidRole = (role: string): role is SmartContractRole => {
  return Object.values(SMART_CONTRACT_ROLES).includes(role as SmartContractRole);
};
