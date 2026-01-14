# LazorKit Starter Guide

## Overview

Welcome to the **LazorKit Starter Guide** repository! This is your comprehensive resource for learning and implementing modern Web3 authentication and application development using **LazorKit's cutting-edge smart wallet technology**.

This repository contains two essential learning paths:

1. **Tutorial One**: Master passkey-based wallet creation (Foundational skills)
2. **Example Project**: Build a Zealy-like referral platform (Real-world application)

## Why This Repository?

Traditional Web3 has three major barriers:

1. **Complex onboarding** (seed phrases, extensions)
2. **Transaction costs** (gas fees)
3. **Poor user experience** (wallet popups)

**This repository solves all three** by teaching you how to build applications that are:

- **Passwordless** (Touch ID, Windows Hello)
- **Gasless** (sponsored transactions)
- **User-friendly** (no seed phrases ever)

## SDK Installation & Configuration

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

## FOR NEXT.JS

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
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || require("buffer").Buffer;
}

// Page metadata for SEO and browser display
export const metadata: Metadata = {
  title: "Lazorkit Passkey Auth Flow",
  description:
    "A simple example of passkey-based authentication using LazorKit on Solana.",
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

# ENVIRONMENT SETUP

Create a .env file in the root directory:

```typescript
VITE_APP_RPC_URL=https://api.devnet.solana.com
VITE_APP_PORTAL_URL=https://portal.lazor.sh
VITE_APP_PAYMASTER_URL=https://kora.devnet.lazorkit.com
```

Render and Define a configuration object that centralizes your application settings:

```typescript
const CONFIG = {
  RPC_URL: process.env.REACT_APP_RPC_URL || "https://api.devnet.solana.com",
  PORTAL_URL: process.env.REACT_APP_PORTAL_URL || "https://portal.lazor.sh",
  PAYMASTER: {
    paymasterUrl: process.env.REACT_APP_PAYMASTER_URL || "https://kora.devnet.lazorkit.com",
  },
}
```
OR add configuration directly.

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

## FOR REACT-VITE.JS

Add this to your vite.config.ts file

```bash
// vite.config.ts
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills(),
    // ...
  ],
});
```

## What You'll Learn

### Part 1: Tutorial One - Passkey-Based Wallet Creation

Learn the fundamentals of passwordless Web3 authentication:

- ✅ **WebAuthn Integration**: Implement biometric authentication
- ✅ **Smart Wallet Creation**: Automatically generate user wallets
- ✅ **Gasless Transactions**: Configure paymaster for free user actions
- ✅ **Session Management**: Handle user sessions across devices
- ✅ **Production Deployment**: Deploy your authentication system

**[ Tutorial: How to create a passkey-based wallet](https://github.com/LazorKit-Starter-Guide/Tutorial-Guide/blob/main/docs/tutorial_one.md)**


**[ Tutorial: How to persist session across devices](https://github.com/LazorKit-Starter-Guide/Tutorial-Guide/blob/main/docs/tutorial_two.md)**

### Part 2: Example Project - Zealy-Like Platform

Build a complete referral and task platform:

- ✅ **Referral System**: Track and reward user referrals
- ✅ **Task Management**: Create completable tasks with signatures
- ✅ **Points Calculation**: Dynamic reward system
- ✅ **Dashboard Interface**: User-friendly management panel
- ✅ **Cross-Device Persistence**: Sessions that work everywhere

**[Explore the Example Project](https://github.com/LazorKit-Starter-Guide/Tutorial-Guide/blob/main/example/zealy-like-project.md)**

## Quick Start Guide

### For Beginners (Start Here)

1. **Begin with Tutorial One** - Master passkey authentication fundamentals
2. **Watch the video guide** - Visual learning for better understanding
3. **Build the example project** - Apply your skills to a real application
4. **Customize and deploy** - Make it your own and launch it

### For Experienced Developers

1. **Review the architecture** - Understand the LazorKit integration patterns
2. **Examine the code structure** - Learn production-ready patterns
3. **Extend the examples** - Add your own features and functionality
4. **Deploy to production** - Use the provided deployment guides

## Repository Structure

```
LazorKit-Starter-Guide/
├── 📚 docs/
│   └── tutorial_one.md          # Complete passkey wallet tutorial
├── 🏆 example/
│   └── zealy-like-project.md    # Full referral platform guide
|
|
└── 📄 README.md                 # This file
```

## 🎥 Video Tutorials

[![Watch the video](https://img.youtube.com/vi/D9QJItUdPY8/maxresdefault.jpg)](https://youtu.be/D9QJItUdPY8)

### [Watch: Mastering Passkey Authentication powered by LazorKit](https://youtu.be/D9QJItUdPY8)

### Common Issues & Solutions

#### Issue: "Buffer is not defined" error

**Solution**:

```javascript
// Add to your layout file
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || require("buffer").Buffer;
}
```

#### Issue: Connection to devnet fails

**Solution**:

- Check your RPC endpoint URL
- Verify network connectivity
- Try a different RPC provider if issues persist

## Resources

- [LazorKit Documentation](https://docs.lazor.sh) - Official LazorKit docs
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/) - Solana JavaScript API
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework guide
- [WebAuthn Guide](https://webauthn.guide/) - Understanding WebAuthn/passkeys

## Support

If you encounter issues:

1. Check the [Troubleshooting Guide](https://github.com/LazorKit-Starter-Guide/Tutorial-Guide/blob/main/docs/troubleshooting.md)

This starter template is provided as-is for educational and development purposes.

**Happy Building!**
