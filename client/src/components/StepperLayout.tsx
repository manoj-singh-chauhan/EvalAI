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
    <div className="w-full min-h-full flex flex-col">
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 pt-8 pb-12 w-full">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;

            const StepContent = (
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`
                    w-9 h-9 text-sm md:w-12 md:h-12 md:text-lg 
                    rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 
                    ${
                      isActive
                        ? "bg-teal-500 border-teal-500 text-white shadow-lg scale-110"
                        : isCompleted
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4 md:w-6 md:h-6"
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
                  className={`
                    mt-2 text-[10px] w-20 whitespace-normal leading-tight md:mt-3 md:text-sm md:w-auto md:whitespace-nowrap font-medium text-center 
                    ${
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
                  <div className="flex-1 mx-2 min-w-[2rem] md:mx-6 md:min-w-16 relative h-1">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded" />

                    <div
                      className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded transition-all duration-500 ease-out ${
                        isCompleted ? "w-full bg-teal-500" : "w-0 bg-teal-500"
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </div>
    </div>
  );
};

export default StepperLayout;
