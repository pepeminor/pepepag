"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Web3AuthProvider } from "@web3auth/modal/react";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { ThemeContextProvider } from "./ThemeContext";
import { web3AuthContextConfig } from "./web3auth";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeContextProvider>
      <QueryClientProvider client={queryClient}>
        <Web3AuthProvider config={web3AuthContextConfig}>
          <WagmiProvider>
            {children}
          </WagmiProvider>
        </Web3AuthProvider>
      </QueryClientProvider>
    </ThemeContextProvider>
  );
}
