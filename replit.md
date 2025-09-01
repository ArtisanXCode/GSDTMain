# Overview

GSDC (Global South Digital Currency) is a stablecoin platform backed by a basket of BRICS currencies, designed to facilitate cross-border transactions and promote economic cooperation among Global South nations. The project combines a sophisticated smart contract architecture with a modern web application for user interaction, admin management, and KYC verification.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and build tooling
- **Styling**: TailwindCSS with DM Sans font family for consistent design
- **Animation**: Framer Motion for smooth transitions and interactive elements
- **Routing**: React Router for client-side navigation
- **State Management**: React hooks and context for authentication and wallet management
- **Rich Text**: TipTap editor for content management features

## Smart Contract Architecture
- **Pattern**: UUPS (Universal Upgradeable Proxy Standard) proxy pattern for upgradeability
- **Core Contracts**:
  - `GSDC.sol`: Main ERC20 implementation with mint/burn functionality and role-based access control
  - `GSDCProxy.sol`: UUPS proxy contract managing upgrades and state delegation
  - `MultiSigAdministrative.sol`: Advanced administrative contract with cooldown periods and multi-signature requirements
- **Security Features**: 90-minute cooldown for sensitive operations, role-based access control, pausable functionality, reentrancy protection
- **Roles**: ADMIN_ROLE, MINTER_ROLE, BURNER_ROLE, PAUSER_ROLE, PRICE_UPDATER_ROLE, BLACKLIST_MANAGER_ROLE, SUPER_ADMIN_ROLE, APPROVER_ROLE

## Authentication & Authorization
- **Multi-level Auth**: Wallet connection (MetaMask/Web3) combined with role-based permissions
- **KYC Integration**: Sumsub SDK integration for identity verification with NFT-based verification status
- **Admin System**: Role management with database-backed permissions and smart contract role assignment

## Data Storage Solutions
- **Primary Database**: Supabase for user data, KYC requests, contact messages, and admin management
- **File Storage**: Supabase storage for KYC documents and CMS assets
- **Blockchain State**: Smart contract state for token balances, roles, and transaction history

## API Architecture
- **Backend Services**: FastAPI (Python) for KYC status updates and email services
- **Email Service**: Express.js server with Nodemailer for automated email notifications
- **Exchange Rates**: Real-time exchange rate fetching from multiple APIs with caching and fallback mechanisms
- **Rate Management**: Unified exchange rate service with currency basket support for BRICS currencies

# External Dependencies

## Blockchain Infrastructure
- **Network**: BSC Testnet (Chain ID 97) for development and deployment
- **Wallet Integration**: WalletConnect v2 and MetaMask connector via Wagmi
- **Smart Contract Tools**: Hardhat for development, testing, and deployment with OpenZeppelin upgrades plugin

## Third-party Services
- **Identity Verification**: Sumsub WebSDK for comprehensive KYC/AML compliance
- **Database & Storage**: Supabase for PostgreSQL database and file storage
- **Exchange Rate APIs**: Multiple exchange rate providers with unified service layer
- **Email Delivery**: SMTP-based email service (configurable providers)

## Development Tools
- **Testing Framework**: Hardhat with Chai for smart contract testing
- **Type Safety**: TypeScript throughout the application stack
- **Code Quality**: ESLint with Next.js configuration
- **Build Tools**: Vite for fast development and optimized production builds

## Key Integrations
- **Chart.js**: For displaying historical exchange rate data and analytics
- **Crypto.js**: For cryptographic operations and data encryption
- **Date-fns**: For date formatting and manipulation
- **CORS**: Express CORS middleware for cross-origin requests
- **Buffer polyfills**: Browser compatibility for Node.js modules