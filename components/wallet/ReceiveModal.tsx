"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Snackbar,
  Avatar,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useAccount } from "wagmi";
import { type TokenInfo, NATIVE_ETH_ADDRESS } from "@/lib/tokens";

export interface ReceiveTokenInfo {
  token: TokenInfo;
  chainId: number;
  chainName: string;
}

interface ReceiveModalProps {
  open: boolean;
  onClose: () => void;
  tokenInfo?: ReceiveTokenInfo | null;
}

/**
 * Build EIP-681 URI for QR code
 * - Native ETH: ethereum:0xMyAddress@chainId
 * - ERC20 token: ethereum:0xTokenContract@chainId/transfer?address=0xMyAddress
 */
function buildEip681Uri(
  walletAddress: string,
  tokenInfo?: ReceiveTokenInfo | null
): string {
  if (!tokenInfo) {
    // Generic — just the address
    return walletAddress;
  }

  const { token, chainId } = tokenInfo;
  const tokenAddress = token.addresses[chainId];

  if (!tokenAddress || tokenAddress === NATIVE_ETH_ADDRESS) {
    // Native ETH
    return `ethereum:${walletAddress}@${chainId}`;
  }

  // ERC20 transfer: ethereum:0xTokenContract@chainId/transfer?address=0xMyAddress
  return `ethereum:${tokenAddress}@${chainId}/transfer?address=${walletAddress}`;
}

export default function ReceiveModal({ open, onClose, tokenInfo }: ReceiveModalProps) {
  const { address, chain } = useAccount();
  const [copied, setCopied] = useState(false);

  const qrData = buildEip681Uri(address || "", tokenInfo);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  const displayChainName = tokenInfo?.chainName || chain?.name || "Ethereum";
  const displayToken = tokenInfo?.token;

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, m: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography fontWeight={700}>
            Receive{displayToken ? ` ${displayToken.symbol}` : ""}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} pb={2}>
            {/* Token badge */}
            {displayToken && (
              <Chip
                avatar={<Avatar src={displayToken.logoUrl} alt={displayToken.symbol} />}
                label={`${displayToken.symbol} on ${displayChainName}`}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}

            {/* QR Code */}
            <Box
              sx={{
                width: 200,
                height: 200,
                borderRadius: "12px",
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 1,
              }}
            >
              <Box
                component="img"
                src={qrUrl}
                alt="QR Code"
                sx={{ width: 184, height: 184 }}
              />
            </Box>

            {/* Info text */}
            <Typography variant="caption" color="warning" textAlign="center">
              {displayToken ? (
                <>
                  Scan to send <b>{displayToken.symbol}</b> to this address on <b>{displayChainName}</b>
                </>
              ) : (
                <>
                  This address receives all tokens on <br /><b>{displayChainName}</b>
                </>
              )}
            </Typography>

            {/* Address */}
            <Box
              sx={{
                width: "100%",
                bgcolor: "action.hover",
                borderRadius: 2,
                p: 1.5,
                wordBreak: "break-all",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" fontFamily="monospace" fontSize={13}>
                {address}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              startIcon={<ContentCopyIcon />}
              onClick={copyAddress}
              sx={{ borderRadius: 2 }}
            >
              Copy Address
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Address copied!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
