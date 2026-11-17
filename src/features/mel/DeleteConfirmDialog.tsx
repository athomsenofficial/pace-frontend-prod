import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface DeleteConfirmDialogProps {
  open: boolean;
  memberName?: string;
  onClose: () => void;
  /** Permanently removes the member. Throw to keep the dialog open with the message. */
  onConfirm: (reason: string) => Promise<void> | void;
}

/**
 * Deleting a member is permanent: they are removed from every list, the PDF and any
 * later Re-process. A short reason is required for the session log.
 */
export function DeleteConfirmDialog({
  open,
  memberName,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  const run = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (e) {
      setError((e as Error)?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete member"
      description={
        memberName
          ? `${memberName} will be removed from the roster permanently.`
          : "This member will be removed from the roster permanently."
      }
      size="sm"
      footerNote={
        error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : null
      }
      footer={
        <>
          <Button variant="tertiary" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={run}
            loading={deleting}
            disabled={!reason.trim()}
          >
            Delete permanently
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm text-ink-2">
        <p>
          They will not appear on any list or in the PDF, and a Re-process will not
          bring them back. To keep someone but change their category, use Edit or
          Move to Eligible instead.
        </p>
        <Input
          label={
            <>
              Reason <span className="text-[13px] font-normal text-ink-3">Required</span>
            </>
          }
          placeholder="e.g. Separated, PCS'd out, duplicate entry"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && reason.trim() && !deleting) run();
          }}
          autoFocus
        />
      </div>
    </Modal>
  );
}
