import { useEffect, useId, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { cn, parseFlexibleDate, formatDateReadable } from "@/lib/utils";
import { Field, controlClasses, controlErrorClasses, describedBy } from "./Field";

interface SmartDateInputProps {
  label?: string;
  /** Canonical value: "YYYY-MM-DD" (or "" when empty). */
  value: string;
  /** Called with the canonical "YYYY-MM-DD" (or "") once a valid date is entered. */
  onChange: (canonical: string) => void;
  hint?: string;
  placeholder?: string;
  /** External validation message (e.g. "Required"). */
  error?: string;
  id?: string;
  disabled?: boolean;
}

/**
 * Date field you can just TYPE into — accepts "15 Mar 2024", "03/15/2024",
 * "2024-03-15", etc. — with a calendar button for clicking instead. Emits a
 * canonical "YYYY-MM-DD" string to the parent.
 */
export function SmartDateInput({
  label,
  value,
  onChange,
  hint,
  placeholder,
  error,
  id,
  disabled,
}: SmartDateInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [text, setText] = useState<string>(() => formatDateReadable(value));
  const [invalid, setInvalid] = useState(false);
  const pickerRef = useRef<HTMLInputElement>(null);

  // Keep the display in sync when the parent value changes (e.g. modal opens
  // with existing data, or the calendar picker is used).
  useEffect(() => {
    setText(formatDateReadable(value));
    setInvalid(false);
  }, [value]);

  const commit = (raw: string) => {
    const parsed = parseFlexibleDate(raw);
    if (parsed === null) {
      setInvalid(raw.trim() !== "");
      return; // keep what they typed, flag it, don't emit a bad value
    }
    setInvalid(false);
    onChange(parsed);
  };

  const message = invalid
    ? "Unrecognized date — try 15 Mar 2024, 03/15/2024, or 2024-03-15."
    : error;

  return (
    <Field id={inputId} label={label} hint={hint} error={message}>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={text}
          disabled={disabled}
          placeholder={placeholder ?? "e.g. 15 Mar 2024 or 03/15/2024"}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
          }}
          aria-invalid={message ? true : undefined}
          aria-describedby={describedBy(inputId, message, hint)}
          className={cn(controlClasses, "h-9 pr-10", message && controlErrorClasses)}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Open calendar"
          disabled={disabled}
          onClick={() => pickerRef.current?.showPicker?.()}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2.5 text-fg-subtle hover:text-fg disabled:pointer-events-none"
        >
          <Calendar className="h-4 w-4" />
        </button>
        {/* Hidden native picker — provides the calendar UI without the clunky box. */}
        <input
          ref={pickerRef}
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-2 h-0 w-0 opacity-0"
        />
      </div>
    </Field>
  );
}
