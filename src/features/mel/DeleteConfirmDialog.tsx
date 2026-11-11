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
      <ul className="space-y-2 text-sm text-slate-700">
        <li>
          <span className="font-medium">Soft delete</span> keeps the record with a{" "}
          <code className="bg-slate-100 px-1 rounded">deleted: true</code> flag for
          audit retention.
        </li>
        <li>
          <span className="font-medium">Hard delete</span> permanently removes the
          record from the session.
        </li>
      </ul>
    </Modal>
  );
}
