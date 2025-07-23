
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

/**
 * @title GSDC Stablecoin
 * @dev Implementation of the Global South Digital Currency (GSDC) stablecoin
 * Represents a basket of BRICS currencies (CNH, RUB, INR, BRL, ZAR, IDR)
 */
contract GSDC is ERC20Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");
    bytes32 public constant BLACKLIST_MANAGER_ROLE = keccak256("BLACKLIST_MANAGER_ROLE");

    // Events
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event PriceUpdate(uint256 newPrice);
    event RedemptionRequested(address indexed user, uint256 amount, uint256 requestId);
    event RedemptionProcessed(uint256 indexed requestId, bool approved);
    event KYCStatusUpdated(address indexed user, bool status);
    event AddressBlacklisted(address indexed account, bool status);

    // Current price in USDC (6 decimals)
    uint256 public currentPrice;

    // Minimum and maximum amounts for minting/burning
    uint256 public constant MIN_MINT_AMOUNT = 100 * 10**18; // 100 GSDC
    uint256 public constant MAX_MINT_AMOUNT = 1000000 * 10**18; // 1M GSDC

    // KYC status mapping
    mapping(address => bool) public kycApproved;

    // Blacklist mapping
    mapping(address => bool) public blacklisted;

    // Redemption request structure
    struct RedemptionRequest {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool processed;
        bool approved;
    }

    // Redemption requests mapping
    mapping(uint256 => RedemptionRequest) public redemptionRequests;
    uint256 public nextRedemptionId;

    constructor() ERC20("Global South Digital Currency", "GSDC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(PRICE_UPDATER_ROLE, msg.sender);
        _grantRole(BLACKLIST_MANAGER_ROLE, msg.sender);

        // Initialize price to 1 USDC
        currentPrice = 1_000000; // 1 USDC with 6 decimals
    }

    /**
     * @dev Modifier to check if address is not blacklisted
     * @param account Address to check
     */
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "GSDC: address is blacklisted");
        _;
    }

    /**
     * @dev Updates KYC status for a user
     * @param user Address of the user
     * @param status KYC approval status
     */
    function updateKYCStatus(address user, bool status) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        kycApproved[user] = status;
        emit KYCStatusUpdated(user, status);
    }

    /**
     * @dev Adds or removes an address from the blacklist
     * @param account Address to blacklist/unblacklist
     * @param status Blacklist status (true to blacklist, false to unblacklist)
     */
    function setBlacklistStatus(address account, bool status)
        external
        onlyRole(BLACKLIST_MANAGER_ROLE)
    {
        require(account != address(0), "GSDC: cannot blacklist zero address");
        require(!hasRole(DEFAULT_ADMIN_ROLE, account), "GSDC: cannot blacklist admin");

        blacklisted[account] = status;
        emit AddressBlacklisted(account, status);
    }

    /**
     * @dev Batch blacklist multiple addresses
     * @param accounts Array of addresses to blacklist
     * @param status Blacklist status for all addresses
     */
    function batchSetBlacklistStatus(address[] calldata accounts, bool status)
        external
        onlyRole(BLACKLIST_MANAGER_ROLE)
    {
        for (uint256 i = 0; i < accounts.length; i++) {
            require(accounts[i] != address(0), "GSDC: cannot blacklist zero address");
            require(!hasRole(DEFAULT_ADMIN_ROLE, accounts[i]), "GSDC: cannot blacklist admin");

            blacklisted[accounts[i]] = status;
            emit AddressBlacklisted(accounts[i], status);
        }
    }

    /**
     * @dev Checks if an address is blacklisted
     * @param account Address to check
     * @return bool Blacklist status
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }

    /**
     * @dev Mints new tokens
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        nonReentrant 
        notBlacklisted(to)
    {
        require(to != address(0), "GSDC: mint to the zero address");
        require(kycApproved[to], "GSDC: recipient not KYC approved");
        require(amount >= MIN_MINT_AMOUNT, "GSDC: amount below minimum");
        require(amount <= MAX_MINT_AMOUNT, "GSDC: amount above maximum");

        _mint(to, amount);
        emit Mint(to, amount);
    }

    /**
     * @dev Burns tokens
     * @param from The address whose tokens will be burned
     * @param amount The amount of tokens to burn
     */
    function burn(address from, uint256 amount) 
        external 
        onlyRole(BURNER_ROLE) 
        whenNotPaused 
        nonReentrant 
        notBlacklisted(from)
    {
        require(from != address(0), "GSDC: burn from the zero address");
        require(kycApproved[from], "GSDC: user not KYC approved");
        require(balanceOf(from) >= amount, "GSDC: insufficient balance");

        _burn(from, amount);
        emit Burn(from, amount);
    }

    /**
     * @dev Request token redemption
     * @param amount Amount of tokens to redeem
     */
    function requestRedemption(uint256 amount)
        external
        whenNotPaused
        nonReentrant
        notBlacklisted(msg.sender)
    {
        require(kycApproved[msg.sender], "GSDC: user not KYC approved");
        require(balanceOf(msg.sender) >= amount, "GSDC: insufficient balance");

        uint256 requestId = nextRedemptionId++;
        redemptionRequests[requestId] = RedemptionRequest({
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            processed: false,
            approved: false
        });

        emit RedemptionRequested(msg.sender, amount, requestId);
    }

    /**
     * @dev Process redemption request
     * @param requestId ID of the redemption request
     * @param approved Whether the request is approved
     */
    function processRedemption(uint256 requestId, bool approved)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        RedemptionRequest storage request = redemptionRequests[requestId];
        require(!request.processed, "GSDC: request already processed");
        require(request.user != address(0), "GSDC: invalid request");
        require(!blacklisted[request.user], "GSDC: user is blacklisted");

        request.processed = true;
        request.approved = approved;

        if (approved) {
            _burn(request.user, request.amount);
        }

        emit RedemptionProcessed(requestId, approved);
    }

    /**
     * @dev Updates the current price of GSDC in USDC
     * @param newPrice The new price (6 decimals)
     */
    function updatePrice(uint256 newPrice) 
        external 
        onlyRole(PRICE_UPDATER_ROLE) 
    {
        require(newPrice > 0, "GSDC: invalid price");
        currentPrice = newPrice;
        emit PriceUpdate(newPrice);
    }

    /**
     * @dev Pauses all token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Override transfer function to check blacklist
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        notBlacklisted(msg.sender) 
        notBlacklisted(to) 
        returns (bool) 
    {
        return super.transfer(to, amount);
    }

    /**
     * @dev Override transferFrom function to check blacklist
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        notBlacklisted(from) 
        notBlacklisted(to) 
        returns (bool) 
    {
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._update(from, to, amount);

        // Check blacklist status
        require(!blacklisted[from], "GSDC: sender is blacklisted");
        require(!blacklisted[to], "GSDC: recipient is blacklisted");

        // Check KYC status for non-zero addresses (exclude minting/burning)
        if (from != address(0) && to != address(0)) {
            require(kycApproved[from] && kycApproved[to], "GSDC: KYC check failed");
        }
    }

    /**
     * @dev Required override for AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
