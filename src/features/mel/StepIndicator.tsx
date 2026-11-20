import { Stepper } from "@/components/ui/Stepper";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

/** MEL-flow progress indicator — thin wrapper over the shared Stepper. */
export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3.5 shadow-card sm:px-5">
      <Stepper steps={steps} current={current} />
    </div>
  );
}
