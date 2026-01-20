import React from 'react';
import { WizardStep } from '../../types';

interface Props {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const ContractWizard: React.FC<Props> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div 
              className={`flex flex-col items-center cursor-pointer group ${
                onStepClick ? 'hover:opacity-80' : ''
              }`}
              onClick={() => onStepClick && step.isComplete && onStepClick(index)}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                ${currentStep === index 
                  ? 'bg-blue-600 text-white ring-4 ring-blue-200' 
                  : step.isComplete 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }
              `}>
                {step.isComplete && currentStep !== index ? (
                  <i className="fas fa-check"></i>
                ) : (
                  step.id
                )}
              </div>
              <div className={`mt-2 text-center ${
                currentStep === index ? 'text-blue-700' : 'text-gray-500'
              }`}>
                <div className={`text-xs font-bold uppercase tracking-wider ${
                  currentStep === index ? '' : 'hidden md:block'
                }`}>
                  {step.title}
                </div>
                <div className="text-[10px] hidden lg:block mt-0.5">
                  {step.description}
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded ${
                step.isComplete ? 'bg-emerald-500' : 'bg-gray-200'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ContractWizard;
