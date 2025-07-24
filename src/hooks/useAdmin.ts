import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "./useWallet";
import { AdminRole, getUserRole } from "../services/admin";
import { checkSupabaseConnection } from "../lib/supabase";

export const useAdmin = () => {
  const { address, isConnected } = useWallet();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
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
        ) as AdminRole | null;
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
          setIsSuperAdmin(storedRole === AdminRole.SUPER_ADMIN);
          setIsRegularAdmin(storedRole === AdminRole.ADMIN);
          setIsModerator(storedRole === AdminRole.MODERATOR);
          setIsMinter(
            storedRole === AdminRole.MINTER ||
              storedRole === AdminRole.SUPER_ADMIN,
          );
          setIsBurner(
            storedRole === AdminRole.BURNER ||
              storedRole === AdminRole.SUPER_ADMIN,
          );
          setIsPauser(
            storedRole === AdminRole.PAUSER ||
              storedRole === AdminRole.SUPER_ADMIN,
          );
          setIsPriceUpdater(
            storedRole === AdminRole.PRICE_UPDATER ||
              storedRole === AdminRole.SUPER_ADMIN,
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
            setIsSuperAdmin(role === AdminRole.SUPER_ADMIN);
            setIsRegularAdmin(role === AdminRole.ADMIN);
            setIsModerator(role === AdminRole.MODERATOR);
            setIsMinter(
              role === AdminRole.MINTER || role === AdminRole.SUPER_ADMIN,
            );
            setIsBurner(
              role === AdminRole.BURNER || role === AdminRole.SUPER_ADMIN,
            );
            setIsPauser(
              role === AdminRole.PAUSER || role === AdminRole.SUPER_ADMIN,
            );
            setIsPriceUpdater(
              role === AdminRole.PRICE_UPDATER || role === AdminRole.SUPER_ADMIN,
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
              
              // Fallback to hardcoded admin addresses for testing
              if (
                address.toLowerCase() ===
                "0x1234567890123456789012345678901234567890".toLowerCase()
              ) {
                setIsAdmin(true);
                setAdminRole(AdminRole.SUPER_ADMIN);
                setIsSuperAdmin(true);
                localStorage.setItem("adminAuth", "true");
                localStorage.setItem("adminRole", AdminRole.SUPER_ADMIN);
                localStorage.setItem("adminAddress", address);
              }
              return; // Exit early to prevent further API calls
            }
            
            throw roleError; // Re-throw other errors
          }
        } else {
          // Fallback to hardcoded admin addresses for testing
          if (
            address.toLowerCase() ===
            "0x1234567890123456789012345678901234567890".toLowerCase()
          ) {
            setIsAdmin(true);
            setAdminRole(AdminRole.SUPER_ADMIN);
            setIsSuperAdmin(true);
            localStorage.setItem("adminAuth", "true");
            localStorage.setItem("adminRole", AdminRole.SUPER_ADMIN);
            localStorage.setItem("adminAddress", address);
          }
        }
      } catch (err: any) {
        console.error("Error checking roles:", err);
        setError(err.message || "Error checking roles");

        // Fallback to hardcoded admin addresses for testing
        if (
          address.toLowerCase() ===
          "0x1234567890123456789012345678901234567890".toLowerCase()
        ) {
          setIsAdmin(true);
          setAdminRole(AdminRole.SUPER_ADMIN);
          setIsSuperAdmin(true);
          localStorage.setItem("adminAuth", "true");
          localStorage.setItem("adminRole", AdminRole.SUPER_ADMIN);
          localStorage.setItem("adminAddress", address);
        }
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
