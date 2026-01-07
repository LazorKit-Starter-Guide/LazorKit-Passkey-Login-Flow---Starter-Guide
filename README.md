# LazorKit Passkey Login Flow

A complete starter template for integrating LazorKit's passkey-based authentication with smart wallet functionality on Solana. This project demonstrates how to implement passwordless login using WebAuthn passkeys, with automatic smart wallet creation and seamless Solana integration.

## What is LazorKit?

LazorKit is a powerful SDK that simplifies Web3 authentication and wallet management on Solana. Instead of traditional seed phrases or browser extensions, LazorKit uses passkeys (WebAuthn) to provide a secure, user-friendly authentication experience. When users authenticate with their device passkey, a smart wallet is automatically created and managed for them.

## Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- A modern browser with WebAuthn support (Chrome, Firefox, Safari, Edge)

### Installation

```bash
npm install
```

### Running

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the passkey authentication flow.

## Documentation

📚 **All documentation is organized in the [`docs/`](./docs/) folder:**

- **[Getting Started](./docs/getting-started.md)** - Installation, setup, and running your first flow
- **[Configuration Guide](./docs/configuration.md)** - Complete configuration options and environment setup
- **[API Reference](./docs/api-reference.md)** - Complete API documentation for hooks and components
- **[Architecture Overview](./docs/architecture.md)** - Project structure and how everything works
- **[Troubleshooting](./docs/troubleshooting.md)** - Common issues and solutions

## Examples

Environment-specific examples with polyfills and configurations:

- **[Passkey Based Wallet Integration ExampleKit](./examples/passkey_login_example_app.md)** - step by step tutorial on how to create a passkey-based wallet.

- We also have a Step by Step YouTube Video Tutorial.
- [![Watch the video](https://img.youtube.com/vi/D9QJItUdPY8/maxresdefault.jpg)](https://youtu.be/D9QJItUdPY8)

### [Step by Step tutorial on how to integrate Passkey Auth Flow from LazorKit](https://youtu.be/D9QJItUdPY8)
## Project Structure

```
passkeyflow/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Buffer polyfill
│   ├── page.tsx           # Main page with LazorKit provider
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── passkey_auth_folow.tsx  # Main authentication component
│   └── ui/                # Reusable UI components
├── docs/                  # 📚 Documentation (modular guides)
├── examples/              # 🔧 Environment-specific examples
├── lib/                   # Utility functions
└── public/                # Static assets
```

## Features

- ✅ **Passkey-based authentication** - Device biometric or PIN authentication
- ✅ **Automatic smart wallet creation** - Wallet created on first login
- ✅ **Wallet state management** - Easy access to wallet address and status
- ✅ **Clean, modern UI** - Dark mode interface with smooth transitions
- ✅ **Well-documented** - Comprehensive documentation and examples

## Basic Usage

**Important for Next.js App Router:** Always use `"use client"` directive for components using wallet hooks.

```typescript
"use client"; // Required for Next.js App Router

import { useWallet } from "@lazorkit/wallet";

function MyComponent() {
  const { connect, disconnect, isConnected, smartWalletPubkey } = useWallet();

  const handleConnect = async () => {
    await connect(); // Triggers passkey prompt
  };

  if (isConnected) {
    return <div>Wallet: {smartWalletPubkey?.toString()}</div>;
  }

  return <button onClick={handleConnect}>Connect with Passkey</button>;
}
```

**Note:** Next.js usually handles module resolution automatically, but ensure wallet logic runs on the client-side. For Buffer polyfill setup, see the [Configuration Guide](./docs/configuration.md) or [Examples](./examples/).

For complete usage examples, see the [API Reference](./docs/api-reference.md).

## Resources

- [LazorKit Documentation](https://docs.lazor.sh) - Official LazorKit docs
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/) - Solana JavaScript API
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework guide
- [WebAuthn Guide](https://webauthn.guide/) - Understanding WebAuthn/passkeys

## Support

If you encounter issues:

1. Check the [Troubleshooting Guide](./docs/troubleshooting.md)
2. Review the [Examples](./examples/) for your environment
3. Check the browser console for errors
4. Visit [LazorKit Documentation](https://docs.lazor.sh)

## License

This starter template is provided as-is for educational and development purposes.

---

**Happy Building!** 🚀
