"use client";

import { useState, useRef } from "react";
import {
  Box,
  MenuItem,
  Select,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useSwitchChain } from "@web3auth/modal/react";
import { useAccount, useSwitchChain as useWagmiSwitchChain } from "wagmi";

const CHAINS = [
  { chainId: "0x1", numericId: 1, label: "Ethereum", color: "#627EEA", icon: "⟠" },
  { chainId: "0xa4b1", numericId: 42161, label: "Arbitrum", color: "#28A0F0", icon: "🔵" },
];

export default function ChainSwitcher() {
  const { chain } = useAccount();
  const { switchChain: web3AuthSwitch, loading } = useSwitchChain();
  const { switchChain: wagmiSwitch } = useWagmiSwitchChain();
  const [switching, setSwitching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pendingChainRef = useRef<string | null>(null);

  const currentHex = CHAINS.find((c) => c.numericId === chain?.id)?.chainId || "0xa4b1";

  const handleChange = (e: SelectChangeEvent) => {
    const chainId = e.target.value;
    if (chainId === currentHex || loading || switching) return;
    pendingChainRef.current = chainId;
    setMenuOpen(false);
  };

  const handleMenuClosed = async () => {
    const chainId = pendingChainRef.current;
    if (!chainId) return;
    pendingChainRef.current = null;

    const numericId = CHAINS.find((c) => c.chainId === chainId)?.numericId;
    if (!numericId) return;

    setSwitching(true);
    try {
      // Try Web3Auth switch first
      await web3AuthSwitch(chainId);
    } catch {
      // Fallback to wagmi switchChain
      try {
        wagmiSwitch({ chainId: numericId });
      } catch {
        // ignore
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Select
      value={currentHex}
      onChange={handleChange}
      open={menuOpen}
      onOpen={() => setMenuOpen(true)}
      onClose={() => setMenuOpen(false)}
      size="small"
      disabled={switching}
      MenuProps={{
        TransitionProps: { onExited: handleMenuClosed },
        disableAutoFocusItem: true,
      }}
      sx={{
        minWidth: 150,
        borderRadius: 2,
        fontSize: 13,
        fontWeight: 600,
        "& .MuiSelect-select": {
          display: "flex",
          alignItems: "center",
          gap: 0.8,
          py: 0.6,
        },
      }}
      renderValue={(value) => {
        const c = CHAINS.find((ch) => ch.chainId === value);
        return (
          <Box display="flex" alignItems="center" gap={0.8}>
            {switching ? <CircularProgress size={14} /> : <span>{c?.icon}</span>}
            {c?.label}
          </Box>
        );
      }}
    >
      {CHAINS.map((c) => (
        <MenuItem key={c.chainId} value={c.chainId}>
          <ListItemIcon sx={{ minWidth: 28, fontSize: 16 }}>{c.icon}</ListItemIcon>
          <ListItemText
            primary={c.label}
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
          />
        </MenuItem>
      ))}
    </Select>
  );
}
