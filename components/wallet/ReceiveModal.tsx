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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useAccount } from "wagmi";

interface ReceiveModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ReceiveModal({ open, onClose }: ReceiveModalProps) {
  const { address, chain } = useAccount();
  const [copied, setCopied] = useState(false);

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
          <Typography fontWeight={700}>Receive</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} pb={2}>
            {/* QR placeholder — address rendered as visual block */}
            <Box
              sx={{
                width: 180,
                height: 180,
                borderRadius: 3,
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
            >
              <Box
                component="img"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${address}`}
                alt="QR Code"
                sx={{ width: 160, height: 160 }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary">
              {chain?.name || "Ethereum"}
            </Typography>

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
