// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

/**
 * @title GSDT Stablecoin
 * @dev Implementation of the Da BRICS Digital Koin (GSDT) stablecoin
 * Represents a basket of BRICS currencies (CNH, RUB, INR, BRL, ZAR, IDR)
 */
contract GSDT is ERC20Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");

    // Events
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event PriceUpdate(uint256 newPrice);
    event RedemptionRequested(address indexed user, uint256 amount, uint256 requestId);
    event RedemptionProcessed(uint256 indexed requestId, bool approved);
    event KYCStatusUpdated(address indexed user, bool status);

    // Current price in USDC (6 decimals)
    uint256 public currentPrice;
    
    // Minimum and maximum amounts for minting/burning
    uint256 public constant MIN_MINT_AMOUNT = 100 * 10**18; // 100 GSDT
    uint256 public constant MAX_MINT_AMOUNT = 1000000 * 10**18; // 1M GSDT
    
    // KYC status mapping
    mapping(address => bool) public kycApproved;
    
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

    constructor() ERC20("Da BRICS Digital Koin", "GSDT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(PRICE_UPDATER_ROLE, msg.sender);
        
        // Initialize price to 1 USDC
        currentPrice = 1_000000; // 1 USDC with 6 decimals
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
     * @dev Mints new tokens
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(to != address(0), "GSDT: mint to the zero address");
        require(kycApproved[to], "GSDT: recipient not KYC approved");
        require(amount >= MIN_MINT_AMOUNT, "GSDT: amount below minimum");
        require(amount <= MAX_MINT_AMOUNT, "GSDT: amount above maximum");
        
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
    {
        require(from != address(0), "GSDT: burn from the zero address");
        require(kycApproved[from], "GSDT: user not KYC approved");
        require(balanceOf(from) >= amount, "GSDT: insufficient balance");
        
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
    {
        require(kycApproved[msg.sender], "GSDT: user not KYC approved");
        require(balanceOf(msg.sender) >= amount, "GSDT: insufficient balance");
        
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
        require(!request.processed, "GSDT: request already processed");
        require(request.user != address(0), "GSDT: invalid request");
        
        request.processed = true;
        request.approved = approved;
        
        if (approved) {
            _burn(request.user, request.amount);
        }
        
        emit RedemptionProcessed(requestId, approved);
    }

    /**
     * @dev Updates the current price of GSDT in USDC
     * @param newPrice The new price (6 decimals)
     */
    function updatePrice(uint256 newPrice) 
        external 
        onlyRole(PRICE_UPDATER_ROLE) 
    {
        require(newPrice > 0, "GSDT: invalid price");
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
     * @dev Hook that is called before any transfer of tokens
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        
        // Check KYC status for non-zero addresses (exclude minting/burning)
        if (from != address(0) && to != address(0)) {
            require(kycApproved[from] && kycApproved[to], "GSDT: KYC check failed");
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