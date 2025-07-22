
# GSDC - Global South Digital Currency

![GSDC Logo](https://img.shields.io/badge/GSDC-Global%20South%20Digital%20Currency-4c1d95?style=for-the-badge)

GSDC is a revolutionary stablecoin backed by a basket of BRICS currencies, providing a stable and efficient means of cross-border transactions while promoting economic cooperation among BRICS nations.

## 🌟 Features

- **Currency Basket**: Backed by a weighted basket of BRICS currencies (CNH, RUB, INR, BRL, ZAR, IDR)
- **Smart Contract Security**: Built on robust blockchain technology with multiple security layers
- **KYC Verification**: Integrated KYC process for regulatory compliance
- **Real-time Exchange Rates**: Up-to-date exchange rates for BRICS currencies
- **Admin Dashboard**: Comprehensive admin interface for managing users, KYC requests, and roles
- **Proof of Reserves**: Transparent reporting of reserve assets

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Key Components](#key-components)
- [Smart Contract](#smart-contract)
- [Admin Features](#admin-features)
- [Technologies Used](#technologies-used)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/gsdc-platform.git
cd gsdc-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Fill in your environment variables in `.env`

4. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

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

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 🔑 Key Components

### Smart Contract Features
- **Minting/Burning**: Controlled token creation and destruction
- **KYC Integration**: Built-in KYC verification system
- **Role-based Access**: Multiple permission levels
- **Pausable**: Emergency pause functionality
- **Blacklist**: Address blacklisting capability

### Frontend Features
- **Token Dashboard**: View balances and transaction history
- **Minting Interface**: Mint tokens using fiat or crypto
- **KYC Verification**: Complete identity verification
- **Admin Panel**: Comprehensive management interface
- **Exchange Rates**: Real-time BRICS currency rates

## 🔗 Smart Contract

The GSDC token contract is deployed on Ethereum and includes:

- **ERC20 Compliance**: Standard token functionality
- **Access Control**: Role-based permissions
- **Pausable Operations**: Emergency controls
- **KYC Integration**: Built-in verification
- **Blacklist Functionality**: Address restriction capability

Contract Address: `0x892404Da09f3D7871C49Cd6d6C167F8EB176C804`

## 👨‍💼 Admin Features

### Dashboard
- System overview and statistics
- Recent transactions
- User activity metrics

### KYC Management
- Review verification requests
- Approve/reject applications
- Monitor compliance status

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

## 🛠️ Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum, ethers.js
- **Backend**: Supabase
- **Smart Contracts**: Solidity, Hardhat
- **Build Tool**: Vite

## 🚀 Deployment

### Development
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development server: `npm run dev`

### Production
1. Build the application: `npm run build`
2. Deploy to your hosting provider
3. Configure environment variables
4. Set up database migrations

### Smart Contract Deployment
1. Configure Hardhat network settings
2. Deploy contracts: `npx hardhat run scripts/deploy.ts`
3. Verify contracts on Etherscan
4. Update contract addresses in frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please contact [support@gsdc.com](mailto:support@gsdc.com) or join our [Discord community](https://discord.gg/gsdc).

## 🔗 Links

- [Website](https://gsdc.com)
- [Documentation](https://docs.gsdc.com)
- [Twitter](https://twitter.com/gsdc_official)
- [Telegram](https://t.me/gsdc_official)
