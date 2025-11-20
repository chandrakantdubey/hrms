// src/components/RejectionDialog.jsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const RejectionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}) => {
  const [reason, setReason] = useState("");

  // Clear reason when dialog is closed
  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!reason.trim()) {
      // You can add a toast error here if you want
      return;
    }
    onSubmit(reason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reason for Rejection</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="reason">
            Please provide a reason for rejecting this request.
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Insufficient leave balance, project deadline, etc."
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Reject Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
