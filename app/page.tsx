"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Divider,
  IconButton,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useAccount, useConnect } from "wagmi";
import { useThemeMode } from "@/lib/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const { mode, toggleTheme } = useThemeMode();
  const { isConnected: isWeb3AuthConnected, connect: connectWeb3Auth, loading: web3AuthLoading } = useWeb3AuthConnect();
  const { isConnected: isWagmiConnected } = useAccount();
  const { connectors, connect: connectWagmi, isPending: wagmiPending } = useConnect();

  const isConnected = isWeb3AuthConnected || isWagmiConnected;
  const isLoading = web3AuthLoading || wagmiPending;

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  const handleMetaMask = () => {
    const metamask = connectors.find(
      (c) => c.name.toLowerCase().includes("metamask") || c.id === "injected"
    );
    if (metamask) {
      connectWagmi({ connector: metamask });
    }
  };

  if (isConnected) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
    >
      <IconButton
        onClick={toggleTheme}
        sx={{ position: "absolute", top: 16, right: 16 }}
      >
        {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>

      <Stack spacing={3} alignItems="center" maxWidth={400} width="100%">
        <Box textAlign="center" mb={1}>
          <Typography variant="h4" fontWeight={800} letterSpacing={-0.5}>
            PepePag
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Web3 AI Wallet
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => connectWeb3Auth()}
          disabled={isLoading}
          sx={{
            py: 1.5,
            fontSize: "1rem",
            background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
            "&:hover": {
              background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
            },
          }}
        >
          {web3AuthLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Continue with Social Login"
          )}
        </Button>

        <Divider sx={{ width: "100%", color: "text.secondary", fontSize: 13 }}>
          or
        </Divider>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={handleMetaMask}
          disabled={isLoading}
          startIcon={<AccountBalanceWalletIcon />}
          sx={{
            py: 1.5,
            fontSize: "1rem",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          {wagmiPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "MetaMask"
          )}
        </Button>

        <Typography variant="caption" color="text.secondary" textAlign="center" mt={2}>
          Non-custodial. Your keys, your crypto.
        </Typography>
      </Stack>
    </Box>
  );
}
