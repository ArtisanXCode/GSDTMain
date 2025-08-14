
# GSDC Smart Contract Documentation

## Overview

GSDC (Global South Digital Currency) is a stablecoin implementation using a simplified three-contract architecture with enhanced security features and administrative controls.

## Smart Contract Architecture

### 1. GSDCProxy.sol - UUPS Proxy Contract
- **Purpose**: UUPS proxy that holds state and delegates calls to the implementation
- **Pattern**: ERC1967 UUPS (Universal Upgradeable Proxy Standard)
- **Functionality**: Manages upgrades and maintains storage layout

### 2. GSDC.sol - Main ERC20 Implementation
- **Purpose**: Core ERC20 stablecoin with basic mint/burn functionality
- **Features**:
  - Standard ERC20 compliance
  - Mint/burn operations (owner only)
  - Pausable functionality
  - Reentrancy protection
  - UUPS upgradeable

#### Key Functions:
```solidity
function mint(address to, uint256 amount) external onlyOwner
function burn(uint256 amount) external
function burnFrom(address from, uint256 amount) external onlyOwner
function pause() external onlyOwner
function unpause() external onlyOwner
```

#### Constants:
- `MIN_MINT_AMOUNT`: 100 GSDC (100 * 10^18)
- `MAX_MINT_AMOUNT`: 1,000,000 GSDC (1000000 * 10^18)

### 3. MultiSigAdministrative.sol - Advanced Administrative Contract
- **Purpose**: Handles all administrative functions with cooldown periods and multi-signature requirements
- **Key Features**:
  - 90-minute cooldown for sensitive operations
  - Role-based access control
  - Transaction queue management
  - Multi-signature approval system
  - Blacklist management
  - Redemption requests

#### Roles:
- `ADMIN_ROLE`: Full administrative access
- `MINTER_ROLE`: Can queue mint transactions
- `BURNER_ROLE`: Can queue burn transactions  
- `PAUSER_ROLE`: Can pause/unpause token
- `BLACKLIST_MANAGER_ROLE`: Can manage blacklisted addresses
- `APPROVER_ROLE`: Can approve pending transactions

#### Transaction Types:
- `MINT`: Token minting operations
- `BURN`: Token burning operations
- `TRANSFER_OWNERSHIP`: Ownership transfers
- `BLACKLIST`: Address blacklisting
- `ROLE_GRANT`: Role assignments
- `ROLE_REVOKE`: Role removals
- `PAUSE_TOKEN`: Token pausing
- `UNPAUSE_TOKEN`: Token unpausing

## Security Features

### Cooldown Mechanism
- **Duration**: 90 minutes for sensitive operations
- **Purpose**: Prevents rapid execution of critical functions
- **Override**: Transactions can be approved by authorized roles to execute immediately

### Multi-Signature System
- Pending transactions require approval from `APPROVER_ROLE` or `ADMIN_ROLE`
- Transactions auto-execute after cooldown period if not manually approved
- Rejection system with reason tracking

### Future MPC Wallet Integration
- **Planned Integration**: [Fireblocks](https://fireblocks.com) MPC (Multi-Party Computation) wallet functionality
- **Current Status**: Role-based multisig implementation in smart contracts
- **Future Enhancement**: Hardware-level security with Fireblocks MPC technology
- **Benefits**: Enhanced key management, institutional-grade security, and regulatory compliance
- **Timeline**: Integration planned for future releases to replace current role-based approval system

### Access Control
- Hierarchical role system with granular permissions
- Admin roles cannot be blacklisted
- Role changes subject to cooldown periods

### Blacklist Management
- Real-time address blocking
- Prevents blacklisted addresses from participating in transactions
- Admin-level protection against accidental blacklisting

## Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────┐
│   GSDCProxy     │────│      GSDC        │    │ MultiSigAdministrative  │
│   (UUPS Proxy)  │    │ (Implementation) │    │   (Admin Functions)     │
└─────────────────┘    └──────────────────┘    └─────────────────────────┘
        │                        │                          │
        │                        │                          │
        ▼                        ▼                          ▼
   State Storage            Core ERC20 Logic         Administrative Logic
   Upgrade Logic           Mint/Burn/Pause          Cooldowns/Approvals
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │ Future: Fireblocks │
                                                    │   MPC Wallet     │
                                                    │   Integration    │
                                                    └─────────────────┘
```

## Contract Interactions

### For Token Operations:
1. **Minting**: `MultiSigAdministrative.mintTokens()` → queues → `GSDC.mint()`
2. **Burning**: `MultiSigAdministrative.burnTokens()` → queues → `GSDC.burnFrom()`
3. **Pausing**: `MultiSigAdministrative.pauseToken()` → queues → `GSDC.pause()`

### For Administrative Tasks:
1. **Role Management**: Direct calls to `MultiSigAdministrative` with cooldown
2. **Blacklisting**: Queue transaction → approval → execution
3. **Emergency Actions**: Direct admin functions bypass cooldown

## Deployment Steps

1. **Deploy GSDC Implementation**:
   ```bash
   npx hardhat run scripts/deploy-simplified-gsdc.ts
   ```

2. **Deploy Proxy with Initialization**:
   - Proxy points to GSDC implementation
   - Calls `initialize()` on deployment

3. **Deploy MultiSig Administrative**:
   - Pass GSDC proxy address as constructor parameter
   - Set up initial roles and permissions

4. **Transfer Ownership**:
   - Transfer GSDC ownership to MultiSig contract
   - Ensures all admin functions go through cooldown system

## Configuration

### Environment Variables Required:
```
PRIVATE_KEY=your_deployment_private_key
BSC_RPC_URL=your_bsc_rpc_endpoint
BSCSCAN_API_KEY=your_bscscan_api_key (for verification)
```

### Network Configuration (Hardhat):
```javascript
networks: {
  bsc: {
    url: process.env.BSC_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

## Verification

After deployment, verify contracts on BSCScan:
```bash
npx hardhat verify --network bsc PROXY_ADDRESS
npx hardhat verify --network bsc IMPLEMENTATION_ADDRESS  
npx hardhat verify --network bsc MULTISIG_ADDRESS PROXY_ADDRESS
```

## Upgrade Process

1. Deploy new implementation contract
2. Call `upgradeToAndCall()` on proxy (requires admin privileges)
3. New implementation automatically inherits existing state
4. All upgrades subject to cooldown period through MultiSig

## Emergency Procedures

### Immediate Actions (No Cooldown):
- `emergencyPause()`: Immediately pause the administrative contract
- `emergencyUnpause()`: Immediately unpause the administrative contract

### Standard Emergency (With Cooldown):
- Token pausing/unpausing
- Address blacklisting
- Role revocation

## Testing

Run contract tests:
```bash
npx hardhat test test/GSDC-Security.test.ts
```

## Gas Optimization

- Uses OpenZeppelin's gas-optimized contracts
- Efficient role checking with AccessControl
- Minimal storage operations in proxy pattern
- Batch operations where possible

## Audit Recommendations

1. **Multi-Signature Verification**: Ensure proper multi-sig implementation
2. **Cooldown Testing**: Verify cooldown periods cannot be bypassed
3. **Role Management**: Test role assignment/revocation edge cases
4. **Upgrade Safety**: Verify storage layout compatibility
5. **Blacklist Security**: Ensure admin addresses cannot be blacklisted
6. **Emergency Functions**: Test emergency pause mechanisms

## Contract Addresses

Update these addresses after deployment:

```typescript
// In src/contracts/GSDC.ts
export const GSDC_ADDRESS = "DEPLOYED_PROXY_ADDRESS";
export const MULTISIG_ADMIN_ADDRESS = "DEPLOYED_MULTISIG_ADDRESS";
```

## Integration Notes

- Frontend should interact with MultiSig contract for admin functions
- Direct GSDC contract calls only for standard ERC20 operations
- Monitor pending transactions through MultiSig events
- Implement proper error handling for cooldown periods

## Roadmap

### Phase 1: Current Implementation (Completed)
- ✅ Role-based multisig administrative contract
- ✅ 90-minute cooldown mechanism
- ✅ Transaction queuing and approval system
- ✅ Basic administrative controls

### Phase 2: Fireblocks MPC Integration (Planned)
- 🔄 **Fireblocks MPC Wallet Integration**: Replace current role-based approvals with Fireblocks MPC technology
- 🔄 **Enhanced Security**: Hardware-level key protection and institutional-grade security
- 🔄 **API Integration**: Fireblocks API integration for transaction signing and approval
- 🔄 **Compliance**: Enhanced regulatory compliance with institutional wallet infrastructure
- 🔄 **Key Management**: Distributed key generation and management through MPC protocols

### Integration Benefits
- **Security**: MPC eliminates single points of failure in key management
- **Compliance**: Meets institutional and regulatory requirements
- **Scalability**: Enterprise-grade transaction processing
- **Auditability**: Enhanced transaction tracking and reporting
- **Recovery**: Robust key recovery mechanisms

### Technical Requirements for Fireblocks Integration
- Fireblocks API credentials and workspace setup
- Smart contract modifications to support Fireblocks transaction flow
- Frontend integration with Fireblocks SDK
- Testing on Fireblocks sandbox environment
- Security audit of integrated system
