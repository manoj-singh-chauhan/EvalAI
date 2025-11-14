import React from "react";
import type { ReactNode } from "react";

import { useLocation } from "react-router-dom";

interface StepperLayoutProps {
  children: ReactNode;
}

const StepperLayout: React.FC<StepperLayoutProps> = ({ children }) => {
  const location = useLocation();

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
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                      step.number === currentStep
                        ? "bg-blue-600 text-white"
                        : step.number < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.number < currentStep ? "✔" : step.number}
                  </div>
                  <div
                    className={`mt-2 text-sm font-medium ${
                      step.number <= currentStep
                        ? "text-gray-800"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step.number < currentStep ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default StepperLayout;
