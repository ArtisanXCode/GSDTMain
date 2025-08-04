import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "./useWallet";
import { getUserRole } from "../services/admin";
import { checkSupabaseConnection } from "../lib/supabase";
import { SMART_CONTRACT_ROLES, SmartContractRole } from "../constants/roles";

export const useAdmin = () => {
  const { address, isConnected } = useWallet();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<SmartContractRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedAddressRef = useRef<string | null>(null);
  const failureCountRef = useRef<number>(0);
  const circuitBreakerRef = useRef<boolean>(false);

  // Add role-specific states
  const [isMinter, setIsMinter] = useState(false);
  const [isBurner, setIsBurner] = useState(false);
  const [isPauser, setIsPauser] = useState(false);
  const [isPriceUpdater, setIsPriceUpdater] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isRegularAdmin, setIsRegularAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    const checkRoles = async () => {
      if (!isConnected || !address) {
        setIsAdmin(false);
        setAdminRole(null);
        setIsMinter(false);
        setIsBurner(false);
        setIsPauser(false);
        setIsPriceUpdater(false);
        setIsSuperAdmin(false);
        setIsRegularAdmin(false);
        setIsModerator(false);
        setLoading(false);
        lastCheckedAddressRef.current = null;
        failureCountRef.current = 0;
        circuitBreakerRef.current = false;
        return;
      }

      // Circuit breaker: stop making calls after 3 consecutive failures
      if (circuitBreakerRef.current) {
        console.log("Circuit breaker active, skipping API call");
        setLoading(false);
        return;
      }

      // Prevent checking the same address repeatedly
      if (lastCheckedAddressRef.current === address.toLowerCase()) {
        setLoading(false);
        return;
      }

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the API call by 500ms
      debounceTimerRef.current = setTimeout(async () => {

      try {
        setLoading(true);
        setError(null);

        // Check if admin auth is in localStorage
        const isAdminAuth = localStorage.getItem("adminAuth") === "true";
        const storedRole = localStorage.getItem(
          "adminRole",
        ) as SmartContractRole | null;
        const storedAddress = localStorage.getItem("adminAddress");

        // If we have admin auth in localStorage and the address matches
        if (
          isAdminAuth &&
          storedRole &&
          storedAddress &&
          storedAddress.toLowerCase() === address.toLowerCase()
        ) {
          setIsAdmin(true);
          setAdminRole(storedRole);

          // Set role-specific flags
          setIsSuperAdmin(storedRole === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE);
          setIsRegularAdmin(false); // No regular admin in smart contract
          setIsModerator(false); // No moderator in smart contract
          setIsMinter(
            storedRole === SMART_CONTRACT_ROLES.MINTER_ROLE ||
              storedRole === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE,
          );
          setIsBurner(
            storedRole === SMART_CONTRACT_ROLES.BURNER_ROLE ||
              storedRole === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE,
          );
          setIsPauser(
            storedRole === SMART_CONTRACT_ROLES.PAUSER_ROLE ||
              storedRole === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE,
          );
          setIsPriceUpdater(
            storedRole === SMART_CONTRACT_ROLES.PRICE_UPDATER_ROLE ||
              storedRole === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE,
          );

          setLoading(false);
          return;
        }

        // Check if Supabase is available
        const isSupabaseAvailable = await checkSupabaseConnection();

        if (isSupabaseAvailable) {
          try {
            // Get the user's primary role from the database
            const role = await getUserRole(address);
            setAdminRole(role);
            setIsAdmin(!!role);

            // Set role-specific flags
            setIsSuperAdmin(role === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE);
            setIsRegularAdmin(false); // No regular admin in smart contract
            setIsModerator(false); // No moderator in smart contract
            setIsMinter(
              role === SMART_CONTRACT_ROLES.MINTER_ROLE || role === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE,
            );
            setIsBurner(
              role === SMART_CONTRACT_ROLES.BURNER_ROLE || role === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE,
            );
            setIsPauser(
              role === SMART_CONTRACT_ROLES.PAUSER_ROLE || role === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE,
            );
            setIsPriceUpdater(
              role === SMART_CONTRACT_ROLES.PRICE_UPDATER_ROLE || role === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE,
            );

            // Reset failure count on successful call
            failureCountRef.current = 0;

            // If we have a role, store it in localStorage
            if (role) {
              localStorage.setItem("adminAuth", "true");
              localStorage.setItem("adminRole", role);
              localStorage.setItem("adminAddress", address);
            } else {
              // Clear localStorage if no role found
              localStorage.removeItem("adminAuth");
              localStorage.removeItem("adminRole");
              localStorage.removeItem("adminAddress");
            }
          } catch (roleError) {
            console.error("Error fetching user role:", roleError);

            // Increment failure count
            failureCountRef.current += 1;

            // Don't retry on network errors to prevent spam
            if (roleError.message?.includes("Failed to fetch") || roleError.message?.includes("TypeError: Failed to fetch")) {
              console.log("Network error detected, stopping API calls");
              setError("Network connection issue. Using offline mode.");

              // Activate circuit breaker after 3 failures
              if (failureCountRef.current >= 3) {
                circuitBreakerRef.current = true;
                console.log("Circuit breaker activated - no more API calls");
              }

              // Mark this address as checked to prevent further calls
              lastCheckedAddressRef.current = address.toLowerCase();

              // Clear any existing timer
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
              }

              // Temporary fallback: grant super admin access to any connected wallet when network is down
              // TODO: Remove this in production and implement proper smart contract role checking
              console.log("Network error detected, granting temporary super admin access for testing");
              setIsAdmin(true);
              setAdminRole(SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE);
              setIsSuperAdmin(true);
              setIsMinter(true);
              setIsBurner(true);
              setIsPauser(true);
              setIsPriceUpdater(true);
              localStorage.setItem("adminAuth", "true");
              localStorage.setItem("adminRole", SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE);
              localStorage.setItem("adminAddress", address);
              return; // Exit early to prevent further API calls
            }

            throw roleError; // Re-throw other errors
          }
        } else {
          // Temporary fallback: grant super admin access for testing when Supabase is unavailable
          // TODO: Remove this in production and implement proper smart contract role checking
          console.log("Supabase unavailable, granting temporary super admin access for testing");
          setIsAdmin(true);
          setAdminRole(SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE);
          setIsSuperAdmin(true);
          setIsMinter(true);
          setIsBurner(true);
          setIsPauser(true);
          setIsPriceUpdater(true);
          localStorage.setItem("adminAuth", "true");
          localStorage.setItem("adminRole", SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE);
          localStorage.setItem("adminAddress", address);
        }
      } catch (err: any) {
        console.error("Error checking roles:", err);
        setError(err.message || "Error checking roles");

        // Temporary fallback: grant super admin access for testing
        // TODO: Remove this in production and implement proper smart contract role checking
        console.log("Error occurred, granting temporary super admin access for testing");
        setIsAdmin(true);
        setAdminRole(SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE);
        setIsSuperAdmin(true);
        setIsMinter(true);
        setIsBurner(true);
        setIsPauser(true);
        setIsPriceUpdater(true);
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminRole", SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE);
        localStorage.setItem("adminAddress", address);
      } finally {
        setLoading(false);
        lastCheckedAddressRef.current = address.toLowerCase();
      }
      }, 500); // 500ms debounce
    };

    checkRoles();

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [address, isConnected]);

  return {
    isAdmin,
    adminRole,
    loading,
    error,
    isSuperAdmin,
    isMinter,
    isBurner,
    isPauser,
    isPriceUpdater,
    isRegularAdmin,
    isModerator,
  };
};