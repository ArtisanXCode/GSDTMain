// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title GSDC Token Interface
/// @notice Defines functions that the MultiSigAdministrative contract interacts with.
interface IGSDC {
    function mint(address to, uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
    function burnBlacklisted(address from, uint256 amount) external;
    function pause() external;
    function unpause() external;
    function transferOwnership(address newOwner) external;
    function setBlacklistStatus(address account, bool status) external;
    function isBlacklisted(address account) external view returns (bool);
    function freeze(address account) external;
    function unfreeze(address account) external;
    function isFrozen(address account) external view returns (bool);
}

/**
 * @title MultiSig Administrative Contract for GSDC
 * @notice Handles sensitive administrative functions for the GSDC token using a multi-signature approval system.
 * @dev Features include queued transactions, cooldown enforcement, approval/rejection logic,
 * role-based access control, blacklist/freeze management, and emergency controls.
 */
contract MultiSigAdministrative is AccessControl, ReentrancyGuard, Pausable {
    // ---------------------
    // Role definitions
    // ---------------------
    /// @notice Role identifier for administrators
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @notice Role identifier for minters
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Role identifier for burners
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /// @notice Role identifier for pausers
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Role identifier for blacklist managers
    bytes32 public constant BLACKLIST_MANAGER_ROLE = keccak256("BLACKLIST_MANAGER_ROLE");

    /// @notice Role identifier for freeze managers
    bytes32 public constant FREEZE_MANAGER_ROLE = keccak256("FREEZE_MANAGER_ROLE");

    /// @notice Role identifier for transaction approvers
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    /// @notice Role identifier for contract upgraders
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @notice Cooldown period for queued transactions (90 minutes)
    uint256 public constant COOLDOWN_PERIOD = 90 minutes;

    /// @notice Number of distinct approvals required before execution
    uint8 public requiredApprovals = 2;

    /// @notice Reference to the GSDC token contract
    IGSDC public gsdcToken;

    // ---------------------
    // Transaction Structs and Enums
    // ---------------------

    /// @notice Types of transactions supported by this contract
    enum TransactionType {
        MINT,
        BURN,
        BURN_BLACKLISTED,
        TRANSFER_OWNERSHIP,
        BLACKLIST,
        FREEZE,
        UNFREEZE,
        ROLE_GRANT,
        ROLE_REVOKE,
        PAUSE_TOKEN,
        UNPAUSE_TOKEN,
        UPDATE_TOKEN_CONTRACT
    }

    /// @notice Status of a queued transaction
    enum TransactionStatus {
        PENDING,
        REJECTED,
        EXECUTED,
        AUTO_EXECUTED
    }

    /// @notice Represents details of a pending transaction
    struct PendingTransaction {
        uint256 id;                 ///< Unique transaction ID
        TransactionType txType;     ///< Type of transaction
        TransactionStatus status;   ///< Current status
        address initiator;          ///< Address that queued the transaction
        address target;             ///< Target address for the transaction
        uint256 amount;             ///< Amount involved, if applicable
        bytes data;                 ///< Encoded parameters for execution
        uint256 timestamp;          ///< Time when queued
        uint256 executeAfter;       ///< Earliest timestamp when executable
        string rejectionReason;     ///< Reason for rejection (if any)
        address approver;           ///< Address that rejected (if applicable)
        bool exists;                ///< Existence flag
    }

    // ---------------------
    // State Variables
    // ---------------------

    /// @notice Mapping of transaction ID to PendingTransaction details
    mapping(uint256 => PendingTransaction) public pendingTransactions;

    /// @notice Counter for the next transaction ID
    uint256 public nextTransactionId;

    /// @notice List of currently pending transaction IDs
    uint256[] public pendingTransactionIds;

    /// @dev Tracks index of transaction ID in pendingTransactionIds array (index + 1 for existence check)
    mapping(uint256 => uint256) private txIdIndex;

    /// @dev Count of approvals for each transaction
    mapping(uint256 => uint256) public approvalCount;

    /// @dev Tracks whether an approver has already approved a transaction
    mapping(uint256 => mapping(address => bool)) public hasApproved;

    // ---------------------
    // Events
    // ---------------------

    /// @notice Emitted when a transaction is queued
    event TransactionQueued(uint256 indexed txId, TransactionType indexed txType, address indexed initiator);

    /// @notice Emitted when a transaction is approved
    event TransactionApproved(uint256 indexed txId, address indexed approver);

    /// @notice Emitted when a transaction is rejected
    event TransactionRejected(uint256 indexed txId, address indexed approver, string reason);

    /// @notice Emitted when a transaction is executed
    event TransactionExecuted(uint256 indexed txId, bool autoExecuted);

    /// @notice Emitted when an address is blacklisted or removed from blacklist
    event AddressBlacklisted(address indexed account, bool status);

    /// @notice Emitted when the GSDC token contract reference is updated
    event TokenContractUpdated(address indexed newTokenContract);

    /// @notice Emitted when a pending transaction is removed
    event PendingTransactionRemoved(uint256 indexed txId);

    /// @notice Emitted when required approvals value is changed
    event RequiredApprovalsChanged(uint256 oldValue, uint256 newValue);

    // ---------------------
    // Custom Errors
    // ---------------------

    /// @custom:error InvalidAddress Thrown when zero address is provided
    error InvalidAddress();

    /// @custom:error Blacklisted Thrown when an action targets a blacklisted account
    error Blacklisted(address account);

    /// @custom:error NotBlacklisted Thrown when an account is not blacklisted but expected to be
    error NotBlacklisted(address account);

    /// @custom:error Frozen Thrown when an action targets a frozen account
    error Frozen(address account);

    /// @custom:error InsufficientPermissions Thrown when caller lacks proper role
    error InsufficientPermissions();

    /// @custom:error TransactionNotFound Thrown when transaction ID does not exist
    error TransactionNotFound(uint256 txId);

    /// @custom:error TransactionNotPending Thrown when a transaction is not in pending state
    error TransactionNotPending(uint256 txId);

    /// @custom:error CooldownNotExpired Thrown when attempting to execute before cooldown
    error CooldownNotExpired(uint256 txId, uint256 executeAfter);

    /// @custom:error ZeroAmount Thrown when provided amount is zero
    error ZeroAmount();

    /// @custom:error AlreadyFrozen Thrown when attempting to freeze an already frozen account
    error AlreadyFrozen(address account);

    /// @custom:error NotFrozen Thrown when attempting to unfreeze a non-frozen account
    error NotFrozen(address account);

    /// @custom:error CannotBlacklistAdmin Thrown when trying to blacklist an admin
    error CannotBlacklistAdmin();

    /// @custom:error CannotFreezeAdmin Thrown when trying to freeze an admin
    error CannotFreezeAdmin();

    /// @custom:error RejectionReasonRequired Thrown when no rejection reason is provided
    error RejectionReasonRequired();

    /// @custom:error InvalidApprovalRequirement Thrown when required approvals is set to zero
    error InvalidApprovalRequirement();

    /// @custom:error AlreadyApproved Thrown when approver attempts to approve again
    error AlreadyApproved(uint256 txId, address approver);

    // ---------------------
    // Constructor
    // ---------------------

    /**
     * @notice Deploys the MultiSigAdministrative contract
     * @param _gsdcToken Address of the GSDC token contract
     */
    constructor(address _gsdcToken) {
        if (_gsdcToken == address(0)) revert InvalidAddress();

        gsdcToken = IGSDC(_gsdcToken);

        // Grant all roles to deployer initially
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(BLACKLIST_MANAGER_ROLE, msg.sender);
        _grantRole(FREEZE_MANAGER_ROLE, msg.sender);
        _grantRole(APPROVER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        nextTransactionId = 1;        
    }

    // ---------------------
    // Modifiers
    // ---------------------

    /**
     * @notice Ensures the given address is not blacklisted or frozen
     * @param account Address to check
     */
    modifier notBlacklistedOrFrozen(address account) {
        if (gsdcToken.isBlacklisted(account)) revert Blacklisted(account);
        if (gsdcToken.isFrozen(account)) revert Frozen(account);
        _;
    }

    /**
     * @notice Ensures the caller has permission to approve/reject transactions
     */
    modifier canApprove() {
        // Allow either APPROVER_ROLE OR ADMIN_ROLE (if you want both, change to && and adjust docs)
        if (!(hasRole(APPROVER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender))) revert InsufficientPermissions();
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
        txIdIndex[txId] = pendingTransactionIds.length;
        emit TransactionQueued(txId, txType, msg.sender);
        return txId;
    }

    /**
     * @notice Removes a transaction from the pending list
     * @param txId ID of the transaction to remove
     */
    function _removePendingTransaction(uint256 txId) internal {
        uint256 indexPlusOne = txIdIndex[txId];
        if (indexPlusOne == 0) return; // not found

        uint256 index = indexPlusOne - 1;
        uint256 lastTxId = pendingTransactionIds[pendingTransactionIds.length - 1];

        // Swap with last element if not removing last
        if (index != pendingTransactionIds.length - 1) {
            pendingTransactionIds[index] = lastTxId;
            txIdIndex[lastTxId] = index + 1;
        }

        // Remove last
        pendingTransactionIds.pop();
        delete pendingTransactions[txId];
        delete txIdIndex[txId];

        emit PendingTransactionRemoved(txId);
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
        } else if (txn.txType == TransactionType.BURN_BLACKLISTED) {
            gsdcToken.burnBlacklisted(txn.target, txn.amount);
        } else if (txn.txType == TransactionType.BLACKLIST) {
            (address account, bool status) = abi.decode(txn.data, (address, bool));
            gsdcToken.setBlacklistStatus(account, status);
            emit AddressBlacklisted(account, status);
        } else if (txn.txType == TransactionType.FREEZE) {
            gsdcToken.freeze(txn.target);
        } else if (txn.txType == TransactionType.UNFREEZE) {
            gsdcToken.unfreeze(txn.target);
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
        } else if (txn.txType == TransactionType.UPDATE_TOKEN_CONTRACT) { 
            address newToken = abi.decode(txn.data, (address));         
            gsdcToken = IGSDC(newToken);         
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
    function approveTransaction(uint256 txId) external whenNotPaused canApprove {
        PendingTransaction storage txn = pendingTransactions[txId];        
        if (!txn.exists) revert TransactionNotFound(txId);
        if (txn.status != TransactionStatus.PENDING) revert TransactionNotPending(txId);        
        if (hasApproved[txId][msg.sender]) revert AlreadyApproved(txId, msg.sender);

        hasApproved[txId][msg.sender] = true;
        approvalCount[txId] += 1;

        emit TransactionApproved(txId, msg.sender);

        // Only execute if enough approvals
        if (approvalCount[txId] >= requiredApprovals && block.timestamp >= txn.executeAfter) {
            _executeTransaction(txId);
        }
    }

    function setRequiredApprovals(uint8 _required) external onlyRole(ADMIN_ROLE) {
        if (_required == 0) revert InvalidApprovalRequirement();
        emit RequiredApprovalsChanged(requiredApprovals, _required);
        requiredApprovals = _required;
    }

    /**
     * @notice Rejects a pending transaction
     * @param txId ID of the transaction
     * @param reason Reason for rejection
     */
    function rejectTransaction(uint256 txId, string memory reason) external canApprove nonReentrant {
        PendingTransaction storage txn = pendingTransactions[txId];
        if (!txn.exists) revert TransactionNotFound(txId);
        if (!(txn.status == TransactionStatus.PENDING)) revert TransactionNotPending(txId);        
        if(bytes(reason).length <= 0) revert RejectionReasonRequired();

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
    function executeTransaction(uint256 txId) external whenNotPaused nonReentrant {
        PendingTransaction storage txn = pendingTransactions[txId];
        if (!txn.exists) revert TransactionNotFound(txId);
        if (!(txn.status == TransactionStatus.PENDING && block.timestamp >= txn.executeAfter)) {
            revert CooldownNotExpired(txId, txn.executeAfter);
        }

        // Mark as auto-executed before performing the call
        txn.status = TransactionStatus.AUTO_EXECUTED;

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
        notBlacklistedOrFrozen(to)
    {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert ZeroAmount();
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
        notBlacklistedOrFrozen(from)
    {        
        if (from == address(0)) revert InvalidAddress();
        if (amount == 0) revert ZeroAmount();
        _queueTransaction(TransactionType.BURN, from, amount, "");
    }

    /**
     * @notice Burns GSDC tokens from any address, including blacklisted ones (queued with cooldown)
     * @dev This function bypasses blacklist checks and can burn tokens from any address.
     * Only callable by BURNER_ROLE or ADMIN_ROLE for emergency situations.
     * @param from Address to burn from (can be blacklisted)
     * @param amount Amount to burn
     */
    function destroyBlackFunds(address from, uint256 amount)
        external        
        nonReentrant
        onlyRole(BLACKLIST_MANAGER_ROLE)
    {                
        if (from == address(0)) revert InvalidAddress();
        if (!gsdcToken.isBlacklisted(from)) revert NotBlacklisted(from);
        if (amount == 0) revert ZeroAmount();
        _queueTransaction(TransactionType.BURN_BLACKLISTED, from, amount, "");
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
        if(hasRole(ADMIN_ROLE, account)) revert CannotBlacklistAdmin();

        bytes memory data = abi.encode(account, status);
        _queueTransaction(TransactionType.BLACKLIST, account, 0, data);
    }

    /**
     * @notice Queues a freeze operation
     * @param account Address to freeze
     */
    function freezeAddress(address account) external onlyRole(FREEZE_MANAGER_ROLE) {        
        if (account == address(0)) revert InvalidAddress();
        if(hasRole(ADMIN_ROLE, account)) revert CannotFreezeAdmin();
        if(gsdcToken.isFrozen(account)) revert AlreadyFrozen(account);


        _queueTransaction(TransactionType.FREEZE, account, 0, "");
    }

    /**
     * @notice Queues an unfreeze operation
     * @param account Address to unfreeze
     */
    function unfreezeAddress(address account) external onlyRole(FREEZE_MANAGER_ROLE) {
        if (account == address(0)) revert InvalidAddress();
        if(!gsdcToken.isFrozen(account)) revert NotFrozen(account);

        _queueTransaction(TransactionType.UNFREEZE, account, 0, "");
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
        if (newOwner == address(0)) revert InvalidAddress();
        _queueTransaction(TransactionType.TRANSFER_OWNERSHIP, newOwner, 0, "");
    }

    /**
     * @notice Updates the GSDC token contract address
     * @param newTokenContract Address of the new token contract
     */
    function updateTokenContract(address newTokenContract) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {        
        if (newTokenContract == address(0)) revert InvalidAddress();

        bytes memory data = abi.encode(newTokenContract);
        _queueTransaction(TransactionType.UPDATE_TOKEN_CONTRACT, newTokenContract, 0, data);
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
        return gsdcToken.isBlacklisted(account);
    }

    /**
     * @notice Checks if an address is frozen
     * @param account Address to check
     */
    function isFrozen(address account) external view returns (bool) {
        return gsdcToken.isFrozen(account);
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
     * @notice Pause token contract (paused with cooldown)
     */
    function pauseToken() external onlyRole(PAUSER_ROLE) {
        _queueTransaction(TransactionType.PAUSE_TOKEN, address(0), 0, "");
    }

    /**
     * @notice Unpause token contract (paused with cooldown)
     */
    function unpauseToken() external onlyRole(PAUSER_ROLE) {
        _queueTransaction(TransactionType.UNPAUSE_TOKEN, address(0), 0, "");
    }
}
