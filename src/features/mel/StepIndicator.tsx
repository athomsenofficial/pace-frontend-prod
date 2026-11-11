import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="w-full flex items-start">
      {steps.map((label, i) => {
        const isComplete = i < current;
        const isActive = i === current;
        return (
          <div key={`step-${i}`} className="contents">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ease-in-out transform ${
                  isComplete
                    ? "bg-success text-white scale-110"
                    : isActive
                    ? "bg-primary text-white scale-110 animate-pulse"
                    : "bg-slate-200 text-slate-600 scale-100"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {isComplete ? <Check className="w-6 h-6" /> : i + 1}
              </div>
              <span
                className={`text-sm mt-2 text-slate-700 text-center whitespace-nowrap transition-all duration-300 ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div className="flex-1 pt-5 px-2 relative overflow-hidden">
                <div className="w-full h-1 bg-slate-200" />
                <div
                  className={`absolute top-5 left-2 h-1 bg-success transition-all duration-700 ease-in-out ${
                    isComplete ? "w-[calc(100%-1rem)]" : "w-0"
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
