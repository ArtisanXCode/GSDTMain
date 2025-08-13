
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IGSDC {
    function mint(address to, uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
    function pause() external;
    function unpause() external;
    function transferOwnership(address newOwner) external;
}

/**
 * @title MultiSig Administrative Contract for GSDC
 * @dev Handles all administrative functions with cooldown periods and multi-signature requirements
 */
contract MultiSigAdministrative is AccessControl, ReentrancyGuard, Pausable {
    
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLIST_MANAGER_ROLE = keccak256("BLACKLIST_MANAGER_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    // Cooldown period (90 minutes)
    uint256 public constant COOLDOWN_PERIOD = 90 minutes;

    // GSDC token contract
    IGSDC public gsdcToken;

    // Transaction types for cooldown
    enum TransactionType {
        MINT,
        BURN,
        TRANSFER_OWNERSHIP,
        BLACKLIST,
        ROLE_GRANT,
        ROLE_REVOKE,
        PAUSE_TOKEN,
        UNPAUSE_TOKEN
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
    event TransactionQueued(uint256 indexed txId, TransactionType indexed txType, address indexed initiator);
    event TransactionApproved(uint256 indexed txId, address indexed approver);
    event TransactionRejected(uint256 indexed txId, address indexed approver, string reason);
    event TransactionExecuted(uint256 indexed txId, bool autoExecuted);
    event AddressBlacklisted(address indexed account, bool status);
    event TokenContractUpdated(address indexed newTokenContract);

    // Blacklist mapping
    mapping(address => bool) public blacklisted;

    // Pending transactions
    mapping(uint256 => PendingTransaction) public pendingTransactions;
    uint256 public nextTransactionId;
    uint256[] public pendingTransactionIds;

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

    constructor(address _gsdcToken) {
        require(_gsdcToken != address(0), "Invalid token contract address");
        
        gsdcToken = IGSDC(_gsdcToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(BLACKLIST_MANAGER_ROLE, msg.sender);
        _grantRole(APPROVER_ROLE, msg.sender);

        nextTransactionId = 1;
        nextRedemptionId = 1;
    }

    /**
     * @dev Modifier to check if address is not blacklisted
     */
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Address is blacklisted");
        _;
    }

    /**
     * @dev Modifier to check approval permissions
     */
    modifier canApprove() {
        require(
            hasRole(APPROVER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender),
            "Insufficient approval permissions"
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
        require(txn.exists, "Transaction does not exist");
        require(txn.status == TransactionStatus.PENDING, "Transaction not pending");

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
        require(txn.exists, "Transaction does not exist");
        require(txn.status == TransactionStatus.PENDING, "Transaction not pending");
        require(bytes(reason).length > 0, "Rejection reason required");

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
        require(txn.exists, "Transaction does not exist");
        require(
            txn.status == TransactionStatus.APPROVED || 
            (txn.status == TransactionStatus.PENDING && block.timestamp >= txn.executeAfter),
            "Transaction not ready for execution"
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
            gsdcToken.mint(txn.target, txn.amount);
        } else if (txn.txType == TransactionType.BURN) {
            gsdcToken.burnFrom(txn.target, txn.amount);
        } else if (txn.txType == TransactionType.BLACKLIST) {
            (address account, bool status) = abi.decode(txn.data, (address, bool));
            blacklisted[account] = status;
            emit AddressBlacklisted(account, status);
        } else if (txn.txType == TransactionType.ROLE_GRANT) {
            (bytes32 role, address account) = abi.decode(txn.data, (bytes32, address));
            _grantRole(role, account);
        } else if (txn.txType == TransactionType.ROLE_REVOKE) {
            (bytes32 role, address account) = abi.decode(txn.data, (bytes32, address));
            _revokeRole(role, account);
        } else if (txn.txType == TransactionType.PAUSE_TOKEN) {
            gsdcToken.pause();
        } else if (txn.txType == TransactionType.UNPAUSE_TOKEN) {
            gsdcToken.unpause();
        } else if (txn.txType == TransactionType.TRANSFER_OWNERSHIP) {
            gsdcToken.transferOwnership(txn.target);
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
     * @dev Mint tokens (with cooldown)
     */
    function mintTokens(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        nonReentrant 
        notBlacklisted(to)
    {
        require(to != address(0), "Mint to the zero address");
        _queueTransaction(TransactionType.MINT, to, amount, "");
    }

    /**
     * @dev Burn tokens (with cooldown)
     */
    function burnTokens(address from, uint256 amount)
        external
        onlyRole(BURNER_ROLE)
        whenNotPaused
        nonReentrant
        notBlacklisted(from)
    {
        require(from != address(0), "Burn from the zero address");
        _queueTransaction(TransactionType.BURN, from, amount, "");
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
        uint256 requestId = nextRedemptionId++;
        redemptionRequests[requestId] = RedemptionRequest({
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            processed: false,
            approved: false
        });
    }

    /**
     * @dev Process redemption request
     */
    function processRedemption(uint256 requestId, bool approved)
        external
        onlyRole(ADMIN_ROLE)
        nonReentrant
    {
        RedemptionRequest storage request = redemptionRequests[requestId];
        require(!request.processed, "Request already processed");
        require(request.user != address(0), "Invalid request");
        require(!blacklisted[request.user], "User is blacklisted");

        request.processed = true;
        request.approved = approved;

        if (approved) {
            _queueTransaction(TransactionType.BURN, request.user, request.amount, "");
        }
    }

    /**
     * @dev Set blacklist status (with cooldown)
     */
    function setBlacklistStatus(address account, bool status) external onlyRole(BLACKLIST_MANAGER_ROLE) {
        require(account != address(0), "Cannot blacklist zero address");
        require(!hasRole(ADMIN_ROLE, account), "Cannot blacklist admin");

        bytes memory data = abi.encode(account, status);
        _queueTransaction(TransactionType.BLACKLIST, account, 0, data);
    }

    /**
     * @dev Pause token contract (with cooldown)
     */
    function pauseToken() external onlyRole(PAUSER_ROLE) {
        _queueTransaction(TransactionType.PAUSE_TOKEN, address(0), 0, "");
    }

    /**
     * @dev Unpause token contract (with cooldown)
     */
    function unpauseToken() external onlyRole(PAUSER_ROLE) {
        _queueTransaction(TransactionType.UNPAUSE_TOKEN, address(0), 0, "");
    }

    /**
     * @dev Grant role (with cooldown)
     */
    function grantRole(bytes32 role, address account) 
        public 
        override(AccessControl) 
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
        override(AccessControl) 
        onlyRole(getRoleAdmin(role)) 
    {
        bytes memory data = abi.encode(role, account);
        _queueTransaction(TransactionType.ROLE_REVOKE, account, 0, data);
    }

    /**
     * @dev Transfer token contract ownership (with cooldown)
     */
    function transferTokenOwnership(address newOwner) external onlyRole(ADMIN_ROLE) {
        require(newOwner != address(0), "New owner is the zero address");
        _queueTransaction(TransactionType.TRANSFER_OWNERSHIP, newOwner, 0, "");
    }

    /**
     * @dev Update GSDC token contract address
     */
    function updateTokenContract(address newTokenContract) external onlyRole(ADMIN_ROLE) {
        require(newTokenContract != address(0), "Invalid token contract address");
        gsdcToken = IGSDC(newTokenContract);
        emit TokenContractUpdated(newTokenContract);
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
     * @dev Check if address is blacklisted
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }

    /**
     * @dev Emergency pause (immediate)
     */
    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Emergency unpause (immediate)
     */
    function emergencyUnpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
