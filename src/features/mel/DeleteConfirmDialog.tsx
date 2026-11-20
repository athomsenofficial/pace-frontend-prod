import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DeleteConfirmDialogProps {
  open: boolean;
  memberName?: string;
  onClose: () => void;
  onConfirm: (hard: boolean) => Promise<void> | void;
}

export function DeleteConfirmDialog({
  open,
  memberName,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState<"soft" | "hard" | null>(null);

  const run = async (hard: boolean) => {
    setDeleting(hard ? "hard" : "soft");
    try {
      await onConfirm(hard);
      onClose();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Member"
      description={
        memberName
          ? `How do you want to remove ${memberName} from the roster?`
          : "How do you want to remove this member from the roster?"
      }
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={!!deleting}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => run(false)}
            loading={deleting === "soft"}
            disabled={deleting === "hard"}
          >
            Soft Delete
          </Button>
          <Button
            variant="danger"
            onClick={() => run(true)}
            loading={deleting === "hard"}
            disabled={deleting === "soft"}
          >
            Hard Delete
          </Button>
        </>
      }
    >
      <dl className="space-y-3 text-sm">
        <div className="rounded-lg border border-line bg-surface-muted px-3.5 py-3">
          <dt className="font-medium text-fg">Soft delete</dt>
          <dd className="mt-0.5 text-[13px] text-fg-muted">
            Keeps the record with a{" "}
            <code className="rounded bg-surface-hover px-1 font-mono text-xs">deleted: true</code>{" "}
            flag for audit retention.
          </dd>
        </div>
        <div className="rounded-lg border border-danger-line bg-danger-soft px-3.5 py-3">
          <dt className="font-medium text-danger">Hard delete</dt>
          <dd className="mt-0.5 text-[13px] text-fg-muted">
            Permanently removes the record from the session.
          </dd>
        </div>
      </dl>
    </Modal>
  );
}
