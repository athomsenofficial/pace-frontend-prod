import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const widths = {
  narrow: "max-w-4xl",
  default: "max-w-content",
};

/** Standard page container: consistent gutters, max width and vertical rhythm. */
export function Page({
  children,
  width = "default",
  className,
}: {
  children: ReactNode;
  width?: keyof typeof widths;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        widths[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
