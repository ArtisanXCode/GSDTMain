export const SMART_CONTRACT_ROLES = {
  MINTER: 'MINTER',
  BURNER: 'BURNER',
  PAUSER: 'PAUSER',
  PRICE_UPDATER: 'PRICE_UPDATER',
  BLACKLIST_MANAGER: 'BLACKLIST_MANAGER',
  APPROVER: 'APPROVER',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type SmartContractRole = typeof SMART_CONTRACT_ROLES[keyof typeof SMART_CONTRACT_ROLES];

// Role descriptions for the UI
export const ROLE_DESCRIPTIONS = {
  [SMART_CONTRACT_ROLES.MINTER]: {
    name: 'Minter',
    description: 'Can mint new GSDC tokens',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  [SMART_CONTRACT_ROLES.BURNER]: {
    name: 'Burner',
    description: 'Can burn GSDC tokens',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  [SMART_CONTRACT_ROLES.PAUSER]: {
    name: 'Pauser',
    description: 'Can pause/unpause token transfers',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  [SMART_CONTRACT_ROLES.PRICE_UPDATER]: {
    name: 'Price Updater',
    description: 'Can update token price information',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [SMART_CONTRACT_ROLES.BLACKLIST_MANAGER]: {
    name: 'Blacklist Manager',
    description: 'Can manage blacklisted addresses',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  [SMART_CONTRACT_ROLES.APPROVER]: {
    name: 'Approver',
    description: 'Can approve pending transactions',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  [SMART_CONTRACT_ROLES.SUPER_ADMIN]: {
    name: 'Super Admin',
    description: 'Full access to all contract functions',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
} as const;