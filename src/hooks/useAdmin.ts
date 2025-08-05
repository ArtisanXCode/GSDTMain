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

      // Circuit breaker: COMPLETELY stop making calls when active
      if (circuitBreakerRef.current) {
        console.log("Circuit breaker active, NO API calls allowed");
        setLoading(false);
        return; // EXIT EARLY - NO API CALLS
      }

      // Prevent checking the same address repeatedly
      if (lastCheckedAddressRef.current === address.toLowerCase()) {
        setLoading(false);
        return;
      }

      // Prevent multiple simultaneous calls for the same address
      if (lastCheckedAddressRef.current === address.toLowerCase()) {
        setLoading(false);
        return;
      }

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Execute API call immediately for better UX
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
          // Try to get role from database with timeout
          try {
            const role = await getUserRole(address);
            setAdminRole(role);

            // Set individual role flags based on the role
            setIsAdmin(!!role);
            setIsSuperAdmin(role === AdminRole.SUPER_ADMIN);
            setIsRegularAdmin(role === AdminRole.ADMIN);
            setIsModerator(role === AdminRole.MODERATOR);
            setIsMinter(role === AdminRole.MINTER_ROLE);
            setIsBurner(role === AdminRole.BURNER_ROLE);
            setIsPauser(role === AdminRole.PAUSER_ROLE);
            setIsPriceUpdater(role === AdminRole.PRICE_UPDATER_ROLE);

            // Reset failure count on success
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
          } catch (roleError: any) {
            console.error("Database error detected, PERMANENTLY activating circuit breaker");

            // IMMEDIATELY activate circuit breaker on ANY error
            circuitBreakerRef.current = true;
            setError("API calls disabled to prevent spam. Using offline mode.");

            // Mark this address as checked to prevent further calls
            lastCheckedAddressRef.current = address.toLowerCase();

            // Clear any existing timer
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
              debounceTimerRef.current = null;
            }
            return; // Exit early to prevent further API calls
          }
        }
      } catch (err: any) {
        console.error("FATAL ERROR: Permanently disabling API calls", err);        
        // PERMANENTLY activate circuit breaker on ANY error
        circuitBreakerRef.current = true;
        setError("API calls permanently disabled. Using offline mode.");
      } finally {
        setLoading(false);
        lastCheckedAddressRef.current = address.toLowerCase();
      }
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