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

    /// @notice Minimum amount of tokens allowed for minting in one operation.
    uint256 public constant MIN_MINT_AMOUNT = 100 * 10**18; // 100 GSDC

    /// @notice Maximum amount of tokens allowed for minting in one operation.
    uint256 public constant MAX_MINT_AMOUNT = 1000000 * 10**18; // 1M GSDC

    /// @notice Mapping to track blacklisted addresses
    mapping(address => bool) public blacklisted;

    /// @notice Ensures the given address is not blacklisted
    /// @param account Address to check
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "GSDC: Address is blacklisted");
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
    function burn(uint256 amount) external whenNotPaused nonReentrant notBlacklisted(msg.sender) {
        require(balanceOf(msg.sender) >= amount, "GSDC: Insufficient balance");

        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }

    /**
     * @notice Burns tokens from another account.
     * @dev Only callable by the contract owner.
     * @param from Address whose tokens will be burned.
     * @param amount Number of tokens to burn.
     *
     * Emits a {Burn} event.
     */
    function burnFrom(address from, uint256 amount) 
        external 
        onlyOwner 
        whenNotPaused 
        nonReentrant 
        notBlacklisted(from)
    {
        require(balanceOf(from) >= amount, "GSDC: Insufficient balance");

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
     * @notice Returns the total supply of GSDC tokens.
     * @return The total number of tokens in existence.
     */
    function getTotalSupply() external view returns (uint256) {
        return totalSupply();
    }

    /**
     * @notice Returns metadata and supply info for the token.
     * @return name_ Token name.
     * @return symbol_ Token symbol.
     * @return decimals_ Token decimals.
     * @return totalSupply_ Current total supply.
     */
    function getTokenInfo() external view returns (string memory name_, string memory symbol_, uint8 decimals_, uint256 totalSupply_) {
        return (name(), symbol(), decimals(), totalSupply());
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
     * @dev Override transfer to check blacklist status
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
     * @dev Override transferFrom to check blacklist status
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
}
