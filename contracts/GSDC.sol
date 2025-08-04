
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title GSDC Stablecoin
 * @dev Implementation of the Global South Digital Currency (GSDC) stablecoin
 * Represents a basket of BRICS currencies (CNH, RUB, INR, BRL, ZAR, IDR)
 */
contract GSDC is 
    Initializable,
    ERC20PausableUpgradeable, 
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable 
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");
    bytes32 public constant BLACKLIST_MANAGER_ROLE = keccak256("BLACKLIST_MANAGER_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");

    // Cooldown period (90 minutes)
    uint256 public constant COOLDOWN_PERIOD = 90 minutes;

    // Transaction types for cooldown
    enum TransactionType {
        MINT,
        BURN,
        TRANSFER,
        BLACKLIST,
        KYC_UPDATE,
        ROLE_GRANT,
        ROLE_REVOKE
    }

    // Transaction status
    enum TransactionStatus {
        PENDING,
        APPROVED,
        REJECTED,
        EXECUTED,
        AUTO_EXECUTED
    }

    // Pending transaction structure
    struct PendingTransaction {
        uint256 id;
        TransactionType txType;
        TransactionStatus status;
        address initiator;
        address target;
        uint256 amount;
        bytes data;
        uint256 timestamp;
        uint256 executeAfter;
        string rejectionReason;
        address approver;
        bool exists;
    }

    // Events
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event PriceUpdate(uint256 newPrice);
    event RedemptionRequested(address indexed user, uint256 amount, uint256 requestId);
    event RedemptionProcessed(uint256 indexed requestId, bool approved);
    event KYCStatusUpdated(address indexed user, bool status);
    event AddressBlacklisted(address indexed account, bool status);
    event TransactionQueued(uint256 indexed txId, TransactionType indexed txType, address indexed initiator);
    event TransactionApproved(uint256 indexed txId, address indexed approver);
    event TransactionRejected(uint256 indexed txId, address indexed approver, string reason);
    event TransactionExecuted(uint256 indexed txId, bool autoExecuted);

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

    // Pending transactions
    mapping(uint256 => PendingTransaction) public pendingTransactions;
    uint256 public nextTransactionId;
    uint256[] public pendingTransactionIds;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() external initializer {
        __ERC20_init("Global South Digital Currency", "GSDC");
        __ERC20Pausable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SUPER_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(PRICE_UPDATER_ROLE, msg.sender);
        _grantRole(BLACKLIST_MANAGER_ROLE, msg.sender);
        _grantRole(APPROVER_ROLE, msg.sender);

        nextTransactionId = 1;
        nextRedemptionId = 1;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(SUPER_ADMIN_ROLE) {}

    /**
     * @dev Modifier to check if address is not blacklisted
     * @param account Address to check
     */
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "GSDC: address is blacklisted");
        _;
    }

    /**
     * @dev Modifier to check approval permissions
     */
    modifier canApprove() {
        require(
            hasRole(APPROVER_ROLE, msg.sender) || hasRole(SUPER_ADMIN_ROLE, msg.sender),
            "GSDC: insufficient approval permissions"
        );
        _;
    }

    /**
     * @dev Queue a transaction for cooldown period
     */
    function _queueTransaction(
        TransactionType txType,
        address target,
        uint256 amount,
        bytes memory data
    ) internal returns (uint256) {
        uint256 txId = nextTransactionId++;
        uint256 executeAfter = block.timestamp + COOLDOWN_PERIOD;

        pendingTransactions[txId] = PendingTransaction({
            id: txId,
            txType: txType,
            status: TransactionStatus.PENDING,
            initiator: msg.sender,
            target: target,
            amount: amount,
            data: data,
            timestamp: block.timestamp,
            executeAfter: executeAfter,
            rejectionReason: "",
            approver: address(0),
            exists: true
        });

        pendingTransactionIds.push(txId);
        emit TransactionQueued(txId, txType, msg.sender);
        return txId;
    }

    /**
     * @dev Approve a pending transaction
     */
    function approveTransaction(uint256 txId) external canApprove {
        PendingTransaction storage txn = pendingTransactions[txId];
        require(txn.exists, "GSDC: transaction does not exist");
        require(txn.status == TransactionStatus.PENDING, "GSDC: transaction not pending");

        txn.status = TransactionStatus.APPROVED;
        txn.approver = msg.sender;

        emit TransactionApproved(txId, msg.sender);
        _executeTransaction(txId);
    }

    /**
     * @dev Reject a pending transaction
     */
    function rejectTransaction(uint256 txId, string memory reason) external canApprove {
        PendingTransaction storage txn = pendingTransactions[txId];
        require(txn.exists, "GSDC: transaction does not exist");
        require(txn.status == TransactionStatus.PENDING, "GSDC: transaction not pending");
        require(bytes(reason).length > 0, "GSDC: rejection reason required");

        txn.status = TransactionStatus.REJECTED;
        txn.rejectionReason = reason;
        txn.approver = msg.sender;

        _removePendingTransaction(txId);
        emit TransactionRejected(txId, msg.sender, reason);
    }

    /**
     * @dev Execute transaction after cooldown or approval
     */
    function executeTransaction(uint256 txId) external {
        PendingTransaction storage txn = pendingTransactions[txId];
        require(txn.exists, "GSDC: transaction does not exist");
        require(
            txn.status == TransactionStatus.APPROVED || 
            (txn.status == TransactionStatus.PENDING && block.timestamp >= txn.executeAfter),
            "GSDC: transaction not ready for execution"
        );

        if (txn.status == TransactionStatus.PENDING) {
            txn.status = TransactionStatus.AUTO_EXECUTED;
        }

        _executeTransaction(txId);
    }

    /**
     * @dev Internal function to execute transactions
     */
    function _executeTransaction(uint256 txId) internal {
        PendingTransaction storage txn = pendingTransactions[txId];
        
        if (txn.txType == TransactionType.MINT) {
            _mint(txn.target, txn.amount);
            emit Mint(txn.target, txn.amount);
        } else if (txn.txType == TransactionType.BURN) {
            _burn(txn.target, txn.amount);
            emit Burn(txn.target, txn.amount);
        } else if (txn.txType == TransactionType.BLACKLIST) {
            (address account, bool status) = abi.decode(txn.data, (address, bool));
            blacklisted[account] = status;
            emit AddressBlacklisted(account, status);
        } else if (txn.txType == TransactionType.KYC_UPDATE) {
            (address user, bool status) = abi.decode(txn.data, (address, bool));
            kycApproved[user] = status;
            emit KYCStatusUpdated(user, status);
        } else if (txn.txType == TransactionType.ROLE_GRANT) {
            (bytes32 role, address account) = abi.decode(txn.data, (bytes32, address));
            _grantRole(role, account);
        } else if (txn.txType == TransactionType.ROLE_REVOKE) {
            (bytes32 role, address account) = abi.decode(txn.data, (bytes32, address));
            _revokeRole(role, account);
        }

        txn.status = txn.status == TransactionStatus.AUTO_EXECUTED ? 
            TransactionStatus.AUTO_EXECUTED : TransactionStatus.EXECUTED;
        
        _removePendingTransaction(txId);
        emit TransactionExecuted(txId, txn.status == TransactionStatus.AUTO_EXECUTED);
    }

    /**
     * @dev Remove transaction from pending list
     */
    function _removePendingTransaction(uint256 txId) internal {
        for (uint256 i = 0; i < pendingTransactionIds.length; i++) {
            if (pendingTransactionIds[i] == txId) {
                pendingTransactionIds[i] = pendingTransactionIds[pendingTransactionIds.length - 1];
                pendingTransactionIds.pop();
                break;
            }
        }
    }

    /**
     * @dev Get all pending transaction IDs
     */
    function getPendingTransactionIds() external view returns (uint256[] memory) {
        return pendingTransactionIds;
    }

    /**
     * @dev Get pending transaction details
     */
    function getPendingTransaction(uint256 txId) external view returns (PendingTransaction memory) {
        return pendingTransactions[txId];
    }

    /**
     * @dev Updates KYC status for a user (with cooldown)
     */
    function updateKYCStatus(address user, bool status) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes memory data = abi.encode(user, status);
        _queueTransaction(TransactionType.KYC_UPDATE, user, 0, data);
    }

    /**
     * @dev Adds or removes an address from the blacklist (with cooldown)
     */
    function setBlacklistStatus(address account, bool status) external onlyRole(BLACKLIST_MANAGER_ROLE) {
        require(account != address(0), "GSDC: cannot blacklist zero address");
        require(!hasRole(DEFAULT_ADMIN_ROLE, account), "GSDC: cannot blacklist admin");

        bytes memory data = abi.encode(account, status);
        _queueTransaction(TransactionType.BLACKLIST, account, 0, data);
    }

    /**
     * @dev Batch blacklist multiple addresses (with cooldown for each)
     */
    function batchSetBlacklistStatus(address[] calldata accounts, bool status)
        external
        onlyRole(BLACKLIST_MANAGER_ROLE)
    {
        for (uint256 i = 0; i < accounts.length; i++) {
            require(accounts[i] != address(0), "GSDC: cannot blacklist zero address");
            require(!hasRole(DEFAULT_ADMIN_ROLE, accounts[i]), "GSDC: cannot blacklist admin");

            bytes memory data = abi.encode(accounts[i], status);
            _queueTransaction(TransactionType.BLACKLIST, accounts[i], 0, data);
        }
    }

    /**
     * @dev Checks if an address is blacklisted
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }

    /**
     * @dev Mints new tokens (with cooldown)
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

        _queueTransaction(TransactionType.MINT, to, amount, "");
    }

    /**
     * @dev Request token redemption
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
     * @dev Process redemption request (with cooldown)
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
            _queueTransaction(TransactionType.BURN, request.user, request.amount, "");
        }

        emit RedemptionProcessed(requestId, approved);
    }

    /**
     * @dev Grant role (with cooldown)
     */
    function grantRole(bytes32 role, address account) 
        public 
        override(AccessControlUpgradeable) 
        onlyRole(getRoleAdmin(role)) 
    {
        bytes memory data = abi.encode(role, account);
        _queueTransaction(TransactionType.ROLE_GRANT, account, 0, data);
    }

    /**
     * @dev Revoke role (with cooldown)
     */
    function revokeRole(bytes32 role, address account) 
        public 
        override(AccessControlUpgradeable) 
        onlyRole(getRoleAdmin(role)) 
    {
        bytes memory data = abi.encode(role, account);
        _queueTransaction(TransactionType.ROLE_REVOKE, account, 0, data);
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
     * @dev Required override for AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
