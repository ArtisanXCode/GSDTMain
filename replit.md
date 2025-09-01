# Overview

GSDC (Global South Digital Currency) is a blockchain-based stablecoin platform backed by a basket of BRICS currencies. The system provides a stable digital currency solution for cross-border transactions among Global South nations, featuring comprehensive KYC verification, admin controls, and real-time exchange rate management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Styling**: Tailwind CSS for responsive design with custom color schemes and animations
- **State Management**: React hooks and context for wallet connection and authentication
- **Routing**: React Router for client-side navigation with protected routes
- **Animation**: Framer Motion for smooth UI transitions and interactions

## Smart Contract Architecture
- **Contract Pattern**: UUPS (Universal Upgradeable Proxy Standard) proxy pattern for upgradeability
- **Core Contracts**:
  - `GSDC.sol`: Main ERC20 token implementation with mint/burn functionality
  - `GSDCProxy.sol`: UUPS proxy contract managing upgrades and state
  - `MultiSigAdministrative.sol`: Advanced admin controls with cooldown periods and multi-signature requirements
- **Security Features**: Role-based access control, pausable functionality, reentrancy protection, blacklist management
- **Deployment Target**: BSC Testnet (Chain ID 97) with planned mainnet deployment

## Authentication & Authorization
- **Wallet Integration**: Web3Modal with Wagmi for multi-wallet support (MetaMask primary)
- **Role System**: Hierarchical admin roles (Super Admin, Minter, Burner, Pauser, Price Updater, Blacklist Manager, Approver)
- **KYC Integration**: Sumsub SDK for identity verification with NFT-based status tracking
- **Protected Routes**: Context-based authentication with admin privilege checks

## Data Storage Solutions
- **Primary Database**: Supabase for user data, KYC requests, admin logs, and transaction records
- **Blockchain Storage**: Smart contract state for token balances, roles, and critical operations
- **File Storage**: Supabase storage for KYC documents and user uploads
- **Local Storage**: Cached exchange rates and user preferences

## API Architecture
- **Backend Services**: 
  - FastAPI service for KYC status updates and external integrations
  - Node.js/Express server for email notifications
  - Flask service for SMTP email handling
- **Exchange Rate Service**: Unified service consuming multiple APIs with fallback mechanisms
- **Real-time Updates**: WebSocket connections for live data and automatic refresh intervals

# External Dependencies

## Blockchain & Web3
- **Ethereum/BSC**: Primary blockchain infrastructure using ethers.js v5.7.2
- **OpenZeppelin**: Smart contract security patterns and upgrade mechanisms
- **Hardhat**: Development framework for smart contract testing and deployment

## Database & Backend
- **Supabase**: PostgreSQL-based backend-as-a-service for data persistence
- **FastAPI**: Python web framework for KYC and administrative APIs
- **Express.js**: Node.js server for email services and middleware

## Third-Party Integrations
- **Sumsub**: KYC/AML verification service with WebSDK integration
- **Exchange Rate APIs**: Multiple providers for real-time currency conversion
- **SMTP Services**: Email notifications for admin alerts and user communications
- **Chart.js**: Data visualization for analytics and exchange rate charts

## Development & Deployment
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced development experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint**: Code quality and consistency enforcement