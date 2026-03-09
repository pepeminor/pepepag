"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Select,
  CircularProgress,
  Alert,
  Avatar,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits, isAddress } from "viem";
import { TOKENS, ERC20_ABI, NATIVE_ETH_ADDRESS } from "@/lib/tokens";

export interface SendPrefill {
  address?: string;
  token?: string;
  amount?: string;
}

interface SendModalProps {
  open: boolean;
  onClose: () => void;
  prefill?: SendPrefill | null;
}

export default function SendModal({ open, onClose, prefill }: SendModalProps) {
  const { address, chain } = useAccount();
  const chainId = chain?.id;

  const [selectedToken, setSelectedToken] = useState("ETH");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "pending" | "done" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: ethBalance } = useBalance({ address });

  // Apply prefill when modal opens with prefill data
  useEffect(() => {
    if (open && prefill) {
      if (prefill.address) setToAddress(prefill.address);
      if (prefill.amount) setAmount(prefill.amount);
      if (prefill.token) {
        // Try to match token symbol (case-insensitive)
        const match = TOKENS.find(
          (t) => t.symbol.toLowerCase() === prefill.token!.toLowerCase()
        );
        setSelectedToken(match?.symbol || "ETH");
      }
    }
  }, [open, prefill]);

  const {
    sendTransaction,
    data: ethTxHash,
    isPending: ethSending,
    error: ethError,
  } = useSendTransaction();

  const {
    writeContract,
    data: erc20TxHash,
    isPending: erc20Sending,
    error: erc20Error,
  } = useWriteContract();

  const txHash = ethTxHash || erc20TxHash;
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash: txHash });

  const isSending = ethSending || erc20Sending;
  const sendError = ethError || erc20Error;

  const tokenInfo = TOKENS.find((t) => t.symbol === selectedToken);
  const isETH = !tokenInfo || (chainId ? tokenInfo.addresses[chainId] === NATIVE_ETH_ADDRESS : selectedToken === "ETH");

  const tokensForChain = TOKENS.filter((t) => chainId && t.addresses[chainId]);

  const isValidAddress = toAddress === "" || isAddress(toAddress);
  const isValidAmount = amount === "" || (!isNaN(Number(amount)) && Number(amount) > 0);
  const canSubmit = isAddress(toAddress) && Number(amount) > 0 && !isSending;

  const handleTokenChange = (e: SelectChangeEvent) => {
    setSelectedToken(e.target.value);
  };

  const handleReview = () => {
    if (!canSubmit) return;
    setStep("confirm");
  };

  const handleSend = () => {
    setStep("pending");

    if (isETH) {
      sendTransaction(
        {
          to: toAddress as `0x${string}`,
          value: parseUnits(amount, 18),
        },
        {
          onSuccess: () => setStep("done"),
          onError: (err) => {
            setErrorMsg(err.message.split("\n")[0]);
            setStep("error");
          },
        }
      );
    } else if (tokenInfo && chainId && tokenInfo.addresses[chainId]) {
      writeContract(
        {
          address: tokenInfo.addresses[chainId],
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [toAddress as `0x${string}`, parseUnits(amount, tokenInfo.decimals)],
        },
        {
          onSuccess: () => setStep("done"),
          onError: (err) => {
            setErrorMsg(err.message.split("\n")[0]);
            setStep("error");
          },
        }
      );
    }
  };

  const handleClose = () => {
    setStep("form");
    setToAddress("");
    setAmount("");
    setSelectedToken("ETH");
    setErrorMsg("");
    onClose();
  };

  const renderForm = () => (
    <Box display="flex" flexDirection="column" gap={2} pb={1}>
      <Select
        value={selectedToken}
        onChange={handleTokenChange}
        size="small"
        sx={{ borderRadius: 2 }}
        renderValue={(value) => {
          const t = tokensForChain.find((tk) => tk.symbol === value);
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar src={t?.logoUrl} alt={t?.symbol} sx={{ width: 22, height: 22 }} />
              <span>{t?.symbol} — {t?.name}</span>
            </Box>
          );
        }}
      >
        {tokensForChain.map((t) => (
          <MenuItem key={t.symbol} value={t.symbol}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Avatar src={t.logoUrl} alt={t.symbol} sx={{ width: 24, height: 24 }} />
            </ListItemIcon>
            <ListItemText
              primary={`${t.symbol} — ${t.name}`}
              primaryTypographyProps={{ fontSize: 14 }}
            />
          </MenuItem>
        ))}
      </Select>

      <TextField
        label="Recipient Address"
        placeholder="0x..."
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        error={!isValidAddress}
        helperText={!isValidAddress ? "Invalid address" : undefined}
        size="small"
        fullWidth
        InputProps={{ sx: { borderRadius: 2, fontFamily: "monospace", fontSize: 13 } }}
      />

      <TextField
        label={`Amount (${selectedToken})`}
        placeholder="0.0"
        value={amount}
        onChange={(e) => {
          const v = e.target.value;
          // Only allow digits and one decimal point (e.g. 0.3, 100, 0.000004)
          if (v === "" || /^\d*\.?\d*$/.test(v)) {
            setAmount(v);
          }
        }}
        inputMode="decimal"
        error={!isValidAmount}
        helperText={
          isETH && ethBalance
            ? `Balance: ${Number(formatUnits(ethBalance.value, 18)).toFixed(4)} ETH`
            : undefined
        }
        size="small"
        fullWidth
        InputProps={{ sx: { borderRadius: 2 } }}
      />

      <Button
        variant="contained"
        fullWidth
        disabled={!canSubmit}
        onClick={handleReview}
        sx={{ borderRadius: 2, py: 1.2 }}
      >
        Review
      </Button>
    </Box>
  );

  const renderConfirm = () => (
    <Box display="flex" flexDirection="column" gap={2} pb={1}>
      <Box sx={{ bgcolor: "action.hover", borderRadius: 2, p: 2 }}>
        <Typography variant="body2" color="text.secondary">Send</Typography>
        <Typography variant="h6" fontWeight={700}>
          {amount} {selectedToken}
        </Typography>
        <Typography variant="caption" color="text.secondary" mt={1} display="block">
          To
        </Typography>
        <Typography variant="body2" fontFamily="monospace" fontSize={12} sx={{ wordBreak: "break-all" }}>
          {toAddress}
        </Typography>
        <Typography variant="caption" color="text.secondary" mt={1} display="block">
          Network: {chain?.name}
        </Typography>
      </Box>

      <Box display="flex" gap={1}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => setStep("form")}
          sx={{ borderRadius: 2 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSend}
          sx={{ borderRadius: 2 }}
        >
          Confirm Send
        </Button>
      </Box>
    </Box>
  );

  const renderPending = () => (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={3}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {confirming ? "Confirming transaction..." : "Waiting for signature..."}
      </Typography>
    </Box>
  );

  const renderDone = () => (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={2}>
      <Typography variant="h5">✓</Typography>
      <Typography fontWeight={600}>Transaction Sent!</Typography>
      {txHash && (
        <Typography
          variant="caption"
          fontFamily="monospace"
          color="text.secondary"
          sx={{ wordBreak: "break-all", textAlign: "center" }}
        >
          {txHash}
        </Typography>
      )}
      <Button variant="contained" fullWidth onClick={handleClose} sx={{ borderRadius: 2, mt: 1 }}>
        Done
      </Button>
    </Box>
  );

  const renderError = () => (
    <Box display="flex" flexDirection="column" gap={2} py={1}>
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {errorMsg || sendError?.message || "Transaction failed"}
      </Alert>
      <Button variant="outlined" fullWidth onClick={() => setStep("form")} sx={{ borderRadius: 2 }}>
        Try Again
      </Button>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={step === "pending" ? undefined : handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, m: 2 } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography fontWeight={700}>
          {step === "confirm" ? "Confirm Send" : step === "done" ? "Success" : "Send"}
        </Typography>
        {step !== "pending" && (
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent>
        {step === "form" && renderForm()}
        {step === "confirm" && renderConfirm()}
        {step === "pending" && renderPending()}
        {step === "done" && renderDone()}
        {step === "error" && renderError()}
      </DialogContent>
    </Dialog>
  );
}
