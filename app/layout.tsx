import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import Providers from "@/lib/Providers";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "PepePag — Web3 AI Wallet",
  description: "Non-custodial Web3 wallet with AI-powered swap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
