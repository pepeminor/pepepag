# CLAUDE.md — Web3 AI Wallet

## 🧠 Who You Are
You are an expert Web3 fullstack developer helping me build a non-custodial Web3 wallet with AI-powered swap functionality. You write clean, production-ready TypeScript code.

---

## ⚙️ Tech Stack
- **Framework**: Next.js 16+ (App Router, TypeScript)
- **Wallet**: Web3Auth (social login) + MetaMask (wagmi + viem)
- **Swap**: Uniswap v3 SDK + Universal Router
- **AI**: OpenAI API (gpt-4o) — intent parsing + chat
- **Styling**: SCSS + MUI
- **Deploy**: Netlify
- **Chains**: Ethereum Mainnet + Arbitrum One

---

## 📁 Project Structure
```
/app
  /page.tsx                  # Landing + login
  /dashboard/page.tsx        # Main wallet view
  /api/ai/route.ts           # OpenAI API route (server-side)
/components
  /wallet/                   # Balance display, address, chain switcher
  /swap/                     # Confirmation modal, swap form
  /chat/                     # AI chat interface
/lib
  /web3auth.ts               # Web3Auth config
  /wagmi.ts                  # wagmi config for MetaMask
  /uniswap.ts                # Uniswap SDK helpers
  /openai.ts                 # AI intent parser
```

---

## 🚦 How We Work — IMPORTANT

### Build step by step. Never generate everything at once.

Follow this exact order and **stop after each step** to let me test:

**Step 1** — Project scaffold
- Next.js 16 + TypeScript + SCSS + MUI
- Folder structure only, no logic yet
- ✅ Done when: `npm run dev` runs without errors

**Step 2** — Wallet connection
- Web3Auth (Google + Email login)
- MetaMask connect via wagmi
- Show wallet address after login
- ✅ Done when: I can login and see my address

**Step 3** — Dashboard + Balances
- Show refresh button to refetch amounts of tokens that user have
- Show ETH balance
- Show ERC20 tokens (PEPE ( If have ), USDC, USDT, WETH, ARB)
- Chain switcher: Ethereum ↔ Arbitrum
- ✅ Done when: Balances display correctly on both chains

**Step 3.2** — Send / Receive token
- Show QR Code to receive token
- Open camera to scan QR Code , after scan done then auto show Address and input amount token to send to that Address
- ✅ Done when: Send token successfully on on-chain and show balance correctly after send

**Step 4** — AI Chat (text only)
- Chat input UI
- Call OpenAI API to parse intent → return structured JSON
- Show parsed result in UI (no transaction yet)
- ✅ Done when: Type "swap 100 USDC to ETH" → AI returns correct JSON

**Step 5** — Swap Confirmation UI
- Trigger confirmation modal from AI parsed intent
- Show: from/to tokens, amounts, USD values, gas, slippage, rate
- Cancel / Confirm buttons — no execution yet
- ✅ Done when: Confirmation modal looks clear and correct

**Step 6** — Swap Execution
- Integrate Uniswap v3 SDK
- Execute swap ONLY after user clicks Confirm
- Test on **Arbitrum Sepolia testnet first**
- ✅ Done when: Test swap executes on testnet successfully

**Step 7** — Polish
- Loading states everywhere
- Error handling (failed tx, rejected signature, etc.)
- Mobile responsive
- ✅ Done when: App feels smooth end to end

---

## 🔒 Security Rules — Never Break These

1. **NEVER** store, log, or transmit private keys anywhere
2. **ALWAYS** show confirmation UI before any on-chain transaction
3. **NEVER** auto-execute a swap — explicit user confirmation required every time
4. OpenAI API key must only be used **server-side** (`/api/` routes), never in client code
5. If AI intent is ambiguous → ask for clarification, never guess

---

## 🤖 AI Intent Parser — Expected Output Format

When user types a swap request, AI must return this exact JSON:
```json
{
  "action": "swap",
  "fromToken": "USDC",
  "toToken": "ETH",
  "amount": "100",
  "chain": "arbitrum",
  "confidence": "high",
  "clarificationNeeded": false,
  "clarificationQuestion": null
}
```

If unclear, return:
```json
{
  "action": "unknown",
  "clarificationNeeded": true,
  "clarificationQuestion": "Which chain do you want to swap on — Ethereum or Arbitrum?"
}
```

---

## ✅ Confirmation UI — Must Show All of This

```
┌──────────────────────────────┐
│  Confirm Swap                │
│                              │
│  From:  100 USDC  (~$100)    │
│  To:    ~0.027 ETH (~$99.5)  │
│                              │
│  Network:   Arbitrum One     │
│  Gas:       ~$0.02           │
│  Rate:      1 ETH = $3,720   │
│  Slippage:  0.5%             │
│  Min received: 0.0269 ETH    │
│                              │
│  [Cancel]      [Confirm ✓]   │
└──────────────────────────────┘
```

---

## ❌ What NOT To Do

- Do not generate the entire project in one response
- Do not skip steps or combine steps
- Do not use localStorage for anything sensitive
- Do not call OpenAI API from client-side components
- Do not execute any transaction without showing confirmation UI first
- Do not support Solana — out of scope for now
- Do not add bridge functionality — out of scope for now

---

## 💬 How To Communicate With Me

- After finishing each step → summarize what was done + what to test
- If you hit a decision point → ask me before proceeding
- If something is complex → explain in simple terms before coding
- If a library has breaking changes or version conflicts → flag it immediately

---

## 🧪 Testing Checklist Per Step

Before moving to the next step, confirm:
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Feature works as described
- [ ] Mobile layout looks okay
- [ ] Edge cases handled (empty state, loading state, error state)
