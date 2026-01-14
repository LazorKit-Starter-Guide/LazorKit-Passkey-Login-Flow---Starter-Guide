# Passkey Authentication with Lazorkit - Complete Tutorial

## Introduction: How to create a passkey-based wallet

Welcome to this comprehensive tutorial on implementing **passkey-based authentication** for Web3 applications using Lazorkit. This guide will walk you through building a modern, secure authentication system that eliminates passwords and seed phrases, providing users with a seamless login experience using biometrics or device PIN.

## What You'll Build

By the end of this tutorial, you'll have a fully functional passkey authentication system that:
- **Enables passwordless login** with FaceID, TouchID, or Windows Hello
- **Automatically creates smart wallets** for new users
- **Provides gasless transactions** with built-in paymaster
- **Offers a beautiful, responsive UI** for authentication flow
- **Works across all modern browsers** without extensions

## 🏗️ Project Structure

```
lazorkit-passkey-demo/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx           # Main page component
├── components/
│   ├── passkey_auth_flow.tsx  # Authentication UI
│   └── ui/                    # Reusable UI components
│       └── button.tsx
└── public/                  # Static assets
```

## 📚 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Basic understanding of Next.js and TypeScript
- A modern browser with WebAuthn support (Chrome 67+, Safari 13+, Firefox 60+)
- Code editor (VS Code recommended)

 ## Quick Start

### VIDEO TUTORIAL

[![Watch the video](https://img.youtube.com/vi/D9QJItUdPY8/maxresdefault.jpg)](https://youtu.be/D9QJItUdPY8)

### [Tutorial Video on Building a Passkey Auth Flow with lazorKit](https://youtu.be/D9QJItUdPY8)

### DOCUMENTATION TUTORIAL

Method 1: Clone and Run (Fastest)
bash
# Clone the repository
```bash
git clone < github repositoru link>
```
cd lazorkit-passkey-demo

# Install dependencies
```bash

npm install
```
# Start the development server
```bash
npm run dev
```

Method 2: Create from Scratch


# Step 1: Create a new Next.js project

```bash

npx create-next-app@latest my-passkey-app --typescript --tailwind --app
```

cd my-passkey-app

# Step 2: Install required dependencies
```bash

npm install @lazorkit/wallet @coral-xyz/anchor @solana/web3.js buffer react-router-dom

```
Sometimes during installation or when running the project, you might encounter "Module not found" errors for certain Solana-related packages. This typically happens when peer dependencies aren't automatically installed or when there are version conflicts.

Quick Fix: Install All Missing Dependencies If you're encountering multiple module errors, you can install all of these at once:

```bash
npm install @solana/kora @solana-program/token @solana/kit @solana/wallet-adapter-base @wallet-standard/wallet --legacy-peer-deps
```

### Step 3: Understanding the Complete Code Structure

Let's walk through each file in the project and understand its purpose:

## Step 4: Root Layout (`app/layout.tsx`)

**Purpose**: Sets up the foundational structure for your entire Next.js application, including fonts, global styles, and polyfills.

**Complete Code**:

```typescript
/**
 * Root Layout Component
 * 
 * This component sets up the root HTML structure for the Next.js application.
 * It includes:
 * - Font configuration (Geist Sans and Geist Mono)
 * - Global CSS styles
 * - Buffer polyfill for browser compatibility (needed for Solana/Web3)
 * - Dark mode enabled by default
 * - Page metadata
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configure Geist Sans font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure Geist Mono font
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Polyfill Buffer for browser compatibility
// Required for Solana Web3.js and other crypto libraries that expect Node.js Buffer
if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || require('buffer').Buffer;
}

// Page metadata for SEO and browser display
export const metadata: Metadata = {
  title: "Lazorkit Passkey Auth Flow",
  description: "A simple example of passkey-based authentication using LazorKit on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

**Key Components Explained**:

1. **Font Configuration**: Uses Geist fonts from Vercel for a modern typography system
2. **Buffer Polyfill**: Essential for Web3 applications because Solana's libraries expect Node.js Buffer API
3. **Dark Mode**: Sets the default theme to dark mode
4. **Metadata**: Provides SEO-friendly title and description

## Step 5: Main Page (`app/page.tsx`)

The main entry point that wraps your authentication flow with the Lazorkit provider.

**Complete Code**:

```typescript
"use client";

/**
 * Main Page Component
 * 
 * This is the entry point for the LazorKit passkey authentication example.
 * It wraps the PasskeyAuthFlow component with the LazorkitProvider, which
 * provides the necessary context and configuration for LazorKit to work.
 * 
 * Configuration:
 * - rpcUrl: Solana network RPC endpoint (devnet in this example)
 * - portalUrl: LazorKit portal service URL for authentication
 * - paymasterConfig: Optional paymaster service for gasless transactions
 */

import { LazorkitProvider } from "@lazorkit/wallet";
import { PasskeyAuthFlow } from "../components/passkey_auth_flow";

// LazorKit configuration object
// For production, consider moving these to environment variables
const CONFIG = {
  rpcUrl: "https://api.devnet.solana.com", // Solana devnet RPC endpoint
  portalUrl: "https://portal.lazor.sh", // LazorKit portal URL
  paymasterConfig: {
    paymasterUrl: "https://kora.devnet.lazorkit.com", // Paymaster service for gasless transactions
  },
};

export default function Page() {
  return (
    <LazorkitProvider {...CONFIG}>
      <PasskeyAuthFlow />
    </LazorkitProvider>
  );
}
```

**Configuration Explained**:

1. **`rpcUrl`**: Points to Solana devnet for testing (use mainnet for production)
2. **`portalUrl`**: Lazorkit's authentication portal that handles passkey management
3. **`paymasterConfig`**: Enables gasless transactions so users don't pay for gas

**Important Note**: This file uses `"use client"` directive because LazorkitProvider requires client-side interactivity.

## Step 6: Passkey Authentication Flow (`components/passkey_auth_flow.tsx`)

**Purpose**: The core authentication component that handles the complete user flow from login to logout.

**Complete Code**:

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

## 🔧 Testing the Authentication Flow

### Test 1: First-Time User Experience

1. Open `http://localhost:3000` in Chrome/Safari/Firefox
2. Click "Continue with Passkey"
3. You'll see a browser-native passkey prompt:
   - **macOS**: Touch ID prompt
   - **Windows**: Windows Hello prompt
   - **Android**: Fingerprint or face unlock
   - **iOS**: Touch ID
4. After authentication, you'll see your wallet address

### Test 2: Returning User Experience

1. Log out using the "Log Out" button
2. Click "Continue with Passkey" again
3. The system will recognize you and log you in without creating a new wallet


## 🎉 Conclusion

You've successfully built a complete passkey authentication system with Lazorkit! This implementation provides:

✅ **Passwordless authentication** with biometrics  
✅ **Automatic smart wallet creation**  
✅ **Gasless transactions** with paymaster  
✅ **Beautiful, responsive UI**  
✅ **Production-ready architecture**  

This foundation can be extended to build full-featured Web3 applications with superior user experience compared to traditional wallet-based systems.

**Happy Building!** 🚀

Remember: The future of Web3 authentication is passwordless, and you've just built the gateway to that future.