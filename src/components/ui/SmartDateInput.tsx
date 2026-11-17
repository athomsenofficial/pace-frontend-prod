import { useEffect, useId, useState } from "react";
import { cn, parseFlexibleDate, formatDateMil } from "@/lib/utils";
import { FieldLabel, FieldMessage, controlClasses } from "./Field";

interface SmartDateInputProps {
  label?: string;
  /** Canonical value: "YYYY-MM-DD" (or "" when empty). */
  value: string;
  /** Called with the canonical "YYYY-MM-DD" (or "") once a valid date is entered. */
  onChange: (canonical: string) => void;
  hint?: string;
  placeholder?: string;
  id?: string;
  optional?: boolean | string;
  edited?: boolean;
  /** External error (e.g. required and empty after a submit attempt). */
  error?: string;
}

/**
 * Date field you TYPE into, shown as DD-MMM-YYYY (01-MAR-2024). Lenient parsing on
 * blur / Enter: "3/1/24", "2024-03-01", "1 mar 24" all become 01-MAR-2024. No native
 * date picker (they behave differently on government Edge/Chrome builds).
 * Emits a canonical "YYYY-MM-DD" string to the parent; never uses toISOString.
 */
export function SmartDateInput({
  label,
  value,
  onChange,
  hint,
  placeholder,
  id,
  optional,
  edited,
  error,
}: SmartDateInputProps) {
  const auto = useId();
  const inputId = id ?? `date-${auto}`;
  const [text, setText] = useState<string>(() => formatDateMil(value));
  const [invalid, setInvalid] = useState(false);

  // Keep the display in sync when the parent value changes (e.g. dialog opens
  // with existing data).
  useEffect(() => {
    setText(formatDateMil(value));
    setInvalid(false);
  }, [value]);

  const commit = (raw: string) => {
    const parsed = parseFlexibleDate(raw);
    if (parsed === null) {
      setInvalid(raw.trim() !== "");
      return; // keep what they typed, flag it, don't emit a bad value
    }
    setInvalid(false);
    setText(formatDateMil(parsed));
    onChange(parsed);
  };

  const shownError = invalid ? "Use DD-MMM-YYYY, like 01-MAR-2024." : error;
  const msgId = `${inputId}-msg`;

  return (
    <div className="w-full min-w-0">
      {label ? (
        <FieldLabel htmlFor={inputId} optional={optional} edited={edited}>
          {label}
        </FieldLabel>
      ) : null}
      <input
        id={inputId}
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        value={text}
        placeholder={placeholder ?? "DD-MMM-YYYY"}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
        }}
        aria-invalid={shownError ? true : undefined}
        aria-describedby={msgId}
        className={cn(controlClasses, "num uppercase placeholder:normal-case")}
      />
      <FieldMessage id={msgId} error={shownError} hint={hint ?? "DD-MMM-YYYY"} />
    </div>
  );
}
