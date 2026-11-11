import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { cn, parseFlexibleDate, formatDateReadable } from "@/lib/utils";

interface SmartDateInputProps {
  label?: string;
  /** Canonical value: "YYYY-MM-DD" (or "" when empty). */
  value: string;
  /** Called with the canonical "YYYY-MM-DD" (or "") once a valid date is entered. */
  onChange: (canonical: string) => void;
  hint?: string;
  placeholder?: string;
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
}: SmartDateInputProps) {
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

  return (
    <div className="w-full">
      {label ? (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          type="text"
          value={text}
          placeholder={placeholder ?? "e.g. 15 Mar 2024 or 03/15/2024"}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
          }}
          className={cn(
            "w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-sm",
            "placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent",
            invalid && "border-red-500 focus:ring-red-500",
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Open calendar"
          onClick={() => pickerRef.current?.showPicker?.()}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 hover:text-slate-600"
        >
          <Calendar className="w-4 h-4" />
        </button>
        {/* Hidden native picker — provides the calendar UI without the clunky box. */}
        <input
          ref={pickerRef}
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute right-2 bottom-0 h-0 w-0 opacity-0 pointer-events-none"
        />
      </div>
      {invalid ? (
        <p className="text-xs text-red-600 mt-1">
          Unrecognized date — try 15 Mar 2024, 03/15/2024, or 2024-03-15.
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
