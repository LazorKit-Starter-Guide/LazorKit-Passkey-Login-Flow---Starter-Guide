# LazorKit Passkey Wallet Tutorial (Next.js)

##Tutorial Video on how to integrate Passkey Auth from LazorKit.
[![Watch the video](https://img.youtube.com/vi/D9QJItUdPY8/maxresdefault.jpg)](https://youtu.be/D9QJItUdPY8)

### [Step by Step tutorial on how to integrate Passkey Auth Flow from LazorKit](https://youtu.be/D9QJItUdPY8)

## Overview

This guide walks you through building a **Next.js app with passkey authentication** (biometrics instead of passwords).
When a user authenticates, a **Solana smart wallet** is automatically created or restored using **LazorKit**.

**What you’ll build:**

* Passwordless login using WebAuthn (passkeys)
* Automatic Solana smart wallet creation
* Simple, state-driven authentication UI

---

## Tech Stack

* **Next.js (App Router)**
* **React + TypeScript**
* **LazorKit Wallet SDK**
* **Tailwind CSS**
* **Solana Devnet**

---

## Final File Structure

```
your-project/
├── app/
│   ├── layout.tsx        # Global layout, fonts, Buffer polyfill
│   └── page.tsx          # LazorKit provider + main page
├── components/
│   └── passkey_auth_flow.tsx
├── styles/
│   └── globals.css
└── package.json
```

---

## 1. Create a Next.js Project

Create a new Next.js app using the App Router and TypeScript.

```bash
npx create-next-app@latest lazorkit-passkey-demo
cd lazorkit-passkey-demo
```

When prompted:

* TypeScript: **Yes**
* App Router: **Yes**
* Tailwind CSS: **Yes**
* ESLint: **Yes**

Start the dev server to confirm setup:

```bash
npm run dev
```

---

## 2. Install LazorKit & Dependencies

Install LazorKit and required browser polyfills.

```bash
npm install @lazorkit/wallet @coral-xyz/anchor @solana/web3.js buffer
```

Sometimes during installation or when running the project, you might encounter "Module not found" errors for certain Solana-related packages. This typically happens when peer dependencies aren't automatically installed or when there are version conflicts.


### Quick Fix: Install All Missing Dependencies

If you're encountering multiple module errors, you can install all of these at once:

```bash
npm install @solana/kora @solana-program/token @solana/kit @solana/wallet-adapter-base @wallet-standard/wallet --legacy-peer-deps
```

> **Why buffer?**
> Solana libraries expect Node’s `Buffer`, which doesn’t exist in browsers by default.

---

## 3. Global Layout (`app/layout.tsx`)

This file runs once and wraps your entire application.

**Responsibilities:**

* Load fonts
* Apply global styles
* Polyfill `Buffer` for Solana compatibility

Replace `app/layout.tsx` with:

```ts
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Solana Buffer polyfill (critical)
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || require("buffer").Buffer;
}

export const metadata: Metadata = {
  title: "LazorKit Passkey Auth",
  description: "Passkey-based Solana smart wallet authentication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### Why this matters

* **Without the Buffer polyfill, Solana SDKs will crash**
* Fonts are loaded once and reused everywhere

---

## 4. Wallet Provider (`app/page.tsx`)

This page wraps your app with `LazorkitProvider`, making wallet state available to all components.

Replace `app/page.tsx` with:

```ts
"use client";

import { LazorkitProvider } from "@lazorkit/wallet";
import { PasskeyAuthFlow } from "@/components/passkey_auth_flow";

const CONFIG = {
  rpcUrl: "https://api.devnet.solana.com",
  portalUrl: "https://portal.lazor.sh",
  paymasterConfig: {
    paymasterUrl: "https://kora.devnet.lazorkit.com",
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

### Key idea

`LazorkitProvider` is a **React context provider**.
Anything inside it can access wallet state via `useWallet()`.

---

## 5. Passkey Authentication UI

Create `components/passkey_auth_flow.tsx`.

This component:

* Initiates passkey login
* Tracks authentication state
* Displays wallet info once connected

### Complete Component

```ts
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

---

## 6. How the Authentication Flow Works

### 1. Page Load

* `layout.tsx` initializes fonts and Buffer
* `page.tsx` mounts `LazorkitProvider`
* UI renders login state

### 2. User Clicks “Continue with Passkey”

* `connect()` triggers WebAuthn
* Browser shows native biometric prompt
* LazorKit creates or restores the wallet

### 3. Successful Login

* `isConnected` becomes `true`
* UI switches to connected state
* Wallet address is displayed

### 4. Logout

* `disconnect()` clears session
* UI resets to idle state

---

## Common Issues

### “Buffer is not defined”

**Cause:** Missing polyfill
**Fix:** Ensure the Buffer code exists in `layout.tsx`

---

### Passkey prompt doesn’t appear

**Cause:** Non-HTTPS domain
**Fix:**

* `localhost` is fine for dev
* Production must use HTTPS

---

### Wallet not connecting

**Cause:** RPC or network issue
**Fix:**

* Use Solana **devnet**
* Check console errors

---

## Core Concepts Recap

* **LazorkitProvider** → exposes wallet context
* **useWallet()** → connect, disconnect, wallet state
* **WebAuthn** → browser-native passkeys
* **Smart Wallets** → created automatically, no seed phrases
* **State-driven UI** → reflects wallet connection status

---

## Next Steps

Once this works, you can:

* Fetch wallet balances
* Send SOL or tokens
* Add transaction signing
* Integrate with other Solana dApps
* Add account recovery logic
* Improve UX with skeleton loaders

---

## Final Thought

You’ve just built a **passwordless Solana onboarding flow** with:

* No seed phrases
* No browser extensions
* No gas management for users
