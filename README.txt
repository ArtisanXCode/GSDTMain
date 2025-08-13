
# GSDC - Global South Digital Currency

GSDC is a revolutionary stablecoin backed by a basket of BRICS currencies, providing a stable and efficient means of cross-border transactions while promoting economic cooperation among BRICS nations.

## Features

- Currency Basket: Backed by a weighted basket of BRICS currencies (CNH, RUB, INR, BRL, ZAR, IDR)
- Smart Contract Security: Built on robust blockchain technology with multiple security layers
- Real-time Exchange Rates: Up-to-date exchange rates for BRICS currencies
- Admin Dashboard: Comprehensive admin interface for managing users and roles
- Proof of Reserves: Transparent reporting of reserve assets

## Table of Contents

- Getting Started
- Project Structure
- Available Scripts
- Key Components
- Smart Contract
- Admin Features
- Technologies Used
- Deployment
- Contributing
- License

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository:
```
git clone https://github.com/your-username/gsdc-platform.git
cd gsdc-platform
```

2. Install dependencies:
```
npm install
```

3. Set up environment variables:
```
cp .env.example .env
```
Fill in your environment variables in .env

4. Start the development server:
```
npm run dev
```

## Project Structure

```
gsdc-platform/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Application pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── contracts/          # Smart contract ABIs
│   └── lib/                # Core libraries
├── contracts/              # Solidity smart contracts
├── public/                 # Static assets
└── supabase/              # Database migrations
```

## Available Scripts

- npm run dev - Start development server
- npm run build - Build for production
- npm run preview - Preview production build
- npm run lint - Run ESLint
- npm test - Run tests

## Key Components

### Smart Contract Features
- Minting/Burning: Controlled token creation and destruction
- Role-based Access: Multiple permission levels
- Pausable: Emergency pause functionality
- Multi-Sig Administrative: Advanced administrative controls with cooldown periods

### Frontend Features
- Token Dashboard: View balances and transaction history
- Minting Interface: Mint tokens using fiat or crypto
- Admin Panel: Comprehensive management interface
- Exchange Rates: Real-time BRICS currency rates

## Smart Contract Architecture

The GSDC platform uses a simplified three-contract architecture:

1. **GSDCProxy.sol**: UUPS proxy contract that holds state and delegates calls
2. **GSDC.sol**: Main ERC20 stablecoin contract with basic mint/burn functionality
3. **MultiSigAdministrative.sol**: Advanced administrative contract with:
   - 90-minute cooldown periods for sensitive operations
   - Multi-signature approval system
   - Role-based access control
   - Transaction queue management

Contract Address: 0x5589660F31F3229EA268AFa65e412Cd16666E83b

## Admin Features

### Dashboard
- System overview and statistics
- Recent transactions
- User activity metrics

### Role Management
- Assign user roles
- Manage permissions
- Audit access controls

### Exchange Rates
- Update currency rates
- Historical rate tracking
- Automated rate feeds

### Proof of Reserves
- Reserve asset tracking
- Transparency reports
- Audit trail

### Fiat Mint Requests
- Review and approve fiat minting requests
- Payment verification
- Transaction history

## Technologies Used

- Frontend: React, TypeScript, Tailwind CSS
- Blockchain: Ethereum, ethers.js
- Backend: Supabase
- Smart Contracts: Solidity, Hardhat
- Build Tool: Vite

## Deployment

### Development
1. Install dependencies: npm install
2. Set up environment variables
3. Run development server: npm run dev

### Production
1. Build the application: npm run build
2. Deploy to your hosting provider
3. Configure environment variables
4. Set up database migrations

### Smart Contract Deployment
1. Configure Hardhat network settings
2. Deploy contracts: npx hardhat run scripts/deploy-simplified-gsdc.ts
3. Verify contracts on Etherscan
4. Update contract addresses in frontend

## Security Features

- UUPS upgradeable proxy pattern
- Role-based access control
- 90-minute cooldown for sensitive operations
- Multi-signature approval system
- Reentrancy protection
- Pausable functionality
- Transaction queue management

## Contributing

1. Fork the repository
2. Create a feature branch: git checkout -b feature/amazing-feature
3. Commit your changes: git commit -m 'Add amazing feature'
4. Push to the branch: git push origin feature/amazing-feature
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact support@gsdc.com or join our Discord community.

## Links

- Website: https://gsdc.com
- Documentation: https://docs.gsdc.com
- Twitter: https://twitter.com/gsdc_official
- Telegram: https://t.me/gsdc_official
