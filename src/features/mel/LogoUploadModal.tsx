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
      title="Unit Logo"
      description="Upload a custom unit logo for MEL document branding."
      size="md"
      footer={
        <>
          {currentLogoUrl && onRemove ? (
            <Button variant="danger" onClick={remove} loading={busy} leftIcon={<Trash2 className="h-4 w-4" />}>
              Remove Logo
            </Button>
          ) : null}
          <Button variant="outline" onClick={onClose} disabled={busy}>
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
        className="hidden"
        onChange={onChange}
      />
      <div className="rounded-lg border-2 border-dashed border-line-strong/50 bg-surface-muted p-6 text-center">
        {preview ? (
          <div className="mx-auto inline-block rounded-md bg-white p-3 shadow-card">
            <img
              src={preview}
              alt="Logo preview"
              className="mx-auto max-h-40 object-contain"
            />
          </div>
        ) : (
          <div className="space-y-2 text-fg-subtle">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-card">
              <ImageIcon className="h-5 w-5" />
            </span>
            <p className="text-sm text-fg-muted">No logo selected</p>
            <p className="text-xs">Image file used for MEL document branding.</p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => fileInput.current?.click()}
          leftIcon={<Upload className="h-4 w-4" />}
        >
          {preview ? "Choose different image" : "Select image"}
        </Button>
      </div>
    </Modal>
  );
}
