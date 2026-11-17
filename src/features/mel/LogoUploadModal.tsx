import { useRef, useState, type ChangeEvent } from "react";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface LogoUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void> | void;
  onRemove?: () => Promise<void> | void;
  currentLogoUrl?: string | null;
}

export function LogoUploadModal({
  open,
  onClose,
  onUpload,
  onRemove,
  currentLogoUrl,
}: LogoUploadModalProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    handleFile(e.target.files?.[0] ?? null);

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    try {
      await onUpload(file);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!onRemove) return;
    setBusy(true);
    try {
      await onRemove();
      setPreview(null);
      setFile(null);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Unit logo"
      description="Optional. A custom unit logo printed on the MEL PDF."
      size="md"
      footer={
        <>
          {currentLogoUrl && onRemove ? (
            <Button variant="danger" onClick={remove} loading={busy} leftIcon={<Trash2 />} className="mr-auto">
              Remove logo
            </Button>
          ) : null}
          <Button variant="tertiary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} loading={busy} disabled={!file}>
            Upload
          </Button>
        </>
      }
    >
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="vh"
        tabIndex={-1}
        aria-label="Logo image file"
        onChange={onChange}
      />
      <div className="rounded-2 border border-ctrl bg-ground p-6 text-center">
        {preview ? (
          <img
            src={preview}
            alt="Logo preview"
            className="mx-auto max-h-40 object-contain"
          />
        ) : (
          <div className="space-y-2 text-ink-3">
            <ImageIcon className="mx-auto h-8 w-8" aria-hidden="true" />
            <p className="text-sm">No logo selected</p>
          </div>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => fileInput.current?.click()}
          leftIcon={<Upload />}
        >
          {preview ? "Choose different image" : "Select image"}
        </Button>
      </div>
    </Modal>
  );
}
