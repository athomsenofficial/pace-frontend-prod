import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AlertCircle, FileSpreadsheet, CloudUpload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface FileDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  /** Accepted extensions, lowercase with dot. */
  accept?: string[];
  maxSizeMB?: number;
  title?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Drag-and-drop / click-to-browse file picker with type and size validation. */
export function FileDropzone({
  file,
  onFileSelect,
  accept = [".csv", ".xlsx"],
  maxSizeMB = 10,
  title = "Drop your roster file here",
  description,
  disabled,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const errorId = useId();

  const validate = (f: File): boolean => {
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
    if (!accept.includes(ext)) {
      setError(`Invalid file type. Please upload ${accept.join(", ")} files only.`);
      return false;
    }
    if (f.size / (1024 * 1024) > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return false;
    }
    setError("");
    return true;
  };

  const accept_ = (f: File) => {
    if (validate(f)) onFileSelect(f);
  };

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) accept_(f);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) accept_(f);
  };

  const browse = () => {
    if (!disabled) inputRef.current?.click();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      browse();
    }
  };

  const clear = () => {
    onFileSelect(null);
    setError("");
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={accept.join(",")}
      onChange={onInput}
      className="hidden"
      tabIndex={-1}
      aria-hidden="true"
    />
  );

  if (file) {
    return (
      <div className={className}>
        {input}
        <div className="flex items-center gap-3 rounded-lg border border-success-line bg-success-soft px-3 py-3 sm:px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface text-success shadow-card">
            <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-fg-muted">{formatSize(file.size)} · ready to process</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" onClick={browse} disabled={disabled}>
              Replace
            </Button>
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              aria-label={`Remove ${file.name}`}
              className="rounded-md p-1.5 text-fg-subtle hover:bg-surface/70 hover:text-fg disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {input}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-describedby={error ? errorId : undefined}
        onClick={browse}
        onKeyDown={onKey}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-7 text-center transition-colors",
          dragging
            ? "border-focus bg-primary-soft"
            : error
              ? "border-danger-line bg-danger-soft/50"
              : "border-line-strong/50 bg-surface-muted hover:border-line-strong hover:bg-surface-hover",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-primary-text shadow-card">
          <CloudUpload className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-fg">{title}</p>
        <p className="mt-0.5 text-xs text-fg-muted">
          {description ?? (
            <>
              or <span className="link">browse</span> — {accept.join(", ")} up to{" "}
              {maxSizeMB}MB
            </>
          )}
        </p>
      </div>
      {error ? (
        <p id={errorId} className="mt-2 flex items-center gap-1.5 text-xs font-medium text-danger">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
