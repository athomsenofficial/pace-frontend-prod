import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Field, controlClasses, controlErrorClasses, describedBy } from "./Field";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, className, containerClassName, id, ...rest },
    ref,
  ) {
    const autoId = useId();
    const areaId = id ?? autoId;
    return (
      <Field
        id={areaId}
        label={label}
        hint={hint}
        error={error}
        className={containerClassName}
      >
        <textarea
          ref={ref}
          id={areaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(areaId, error, hint)}
          className={cn(
            controlClasses,
            "min-h-[80px] resize-y py-2 leading-6",
            error && controlErrorClasses,
            className,
          )}
          {...rest}
        />
      </Field>
    );
  },
);
