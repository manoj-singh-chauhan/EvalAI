import React from "react";
import type { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";

interface StepperLayoutProps {
  children: ReactNode;
}

const StepperLayout: React.FC<StepperLayoutProps> = ({ children }) => {
  const location = useLocation();

  const getStepPath = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return "/";
      case 2:
        return "/answers";
      case 3:
        return "/results";
      default:
        return "/";
    }
  };

  const getStep = () => {
    if (location.pathname.startsWith("/answers")) return 2;
    if (location.pathname.startsWith("/results")) return 3;
    return 1;
  };

  const currentStep = getStep();

  const steps = [
    { number: 1, title: "Create Questions" },
    { number: 2, title: "Provide Answers" },
    { number: 3, title: "Get Evaluation" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 md:px-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-10 p-4 md:p-6 bg-white rounded-md shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;

              const StepContent = (
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-base md:text-lg transition-all duration-300 border-2 ${
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-110"
                        : isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>

                  <div
                    className={`mt-2 text-xs md:text-sm font-medium hidden sm:block ${
                      isActive || isCompleted
                        ? "text-gray-800"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              );

              return (
                <React.Fragment key={step.number}>
                  {isCompleted ? (
                    <Link
                      to={getStepPath(step.number)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {StepContent}
                    </Link>
                  ) : (
                    <div aria-current={isActive ? "step" : undefined}>
                      {StepContent}
                    </div>
                  )}

                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-2 md:mx-4 relative">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded" />

                      <div
                        className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded transition-all duration-500 ease-out ${
                          isCompleted
                            ? "w-full bg-green-500"
                            : "w-0 bg-green-500"
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StepperLayout;
