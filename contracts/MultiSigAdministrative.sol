// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

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
 * @notice Handles all administrative functions for the GSDC token with cooldown periods and multi-signature approvals.
 * @dev Implements queued transactions, approval/rejection, and execution logic for sensitive operations.
 */
contract MultiSigAdministrative is AccessControl, ReentrancyGuard, Pausable {
    // ---------------------
    // Role definitions
    // ---------------------
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLIST_MANAGER_ROLE = keccak256("BLACKLIST_MANAGER_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    /// @notice Cooldown period for queued transactions (90 minutes)
    uint256 public constant COOLDOWN_PERIOD = 90 minutes;

    /// @notice Reference to the GSDC token contract
    IGSDC public gsdcToken;

    /// @notice Types of transactions handled by the queue
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

    /// @notice Status of a queued transaction
    enum TransactionStatus {
        PENDING,
        APPROVED,
        REJECTED,
        EXECUTED,
        AUTO_EXECUTED
    }

    /// @notice Structure representing a queued transaction
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

    /// @notice Structure for redemption requests
    struct RedemptionRequest {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool processed;
        bool approved;
    }

    // ---------------------
    // State variables
    // ---------------------
    mapping(address => bool) public blacklisted;
    mapping(uint256 => PendingTransaction) public pendingTransactions;
    uint256 public nextTransactionId;
    uint256[] public pendingTransactionIds;

    mapping(uint256 => RedemptionRequest) public redemptionRequests;
    uint256 public nextRedemptionId;

    // ---------------------
    // Events
    // ---------------------
    event TransactionQueued(uint256 indexed txId, TransactionType indexed txType, address indexed initiator);
    event TransactionApproved(uint256 indexed txId, address indexed approver);
    event TransactionRejected(uint256 indexed txId, address indexed approver, string reason);
    event TransactionExecuted(uint256 indexed txId, bool autoExecuted);
    event AddressBlacklisted(address indexed account, bool status);
    event TokenContractUpdated(address indexed newTokenContract);

    /**
     * @notice Deploys the MultiSigAdministrative contract
     * @param _gsdcToken The address of the GSDC token contract
     */
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

    // ---------------------
    // Modifiers
    // ---------------------

    /**
     * @notice Ensures the given address is not blacklisted
     * @param account Address to check
     */
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Address is blacklisted");
        _;
    }

    /**
     * @notice Ensures the caller has permission to approve/reject transactions
     */
    modifier canApprove() {
        require(
            hasRole(APPROVER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender),
            "Insufficient approval permissions"
        );
        _;
    }

    // ---------------------
    // Internal Helpers
    // ---------------------

    /**
     * @notice Queues a transaction for execution after cooldown
     * @param txType Type of transaction
     * @param target Target address for the transaction
     * @param amount Amount involved (if applicable)
     * @param data Encoded parameters for specific transaction types
     * @return txId ID of the queued transaction
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
     * @notice Removes a transaction from the pending list
     * @param txId ID of the transaction to remove
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
     * @notice Executes a queued transaction
     * @param txId ID of the transaction to execute
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

    // ---------------------
    // Transaction Approval
    // ---------------------

    /**
     * @notice Approves and executes a pending transaction
     * @param txId ID of the transaction
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
     * @notice Rejects a pending transaction
     * @param txId ID of the transaction
     * @param reason Reason for rejection
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
     * @notice Executes a transaction if cooldown expired or already approved
     * @param txId ID of the transaction
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

    // ---------------------
    // Token Management
    // ---------------------

    /**
     * @notice Mints GSDC tokens (queued with cooldown)
     * @param to Recipient address
     * @param amount Amount to mint
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
     * @notice Burns GSDC tokens (queued with cooldown)
     * @param from Address to burn from
     * @param amount Amount to burn
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
     * @notice Requests redemption of tokens
     * @param amount Amount to redeem
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
     * @notice Processes a redemption request
     * @param requestId ID of the redemption request
     * @param approved Whether the request is approved
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

    // ---------------------
    // Access Control & Blacklist
    // ---------------------

    /**
     * @notice Queues a blacklist/unblacklist operation
     * @param account Address to blacklist/unblacklist
     * @param status Blacklist status (true = blacklist, false = unblacklist)
     */
    function setBlacklistStatus(address account, bool status) external onlyRole(BLACKLIST_MANAGER_ROLE) {
        require(account != address(0), "Cannot blacklist zero address");
        require(!hasRole(ADMIN_ROLE, account), "Cannot blacklist admin");

        bytes memory data = abi.encode(account, status);
        _queueTransaction(TransactionType.BLACKLIST, account, 0, data);
    }

    /**
     * @notice Grants a role (queued with cooldown)
     * @param role Role identifier
     * @param account Address to grant role to
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
     * @notice Revokes a role (queued with cooldown)
     * @param role Role identifier
     * @param account Address to revoke role from
     */
    function revokeRole(bytes32 role, address account) 
        public 
        override(AccessControl) 
        onlyRole(getRoleAdmin(role)) 
    {
        bytes memory data = abi.encode(role, account);
        _queueTransaction(TransactionType.ROLE_REVOKE, account, 0, data);
    }

    // ---------------------
    // Token Contract Control
    // ---------------------

    /**
     * @notice Transfers ownership of the GSDC token contract
     * @param newOwner Address of the new owner
     */
    function transferTokenOwnership(address newOwner) external onlyRole(ADMIN_ROLE) {
        require(newOwner != address(0), "New owner is the zero address");
        _queueTransaction(TransactionType.TRANSFER_OWNERSHIP, newOwner, 0, "");
    }

    /**
     * @notice Updates the GSDC token contract address
     * @param newTokenContract Address of the new token contract
     */
    function updateTokenContract(address newTokenContract) external onlyRole(ADMIN_ROLE) {
        require(newTokenContract != address(0), "Invalid token contract address");
        gsdcToken = IGSDC(newTokenContract);
        emit TokenContractUpdated(newTokenContract);
    }

    // ---------------------
    // Views
    // ---------------------

    /**
     * @notice Returns list of all pending transaction IDs
     */
    function getPendingTransactionIds() external view returns (uint256[] memory) {
        return pendingTransactionIds;
    }

    /**
     * @notice Returns details of a pending transaction
     * @param txId Transaction ID
     */
    function getPendingTransaction(uint256 txId) external view returns (PendingTransaction memory) {
        return pendingTransactions[txId];
    }

    /**
     * @notice Checks if an address is blacklisted
     * @param account Address to check
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }

    // ---------------------
    // Emergency Controls
    // ---------------------

    /**
     * @notice Immediately pauses the contract
     */    
    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Immediately unpauses the contract
     */
    function emergencyUnpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
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
}
