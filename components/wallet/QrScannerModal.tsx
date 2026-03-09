"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: { address: string; token?: string; amount?: string }) => void;
}

// Parse EIP-681 (ethereum:0x...?value=...&token=...) or plain address
function parseQrData(raw: string): { address: string; token?: string; amount?: string } | null {
  const trimmed = raw.trim();

  // EIP-681: ethereum:0xAddress@chainId/transfer?address=0x...&uint256=...
  // or simpler: ethereum:0xAddress?value=...
  if (trimmed.startsWith("ethereum:")) {
    const withoutPrefix = trimmed.slice(9);
    const [pathPart, queryPart] = withoutPrefix.split("?");
    // Extract address (may have @chainId or /function)
    const addressMatch = pathPart.match(/^(0x[a-fA-F0-9]{40})/);
    if (!addressMatch) return null;

    const params = new URLSearchParams(queryPart || "");
    return {
      address: addressMatch[1],
      amount: params.get("value") || params.get("amount") || undefined,
      token: params.get("token") || undefined,
    };
  }

  // Binance-style or plain address with possible query params
  // e.g. "bnb:0xAddress?amount=100&token=USDT"
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx > 0 && colonIdx < 10) {
    const afterColon = trimmed.slice(colonIdx + 1);
    const [pathPart, queryPart] = afterColon.split("?");
    const addressMatch = pathPart.match(/^(0x[a-fA-F0-9]{40})/);
    if (addressMatch) {
      const params = new URLSearchParams(queryPart || "");
      return {
        address: addressMatch[1],
        amount: params.get("amount") || undefined,
        token: params.get("token") || undefined,
      };
    }
  }

  // Plain 0x address
  const plainMatch = trimmed.match(/^(0x[a-fA-F0-9]{40})/);
  if (plainMatch) {
    return { address: plainMatch[1] };
  }

  return null;
}

export default function QrScannerModal({ open, onClose, onScan }: QrScannerModalProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState("");
  const processedRef = useRef(false);
  const stoppedRef = useRef(false);

  const safeStop = async () => {
    const scanner = html5QrRef.current;
    if (!scanner || stoppedRef.current) return;
    stoppedRef.current = true;
    try {
      const state = scanner.getState();
      // Only stop if scanning or paused (states 2 and 3)
      if (state === 2 || state === 3) {
        await scanner.stop();
      }
    } catch {
      // ignore — already stopped
    }
    html5QrRef.current = null;
  };

  useEffect(() => {
    if (!open) {
      processedRef.current = false;
      stoppedRef.current = false;
      return;
    }

    let mounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!mounted || !scannerRef.current) return;

        const scannerId = "qr-reader";
        scannerRef.current.id = scannerId;

        const scanner = new Html5Qrcode(scannerId);
        html5QrRef.current = scanner;
        stoppedRef.current = false;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (processedRef.current) return;
            const parsed = parseQrData(decodedText);
            if (parsed) {
              processedRef.current = true;
              safeStop();
              onScan(parsed);
              onClose();
            } else {
              setError("Invalid QR code — expected a wallet address");
            }
          },
          () => {}
        );
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error && err.message.includes("NotAllowed")
              ? "Camera permission denied"
              : "Could not start camera"
          );
        }
      }
    };

    const timeout = setTimeout(startScanner, 300);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      safeStop();
    };
  }, [open, onClose, onScan]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, m: 2 } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography fontWeight={700}>Scan QR Code</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          ref={scannerRef}
          sx={{
            width: "100%",
            minHeight: 'auto',
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#000",
            mb: 2,
          }}
        />
        {error && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={1}>
          Point your camera at a wallet QR code
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
