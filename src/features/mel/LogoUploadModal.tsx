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
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
        {preview ? (
          <img
            src={preview}
            alt="Logo preview"
            className="mx-auto max-h-40 object-contain"
          />
        ) : (
          <div className="space-y-2 text-slate-500">
            <ImageIcon className="h-10 w-10 mx-auto" />
            <p className="text-sm">No logo uploaded</p>
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
