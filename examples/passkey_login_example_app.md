# LazorKit Passkey Wallet Tutorial

## 🎯 What We're Building
A Next.js application that lets users log in using **passkeys** (biometrics like fingerprint/face ID) instead of passwords. When they authenticate, a Solana smart wallet gets automatically created for them.

## 📁 File Structure Overview

```
your-project/
├── app/
│   ├── layout.tsx      # Root layout with fonts & Buffer setup
│   └── page.tsx        # Main page that provides wallet context
└── components/
    └── passkey_auth_flow.tsx  # The actual login/logout UI
```

Let's break down each file, line by line:

## 📄 File 1: `app/layout.tsx` - The Foundation

This file sets up the **base structure** of your Next.js app. Think of it as the "frame" around your entire application.

```typescript
// These imports bring in Next.js tools for page metadata and fonts
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Load the Geist Sans font (modern, clean sans-serif font)
const geistSans = Geist({
  variable: "--font-geist-sans",  // CSS variable name for this font
  subsets: ["latin"],              // Only load Latin characters (smaller file)
});

// Load the Geist Mono font (programming/terminal style font)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🔧 CRITICAL POLYFILL - DON'T SKIP THIS!
// Solana libraries expect Node.js's "Buffer" object, but browsers don't have it
// This code adds Buffer to the browser environment
if (typeof window !== 'undefined') {        // Only run in browser, not server
    window.Buffer = window.Buffer || require('buffer').Buffer;  // Add Buffer if missing
}

// Metadata for search engines and browser tabs
export const metadata: Metadata = {
  title: "Lazorkit Passkey Auth Flow",
  description: "A simple example of passkey-based authentication using LazorKit on Solana.",
};

// The main layout component - wraps EVERY page in your app
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Dark mode enabled by default
    <html lang="en" className="dark">
      <body
        // Apply both fonts to the entire body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}  {/* This is where your page content gets inserted */}
      </body>
    </html>
  );
}
```

**Key Points:**
- `layout.tsx` runs once, `page.tsx` runs for each page
- The Buffer polyfill is **essential** - without it, Solana libraries break
- Fonts are loaded here so they're available everywhere

## 📄 File 2: `app/page.tsx` - The Wallet Provider

This is your **main page**. It wraps everything with `LazorkitProvider`, which makes the wallet available to all child components.
Replace everything in it with the code below:

```typescript
// "use client" tells Next.js this is a Client Component (runs in browser)
// It's needed because LazorKit interacts with browser APIs
"use client";

// Import the provider (gives wallet access) and our custom UI component
import { LazorkitProvider } from "@lazorkit/wallet";
import { PasskeyAuthFlow } from "../components/passkey_auth_flow";

// 🛠️ CONFIGURATION OBJECT
// These settings tell LazorKit how to connect
const CONFIG = {
  rpcUrl: "https://api.devnet.solana.com",      // Connect to Solana devnet (test network)
  portalUrl: "https://portal.lazor.sh",         // LazorKit's authentication service
  paymasterConfig: {
    paymasterUrl: "https://kora.devnet.lazorkit.com",  // Optional: pays gas fees for users
  },
};

// The main page component
export default function Page() {
  return (
    // Wrap everything in LazorkitProvider - this is like passing down wallet access
    <LazorkitProvider {...CONFIG}>
      {/* Inside here, any component can access the wallet */}
      <PasskeyAuthFlow />
    </LazorkitProvider>
  );
}
```

**Key Points:**
- `"use client"` is required because we're using browser APIs
- `LazorkitProvider` is a **context provider** - think of it as passing wallet "tools" down to child components

## 📄 File 3: `components/passkey_auth_flow.tsx` - The Login UI

This is where the **magic happens**! It shows different states (idle, connecting, connected) and handles user interaction.

### Part 1: Imports and Setup

```typescript
"use client";  // Client component - uses browser APIs

// Import the wallet hook - this gives us access to wallet functions
import { useWallet } from "@lazorkit/wallet";
import { useState, useEffect } from "react";

export function PasskeyAuthFlow() {
  // 🔑 DESTRUCTURING THE WALLET HOOK
  // useWallet() gives us everything we need:
  const {
    connect,              // Function: starts passkey login
    disconnect,           // Function: logs user out
    isConnected,          // Boolean: true if user is logged in
    isConnecting,         // Boolean: true while logging in
    wallet,               // Object: full wallet data
    smartWalletPubkey,    // Object: wallet's public key
  } = useWallet();

  // 🎭 LOCAL STATE FOR UI
  // We track which screen to show:
  // - "idle" = Show login button
  // - "connecting" = Show loading spinner
  // - "connected" = Show wallet info
  const [loginStep, setLoginStep] = useState<
    "idle" | "connecting" | "connected"
  >("idle");  // Start with login button
```

**Key Concept:** `useWallet()` is a **React hook** - a special function that gives you access to shared state. Think of it as asking "Hey, what's the current wallet status?"

### Part 2: Syncing State

```typescript
  // 🔄 SYNC LOCAL STATE WITH WALLET STATE
  // This runs whenever isConnected changes
  useEffect(() => {
    if (isConnected) {
      setLoginStep("connected");      // Wallet says connected → show connected UI
    } else {
      setLoginStep("idle");           // Wallet says disconnected → show login UI
    }
  }, [isConnected]);  // Only re-run when isConnected changes
```

**Why we need this:** The wallet has its own state (`isConnected`), and we have our UI state (`loginStep`). This `useEffect` keeps them in sync.

### Part 3: Login Function

```typescript
  // 🚀 LOGIN FUNCTION
  const handleLogin = async () => {
    setLoginStep("connecting");  // Show loading spinner
    
    try {
      await connect();  // This triggers the browser's passkey prompt!
      // If successful, the useEffect above will set loginStep to "connected"
    } catch (error) {
      console.error("Login error:", error);
      setLoginStep("idle");  // Go back to login button on error
    }
  };

  // 👋 LOGOUT FUNCTION
  const handleLogout = async () => {
    await disconnect();  // Clears the wallet session
    setLoginStep("idle");  // Show login button again
  };
```

**What happens in `connect()`:**
1. Shows browser's native passkey prompt
2. User authenticates with biometrics/PIN
3. LazorKit creates/retrieves their Solana wallet
4. Returns wallet data to your app

### Part 4: The UI - Three States

#### State 1: Idle (Show Login Button)

```typescript
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header (always shows) */}
      <div className="text-center space-y-4 mt-10">
        <h1 className="text-4xl font-bold">Simple Authentication Flow</h1>
        <p className="text-muted-foreground text-lg">
          This example demonstrates passkey-based authentication
        </p>
      </div>

      {/* Main Card - Changes based on state */}
      <div className="p-8 border rounded-lg">
        {/* IDLE STATE */}
        {loginStep === "idle" && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Get Started</h2>
              <p className="text-gray-500">
                Click below to authenticate with your device passkey.
              </p>
            </div>
            <button
              onClick={handleLogin}  // Click triggers login flow
              disabled={isConnecting}  // Disable while already connecting
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              {isConnecting ? "Connecting..." : "Continue with Passkey"}
            </button>
          </div>
        )}
```

#### State 2: Connecting (Show Loading)

```typescript
        {/* CONNECTING STATE */}
        {loginStep === "connecting" && (
          <div className="text-center space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Authenticating...</h2>
              <p className="text-gray-500">
                Please approve the passkey prompt on your device.
              </p>
            </div>
          </div>
        )}
```

#### State 3: Connected (Show Wallet Info)

```typescript
        {/* CONNECTED STATE */}
        {loginStep === "connected" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                Successfully Authenticated!
              </h2>
              <p className="text-gray-500">
                Your smart wallet is ready to use.
              </p>
            </div>

            {/* Wallet Information */}
            <div className="space-y-4 p-6 bg-gray-100 rounded-lg">
              <div>
                <label className="text-sm text-gray-500">
                  Smart Wallet Address
                </label>
                {/* Show the wallet address */}
                <div className="mt-1 p-3 bg-white rounded-md border">
                  <code className="text-sm font-mono break-all">
                    {wallet?.smartWallet || "Loading..."}
                  </code>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="w-full py-2 bg-red-600 text-white rounded-lg"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

##Entire `components/passkey_auth_flow.tsx` - code:

```typescript
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

  // Sync local login step with wallet connection status
  // This ensures UI state matches the actual wallet state
  useEffect(() => {
    if (isConnected) {
      setLoginStep("connected");
    } else {
      setLoginStep("idle");
    }
  }, [isConnected]);

  /**
   * Handles the login/authentication process
   * 
   * When called, it:
   * 1. Sets UI to "connecting" state (shows loading)
   * 2. Calls connect() which triggers passkey prompt
   * 3. On success, useEffect will update to "connected"
   * 4. On error, resets to "idle" state
   */
  const handleLogin = async () => {
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
                {/* Display wallet address - try wallet.smartWallet first, fallback to smartWalletPubkey */}
                <div className="mt-1 p-3 bg-background rounded-md border border-border">
                  <code className="text-sm font-mono break-all">
                    {wallet?.smartWallet ||
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

```

## 🎯 The Complete Flow - Step by Step

### Step 1: User Visits Your Site
1. Browser loads `layout.tsx` → sets up fonts and Buffer polyfill
2. Browser loads `page.tsx` → wraps app with `LazorkitProvider`
3. Browser loads `passkey_auth_flow.tsx` → shows login button

### Step 2: User Clicks "Continue with Passkey"
1. `handleLogin()` runs → sets state to "connecting"
2. `connect()` from `useWallet()` triggers browser passkey prompt
3. User authenticates with fingerprint/face/PIN
4. LazorKit creates Solana wallet (first time) or retrieves existing one
5. Wallet state updates → `isConnected` becomes `true`

### Step 3: User is Connected
1. `useEffect` sees `isConnected` changed → sets `loginStep` to "connected"
2. UI shows wallet address and logout button
3. User can now use Solana dApps through this wallet

### Step 4: User Logs Out
1. Clicks "Log Out" → `handleLogout()` runs
2. `disconnect()` clears wallet session
3. State resets to "idle" → shows login button again

## 🔧 Common Issues & Fixes

### 1. "Buffer is not defined"
**Cause:** Forgot the polyfill in `layout.tsx`
**Fix:** Add the `if (typeof window !== 'undefined')...` code

### 2. Passkey prompt doesn't show
**Cause:** Not on HTTPS (localhost is OK)
**Fix:** Use HTTPS in production, check browser permissions

### 3. Can't connect
**Cause:** Wrong RPC URL or network issues
**Fix:** Check console for specific error, try devnet first

### 4. State out of sync
**Cause:** Forgot the `useEffect` synchronization
**Fix:** Always sync UI state with `isConnected` like we did

## 📚 Key Concepts Recap

1. **Context Provider** (`LazorkitProvider`): Makes wallet available to child components
2. **React Hook** (`useWallet()`): Gets wallet state and functions
3. **State Management**: Two types of state (wallet state + UI state) that need syncing
4. **Conditional Rendering**: Show different UI based on `loginStep`
5. **Async Functions**: `connect()` and `disconnect()` are async (return Promises)

## 🚀 Next Steps After This Tutorial. 
Try this yourself!!

1. **Add a loading skeleton** for better UX
2. **Display wallet balance** using Solana Web3.js
3. **Add "Send SOL" functionality**
4. **Connect to other dApps** using the wallet
5. **Style it better** with Tailwind CSS

That's it! You've built a complete passkey authentication system. The beauty is: **no passwords, no seed phrases, just biometrics** 🔐