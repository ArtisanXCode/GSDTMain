// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./MultiSigAdministrative.sol";

/**
 * @title GSDC Stablecoin
 * @notice Upgradeable implementation of the Global South Digital Currency (GSDC).
 * @dev Based on ERC20 with pausing, minting, burning, blacklist, and freezing features.
 * Access is controlled by `AccessControlUpgradeable` roles rather than a single owner.
 */
contract GSDC is 
    IGSDC,
    Initializable,
    ERC20PausableUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    AccessControlUpgradeable
{
    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted when new tokens are minted.
    /// @param to Address receiving the minted tokens.
    /// @param amount Amount of tokens minted.
    event Mint(address indexed to, uint256 amount);

    /// @notice Emitted when tokens are burned.
    /// @param from Address whose tokens were burned.
    /// @param amount Amount of tokens burned.
    event Burn(address indexed from, uint256 amount);

    /// @notice Emitted when an address is blacklisted or unblacklisted.
    /// @param account The target address.
    /// @param status `true` if blacklisted, `false` otherwise.
    event AddressBlacklisted(address indexed account, bool status);

    /// @notice Emitted when an address is frozen or unfrozen.
    /// @param account The target address.
    /// @param status `true` if frozen, `false` otherwise.
    event AddressFrozen(address indexed account, bool status);

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    /// @notice Minimum amount of tokens that can be minted in a single call.
    uint256 public constant MIN_MINT_AMOUNT = 100 * 10**18;

    /// @notice Maximum amount of tokens that can be minted in a single call.
    uint256 public constant MAX_MINT_AMOUNT = 1_000_000 * 10**18;

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    /// @notice Tracks blacklisted addresses.
    mapping(address => bool) private blacklisted;

    /// @notice Tracks frozen addresses.
    mapping(address => bool) private frozen;

    // -------------------------------------------------------------------------
    // Roles
    // -------------------------------------------------------------------------

    /// @notice Role identifier for upgrade authorization.
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    /// @notice Role identifier for minting new tokens.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @notice Role identifier for blacklist management.
    bytes32 public constant BLACKLIST_MANAGER_ROLE = keccak256("BLACKLIST_MANAGER_ROLE");
    /// @notice Role identifier for freezing/unfreezing accounts.
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");
    /// @notice Role identifier for pausing/unpausing the contract.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");    

    // -------------------------------------------------------------------------
    // Custom Errors
    // -------------------------------------------------------------------------
    error BlacklistedAddress(address account);
    error FrozenAddress(address account);
    error MintToZeroAddress();
    error AmountBelowMinimum(uint256 amount, uint256 min);
    error AmountAboveMaximum(uint256 amount, uint256 max);
    error InsufficientBalance(address account, uint256 balance, uint256 required);
    error InsufficientAllowance(address from, address spender, uint256 allowance, uint256 required);
    error NotBlacklisted(address account);
    error ZeroAddressNotAllowed();
    error CannotBlacklistOwner();
    error AlreadyFrozen(address account);
    error NotFrozen(address account);
    error SenderBlacklisted(address sender);
    error RecipientBlacklisted(address recipient);
    error SenderFrozen(address sender);
    error RecipientFrozen(address recipient);
    error DecreasedAllowanceBelowZero(); 

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    /**
     * @notice Ensures an account is not blacklisted or frozen.
     * @param account Address being validated.
     */
    modifier notBlacklistedOrFrozen(address account) {
        if (blacklisted[account]) revert BlacklistedAddress(account);
        if (frozen[account]) revert FrozenAddress(account);
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // -------------------------------------------------------------------------
    // Initialization & Upgrades
    // -------------------------------------------------------------------------

    /**
     * @notice Initializes the GSDC contract.
     * @dev Grants all roles to the admin initially. Can only be called once.
     * @param admin Address that will be the default admin and initial role holder.
     * @param upgrader Address that will be allowed to upgrade the contract.
     */
    function initialize(address admin, address upgrader) external initializer {
        __ERC20_init("Global South Digital Currency", "GSDC");
        __ERC20Pausable_init();
        __Ownable_init(admin);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        __AccessControl_init();

        // Assign roles        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, upgrader);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BLACKLIST_MANAGER_ROLE, admin);
        _grantRole(FREEZER_ROLE, admin);
    }

    /**
     * @notice Restricts upgrades to addresses with `UPGRADER_ROLE`.
     * @dev Used by UUPS proxy mechanism.
     * @param newImplementation Address of new implementation.
     */
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyRole(UPGRADER_ROLE)
    {}

    /**
     * @inheritdoc IGSDC
     */
    function transferOwnership(address newOwner) 
        public 
        override(OwnableUpgradeable, IGSDC) 
    {
        super.transferOwnership(newOwner);
    }

    // -------------------------------------------------------------------------
    // Minting & Burning
    // -------------------------------------------------------------------------

    /**
     * @notice Mints new tokens to a specified address.
     * @dev Only callable by accounts with `MINTER_ROLE`. 
     * Reverts if `amount` is outside min/max bounds.
     * @param to Recipient address.
     * @param amount Amount of tokens to mint.
     *
     * Emits a {Mint} event.
     */
    function mint(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        nonReentrant        
    {
        if (to == address(0)) revert MintToZeroAddress();
        if (amount < MIN_MINT_AMOUNT) revert AmountBelowMinimum(amount, MIN_MINT_AMOUNT);
        if (amount > MAX_MINT_AMOUNT) revert AmountAboveMaximum(amount, MAX_MINT_AMOUNT);

        _mint(to, amount);
        emit Mint(to, amount);
    }

    /**
     * @notice Burns tokens from the caller's balance.
     * @param amount Amount of tokens to burn.
     *
     * Emits a {Burn} event.
     */
    function burn(uint256 amount) external whenNotPaused nonReentrant {
        uint256 bal = balanceOf(msg.sender);
        if (bal < amount) revert InsufficientBalance(msg.sender, bal, amount);
        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }

    /**
     * @notice Burns tokens from another account using allowance.
     * @dev Caller must have allowance from `from`.
     * @param from Address whose tokens will be burned.
     * @param amount Amount of tokens to burn.
     *
     * Emits a {Burn} event.
     */
    function burnFrom(address from, uint256 amount)
        external
        whenNotPaused
        nonReentrant
    {
        uint256 bal = balanceOf(from);
        if (bal < amount) revert InsufficientBalance(from, bal, amount);
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        emit Burn(from, amount);
    }

    /**
     * @inheritdoc IGSDC
     */
    function burnBlacklisted(address from, uint256 amount) 
        external 
        override 
        onlyRole(BLACKLIST_MANAGER_ROLE) 
    {        
        if (!blacklisted[from]) revert NotBlacklisted(from);
        _burn(from, amount);
        emit Burn(from, amount);
    }

    // -------------------------------------------------------------------------
    // Pausing
    // -------------------------------------------------------------------------

    /**
     * @notice Pauses transfers, minting, and burning.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses transfers, minting, and burning.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // -------------------------------------------------------------------------
    // Blacklist
    // -------------------------------------------------------------------------

    /**
     * @notice Updates blacklist status of an address.
     * @param account Target address.
     * @param status `true` to blacklist, `false` to unblacklist.
     */
    function setBlacklistStatus(address account, bool status) 
        external 
        onlyRole(BLACKLIST_MANAGER_ROLE)
    {
        if (account == address(0)) revert ZeroAddressNotAllowed();
        if (account == owner()) revert CannotBlacklistOwner();

        if (blacklisted[account] != status) {
            blacklisted[account] = status;
            emit AddressBlacklisted(account, status);
        }
    }

    /**
     * @notice Checks blacklist status.
     * @param account Address to check.
     * @return `true` if blacklisted.
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }

    // -------------------------------------------------------------------------
    // Freezing
    // -------------------------------------------------------------------------

    /**
     * @notice Freezes an account, blocking all transfers.
     * @param account Address to freeze.
     */
    function freeze(address account) 
        external
        onlyRole(FREEZER_ROLE) 
    {
        if (account == address(0)) revert ZeroAddressNotAllowed();
        if (account == owner()) revert CannotBlacklistOwner();
        if (frozen[account]) revert AlreadyFrozen(account);

        frozen[account] = true;
        emit AddressFrozen(account, true);
    }

    /**
     * @inheritdoc IGSDC
     */
    function unfreeze(address account) 
        external 
        override 
        onlyRole(FREEZER_ROLE) 
    {
        if (account == address(0)) revert ZeroAddressNotAllowed();
        if (!frozen[account]) revert NotFrozen(account);

        frozen[account] = false;
        emit AddressFrozen(account, false);
    }

    /**
     * @inheritdoc IGSDC
     */
    function isFrozen(address account) 
        external 
        view 
        override 
        returns (bool) 
    {
        return frozen[account];
    }

    // -------------------------------------------------------------------------
    // ERC20 Overrides
    // -------------------------------------------------------------------------

    /**
     * @notice Approves spender to spend tokens on behalf of caller.
     * @dev Reverts if caller or spender is blacklisted/frozen.
     */
    function approve(address spender, uint256 amount)
        public
        override
        notBlacklistedOrFrozen(msg.sender)
        notBlacklistedOrFrozen(spender)
        returns (bool)
    {
        _approve(msg.sender, spender, amount);
        return true;
    }

    /**
     * @notice Increases spender’s allowance.
     * @dev Reverts if caller or spender is blacklisted/frozen.
     */
    function increaseAllowance(address spender, uint256 addedValue)
        public
        notBlacklistedOrFrozen(msg.sender)
        notBlacklistedOrFrozen(spender)
        returns (bool)
    {
        _approve(
            msg.sender,
            spender,
            allowance(msg.sender, spender) + addedValue
        );
        return true;
    }

    /**
     * @notice Decreases spender’s allowance.
     * @dev Allowed even if spender is blacklisted/frozen.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        returns (bool)
    {
        uint256 currentAllowance = allowance(msg.sender, spender);
        if (currentAllowance < subtractedValue) revert DecreasedAllowanceBelowZero();
        unchecked {
            _approve(msg.sender, spender, currentAllowance - subtractedValue);
        }
        return true;
    }

    /**
     * @inheritdoc ERC20Upgradeable
     */
    function transfer(address to, uint256 amount) 
        public 
        override         
        returns (bool) 
    {
        return super.transfer(to, amount);
    }

    /**
     * @inheritdoc ERC20Upgradeable
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override         
        returns (bool) 
    {
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Internal hook overriding OpenZeppelin to enforce blacklist/freeze rules.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20PausableUpgradeable) {

        // If spender != from (transferFrom case), check spender
        if (from != msg.sender && msg.sender != address(0)) {
            if (blacklisted[msg.sender]) revert SenderBlacklisted(msg.sender);
            if (frozen[msg.sender]) revert SenderFrozen(msg.sender);
        }

        if (from != address(0)) {
            if (blacklisted[from]) revert SenderBlacklisted(from);
            if (frozen[from]) revert SenderFrozen(from);
        }
        if (to != address(0)) {
            if (blacklisted[to]) revert RecipientBlacklisted(to);
            if (frozen[to]) revert RecipientFrozen(to);
        }
        super._update(from, to, value);
    }

    // Storage gap for upgrade safety
    uint256[50] private __gap;
}
