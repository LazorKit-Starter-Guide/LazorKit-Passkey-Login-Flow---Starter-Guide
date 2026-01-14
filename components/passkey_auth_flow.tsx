"use client";

/**
 * Passkey Authentication Flow Component
 *
 * This component demonstrates the complete passkey-based authentication flow
 * using LazorKit. It provides a user-friendly interface for:
 *
 * 1. Initial State: Shows login button to start authentication
 * 2. Connecting State: Displays loading while user authenticates with passkey
 * 3. Connected State: Shows wallet address and logout option
 *
 * Key LazorKit Features Used:
 * - useWallet() hook: Provides wallet state and methods
 * - connect(): Initiates passkey authentication flow
 * - disconnect(): Clears wallet session and logs user out
 * - isConnected: Boolean indicating authentication status
 * - isConnecting: Boolean indicating connection in progress
 * - smartWalletPubkey: The user's smart wallet public key
 * - wallet: Full wallet object with additional properties
 *
 * How It Works:
 * When a user clicks "Continue with Passkey", the connect() method triggers
 * the browser's WebAuthn API, which prompts for device authentication (biometric
 * or PIN). On successful authentication, LazorKit automatically creates a smart
 * wallet if this is the first login, or retrieves the existing wallet for
 * returning users.
 */

import { useWallet } from "@lazorkit/wallet";
import { Card } from "@/components/ui/card";
import { Fingerprint, CheckCircle2, Loader2, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function PasskeyAuthFlow() {
  // Destructure wallet state and methods from LazorKit hook
  const {
    connect,              // Function to initiate passkey authentication
    disconnect,           // Function to log out and clear wallet session
    isConnected,          // Boolean: true when user is authenticated
    isConnecting,         // Boolean: true during authentication process
    wallet,               // Full wallet object with all properties
    smartWalletPubkey,    // Public key of the smart wallet (PublicKey object)
  } = useWallet();

  // Local state to track UI flow stages
  // "idle" -> "connecting" -> "connected"
  const [loginStep, setLoginStep] = useState<
    "idle" | "connecting" | "connected"
  >("idle");

  // State to hold stored wallet data from session
  const [storedWallet, setStoredWallet] = useState<{
    smartWallet?: string;
    smartWalletPubkey?: string;
  } | null>(null);

  // Load stored wallet from session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('wallet');
    if (stored) {
      setStoredWallet(JSON.parse(stored));
    }
  }, []);

  // Store wallet in session when connected
  useEffect(() => {
    if (isConnected && wallet) {
      const walletData = {
        smartWallet: wallet.smartWallet,
        smartWalletPubkey: smartWalletPubkey?.toString()
      };
      sessionStorage.setItem('wallet', JSON.stringify(walletData));
      setStoredWallet(walletData);
    }
  }, [isConnected, wallet, smartWalletPubkey]);

  // Sync local login step with wallet connection status
  // This ensures UI state matches the actual wallet state
  useEffect(() => {
    if (isConnected || storedWallet) {
      setLoginStep("connected");
    } else {
      setLoginStep("idle");
    }
  }, [isConnected, storedWallet]);


  /**
   * Handles the login/authentication process
   *
   * When called, it:
   * 1. Checks if session wallet exists, if so, shows connected
   * 2. Otherwise, sets UI to "connecting" state (shows loading)
   * 3. Calls connect() which triggers passkey prompt
   * 4. On success, useEffect will update to "connected"
   * 5. On error, resets to "idle" state
   */
  const handleLogin = async () => {
    if (storedWallet) {
      // If session wallet exists, show connected state
      setLoginStep("connected");
      return;
    }
    setLoginStep("connecting");
    try {
      await connect(); // This triggers the browser's passkey prompt
    } catch (error) {
      console.error("Login error:", error);
      setLoginStep("idle"); // Reset on error
    }
  };


  /**
   * Handles logout/disconnect process
   *
   * Clears the wallet session and resets UI to initial state
   */
  const handleLogout = async () => {
    await disconnect(); // Clears wallet state and session
    setLoginStep("idle");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header Section */}
      {/* Displays project title and description */}
      <div className="text-center space-y-4 mt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium">
          <Fingerprint className="w-4 h-4" />
          <span>Passkey Login Example</span>
        </div>
        <h1 className="text-4xl font-bold">Simple Authentication Flow</h1>
        <p className="text-muted-foreground text-lg">
          This example demonstrates how to implement passkey-based
          authentication with automatic smart wallet creation.
        </p>
      </div>

      {/* Main Authentication Card */}
      {/* Contains the three states: idle, connecting, connected */}
      <Card className="p-8">
        {/* Initial State: User sees login button */}
        {loginStep === "idle" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Fingerprint className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Get Started</h2>
              <p className="text-muted-foreground">
                Click the button below to authenticate with your device passkey.
                A smart wallet will be created automatically.
              </p>
            </div>
            <Button
              onClick={handleLogin}
              disabled={isConnecting}
              className="h-12 px-8 text-base"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 mr-2" />
                  Continue with Passkey
                </>
              )}
            </Button>
          </div>
        )}

        {/* Connecting State: Shows loading while user authenticates */}
        {loginStep === "connecting" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Authenticating...</h2>
              <p className="text-muted-foreground">
                Please approve the passkey prompt on your device.
              </p>
            </div>
          </div>
        )}

        {/* Connected State: Shows wallet address and logout option */}
        {loginStep === "connected" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Successfully Authenticated!
              </h2>
              <p className="text-muted-foreground">
                Your smart wallet has been created and you're ready to use
                Solana.
              </p>
            </div>

            {/* Wallet Information Display */}
            <div className="space-y-4 p-6 bg-secondary rounded-lg">
              <div>
                <label className="text-sm text-muted-foreground">
                  Smart Wallet Address
                </label>
                {/* Display wallet address - use stored wallet if available, fallback to current wallet */}
                <div className="mt-1 p-3 bg-background rounded-md border border-border">
                  <code className="text-sm font-mono break-all">
                    {storedWallet?.smartWallet ||
                      wallet?.smartWallet ||
                      smartWalletPubkey?.toString() ||
                      "Loading..."}
                  </code>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <Button onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
