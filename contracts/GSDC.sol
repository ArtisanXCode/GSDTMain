// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title GSDC Stablecoin - Simplified Version
 * @notice Implementation of the Global South Digital Currency (GSDC) stablecoin.
 * @dev Upgradeable ERC20 token with pausable, mint, and burn capabilities controlled by the contract owner.
 * Uses OpenZeppelin's upgradeable contract modules.
 */
contract GSDC is 
    Initializable,
    ERC20PausableUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable 
{
    /// @notice Emitted when new tokens are minted.
    /// @param to The address receiving the minted tokens.
    /// @param amount The amount of tokens minted.
    event Mint(address indexed to, uint256 amount);

    /// @notice Emitted when tokens are burned.
    /// @param from The address from which tokens were burned.
    /// @param amount The amount of tokens burned.
    event Burn(address indexed from, uint256 amount);

    /// @notice Emitted when an address is blacklisted or unblacklisted.
    /// @param account The address that was blacklisted/unblacklisted.
    /// @param status The new blacklist status.
    event AddressBlacklisted(address indexed account, bool status);

    /// @notice Emitted when an address is frozen or unfrozen.
    /// @param account The address that was frozen/unfrozen.
    /// @param status The new frozen status.
    event AddressFrozen(address indexed account, bool status);

    /// @notice Emitted when contract is deprecated
    /// @param newAddress Address of the new contract
    event Deprecate(address indexed newAddress);

    /// @notice Ensures contract is not deprecated
    modifier whenNotDeprecated() {
        require(!deprecated, "GSDC: Contract is deprecated");
        _;
    }

    /// @notice Minimum amount of tokens allowed for minting in one operation.
    uint256 public constant MIN_MINT_AMOUNT = 100 * 10**18; // 100 GSDC

    /// @notice Maximum amount of tokens allowed for minting in one operation.
    uint256 public constant MAX_MINT_AMOUNT = 1000000 * 10**18; // 1M GSDC

    /// @notice Mapping to track blacklisted addresses
    mapping(address => bool) public blacklisted;

    /// @notice Mapping to track frozen addresses
    mapping(address => bool) public frozen;

    /// @notice Contract deprecation status
    bool public deprecated;
    
    /// @notice Address of the upgraded contract (if deprecated)
    address public upgradedAddress;

    /// @notice Ensures the given address is not blacklisted
    /// @param account Address to check
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "GSDC: Address is blacklisted");
        _;
    }

    /// @notice Ensures the given address is not frozen
    /// @param account Address to check
    modifier notFrozen(address account) {
        require(!frozen[account], "GSDC: Address is frozen");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the GSDC contract.
     * @dev Sets up ERC20 parameters, pausable state, ownership, reentrancy guard, and UUPS upgradeability.
     * Can only be called once.
     * @param initialOwner Address that will become the owner of the contract.
     */
    function initialize(address initialOwner) external initializer {
        __ERC20_init("Global South Digital Currency", "GSDC");
        __ERC20Pausable_init();
        __Ownable_init(initialOwner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
    }

    /**
     * @dev Authorizes an upgrade of the contract implementation.
     * @param newImplementation Address of the new contract implementation.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @notice Mints new tokens to a specified address.
     * @dev Only callable by the contract owner. Enforces min and max mint limits.
     * @param to Address to receive minted tokens.
     * @param amount Number of tokens to mint (must be between MIN_MINT_AMOUNT and MAX_MINT_AMOUNT).
     *
     * Emits a {Mint} event.
     */
    function mint(address to, uint256 amount) 
        external 
        onlyOwner 
        whenNotPaused 
        nonReentrant 
        notBlacklisted(to)
        notFrozen(to)
    {
        require(to != address(0), "GSDC: Mint to the zero address");
        require(amount >= MIN_MINT_AMOUNT, "GSDC: Amount below minimum");
        require(amount <= MAX_MINT_AMOUNT, "GSDC: Amount above maximum");

        _mint(to, amount);
        emit Mint(to, amount);
    }

    /**
     * @notice Burns tokens from the caller's balance.
     * @dev Caller must have at least the specified amount of tokens.
     * @param amount Number of tokens to burn.
     *
     * Emits a {Burn} event.
     */
    function burn(uint256 amount) external whenNotPaused nonReentrant notBlacklisted(msg.sender) notFrozen(msg.sender) {
        require(balanceOf(msg.sender) >= amount, "GSDC: Insufficient balance");

        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }

    /**
     * @notice Issue tokens (similar to USDT pattern)
     * @dev Only callable by owner, alias for mint function
     * @param amount Number of tokens to issue
     */
    function issue(uint256 amount) 
        external 
        onlyOwner 
        whenNotPaused 
        whenNotDeprecated
        nonReentrant 
    {
        require(amount >= MIN_MINT_AMOUNT, "GSDC: Amount below minimum");
        require(amount <= MAX_MINT_AMOUNT, "GSDC: Amount above maximum");

        _mint(owner(), amount);
        emit Mint(owner(), amount);
    }

    /**
     * @notice Redeem tokens (similar to USDT pattern)
     * @dev Only callable by owner, burns tokens from owner's balance
     * @param amount Number of tokens to redeem
     */
    function redeem(uint256 amount) 
        external 
        onlyOwner 
        whenNotPaused 
        whenNotDeprecated
        nonReentrant 
    {
        require(balanceOf(owner()) >= amount, "GSDC: Insufficient balance");

        _burn(owner(), amount);
        emit Burn(owner(), amount);
    }

    /**
     * @notice Burns tokens from another account using allowance.
     * @dev Caller must have sufficient allowance from the token holder.
     * @param from Address whose tokens will be burned.
     * @param amount Number of tokens to burn.
     *
     * Emits a {Burn} event.
     */
    function burnFrom(address from, uint256 amount) 
        external         
        whenNotPaused 
        nonReentrant 
        notBlacklisted(from)
        notFrozen(from)
    {
        require(balanceOf(from) >= amount, "GSDC: Insufficient balance");

        uint256 currentAllowance = allowance(from, msg.sender);
        require(currentAllowance >= amount, "GSDC: Insufficient allowance");

        _approve(from, msg.sender, currentAllowance - amount);
        _burn(from, amount);
        emit Burn(from, amount);
    }

    /**
     * @notice Burns tokens from any address, including blacklisted addresses.
     * @dev Only callable by the contract owner. This function bypasses blacklist checks
     * and is intended for emergency situations where tokens need to be burned from 
     * blacklisted or compromised addresses.
     * @param from Address whose tokens will be burned.
     * @param amount Number of tokens to burn.
     *
     * Emits a {Burn} event.
     */
    function burnBlacklisted(address from, uint256 amount) 
        external 
        onlyOwner 
        whenNotPaused 
        nonReentrant 
    {
        require(from != address(0), "GSDC: Burn from the zero address");
        require(balanceOf(from) >= amount, "GSDC: Insufficient balance");

        _burn(from, amount);
        emit Burn(from, amount);
    }

    /**
     * @notice Pauses all token transfers, minting, and burning.
     * @dev Only callable by the contract owner.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses all token transfers, minting, and burning.
     * @dev Only callable by the contract owner.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Sets the blacklist status for an address.
     * @dev Only callable by the contract owner.
     * @param account Address to blacklist/unblacklist.
     * @param status True to blacklist, false to unblacklist.
     */
    function setBlacklistStatus(address account, bool status) external onlyOwner {
        require(account != address(0), "GSDC: Cannot blacklist zero address");
        require(account != owner(), "GSDC: Cannot blacklist owner");

        blacklisted[account] = status;
        emit AddressBlacklisted(account, status);
    }

    /**
     * @notice Checks if an address is blacklisted.
     * @param account Address to check.
     * @return True if the address is blacklisted, false otherwise.
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }

    /**
     * @notice Freezes an address, preventing all token operations.
     * @dev Only callable by the contract owner.
     * @param account Address to freeze.
     */
    function freeze(address account) external onlyOwner {
        require(account != address(0), "GSDC: Cannot freeze zero address");
        require(account != owner(), "GSDC: Cannot freeze owner");
        require(!frozen[account], "GSDC: Address already frozen");

        frozen[account] = true;
        emit AddressFrozen(account, true);
    }

    /**
     * @notice Unfreezes an address, allowing token operations again.
     * @dev Only callable by the contract owner.
     * @param account Address to unfreeze.
     */
    function unfreeze(address account) external onlyOwner {
        require(account != address(0), "GSDC: Cannot unfreeze zero address");
        require(frozen[account], "GSDC: Address not frozen");

        frozen[account] = false;
        emit AddressFrozen(account, false);
    }

    /**
     * @notice Destroy blacklisted funds (emergency function)
     * @dev Similar to USDT's destroyBlackFunds
     * @param account Blacklisted account to destroy funds from
     */
    function destroyBlacklistedFunds(address account) 
        external 
        onlyOwner 
        whenNotPaused 
        nonReentrant 
    {
        require(blacklisted[account], "GSDC: Account not blacklisted");
        uint256 balance = balanceOf(account);
        require(balance > 0, "GSDC: No balance to destroy");

        _burn(account, balance);
        emit Burn(account, balance);
    }

    /**
     * @notice Add multiple addresses to blacklist
     * @dev Batch operation for efficiency
     * @param accounts Array of addresses to blacklist
     */
    function addBlacklistBatch(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            require(account != address(0), "GSDC: Cannot blacklist zero address");
            require(account != owner(), "GSDC: Cannot blacklist owner");
            
            if (!blacklisted[account]) {
                blacklisted[account] = true;
                emit AddressBlacklisted(account, true);
            }
        }
    }

    /**
     * @notice Get contract parameters
     * @dev Similar to USDT's getters
     */
    function getParameters() external view returns (
        uint256 minMintAmount,
        uint256 maxMintAmount,
        bool contractPaused,
        bool contractDeprecated,
        address upgradeAddress
    ) {
        return (
            MIN_MINT_AMOUNT,
            MAX_MINT_AMOUNT,
            paused(),
            deprecated,
            upgradedAddress
        );
    }

    /**
     * @dev Override transfer to check blacklist and frozen status
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        whenNotDeprecated
        notBlacklisted(msg.sender) 
        notBlacklisted(to)
        notFrozen(msg.sender)
        notFrozen(to)
        returns (bool) 
    {
        return super.transfer(to, amount);
    }

    /**
     * @dev Override transferFrom to check blacklist and frozen status
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        whenNotDeprecated
        notBlacklisted(from) 
        notBlacklisted(to)
        notFrozen(from)
        notFrozen(to)
        returns (bool) 
    {
        return super.transferFrom(from, to, amount);
    }

    /**
     * @notice Deprecate current contract in favor of new one
     * @dev Only callable by owner
     * @param _upgradedAddress Address of the new contract
     */
    function deprecate(address _upgradedAddress) external onlyOwner {
        require(_upgradedAddress != address(0), "GSDC: Invalid address");
        require(!deprecated, "GSDC: Already deprecated");
        
        deprecated = true;
        upgradedAddress = _upgradedAddress;
        emit Deprecate(_upgradedAddress);
    }

    /**
     * @notice Get total supply (works even when deprecated)
     */
    function totalSupply() public view override returns (uint256) {
        if (deprecated && upgradedAddress != address(0)) {
            return IERC20(upgradedAddress).totalSupply();
        }
        return super.totalSupply();
    }

    /**
     * @notice Get balance (works even when deprecated)
     */
    function balanceOf(address account) public view override returns (uint256) {
        if (deprecated && upgradedAddress != address(0)) {
            return IERC20(upgradedAddress).balanceOf(account);
        }
        return super.balanceOf(account);
    }
}
