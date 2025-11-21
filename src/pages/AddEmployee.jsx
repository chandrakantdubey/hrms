import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useSetPageTitle } from "@/contexts/PageTitleContext";
import { PersonalInfoStep } from "@/components/employee/PersonalInfoStep";
import { JobDetailsStep } from "@/components/employee/JobDetailsStep";
import { ContactInfoStep } from "@/components/employee/ContactInfoStep";
import { BankInfoStep } from "@/components/employee/BankInfoStep";
import { DocumentsStep } from "@/components/employee/DocumentsStep";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User, Briefcase, Phone, Banknote, FileText, CheckCircle2 } from "lucide-react";

const STEPS = [
  { number: 1, title: "Personal Information", icon: User },
  { number: 2, title: "Job Details", icon: Briefcase },
  { number: 3, title: "Contact Information", icon: Phone },
  { number: 4, title: "Bank Information", icon: Banknote },
  { number: 5, title: "Documents", icon: FileText },
];

const TopProgressBar = ({ currentStep, completedSteps }) => (
  <div className="w-full mb-8">
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-center gap-4 md:gap-6 overflow-x-auto pb-2 md:pb-0">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center group">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold transition-all duration-300 shadow-md relative",
                    isCompleted && "bg-green-500 text-white shadow-green-200",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-primary/30 scale-110",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground border-2 border-border group-hover:border-primary/30"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : step.number}
                  {isCurrent && (
                    <div className="absolute -inset-1 bg-primary/20 rounded-full animate-pulse" />
                  )}
                </div>
                <span className={cn(
                  "text-sm mt-3 text-center max-w-[120px] leading-tight font-medium",
                  isCurrent ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
                <div className={cn(
                  "text-xs mt-1 px-2 py-1 rounded-full",
                  isCurrent ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                )}>
                  Step {step.number}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "w-12 h-1 mx-4 rounded-full transition-all duration-500",
                  isCompleted ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default function AddEmployee() {
  useSetPageTitle("Create New Employee");
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [employeeUuid, setEmployeeUuid] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form data persistence across steps
  const [formData, setFormData] = useState({
    personalInfo: {},
    jobDetails: {},
    contactInfo: {},
    bankInfo: {},
    documents: []
  });

  const handleStep1Success = (uuid, data) => {
    setEmployeeUuid(uuid);
    setFormData(prev => ({ ...prev, personalInfo: data }));
    setCompletedSteps(prev => [...prev.filter(s => s !== 1), 1]);
    setCurrentStep(2);
    setError(null);
  };

  const handleStepSuccess = (stepNumber, data) => {
    // Update form data based on step
    const stepKeyMap = {
      2: 'jobDetails',
      3: 'contactInfo',
      4: 'bankInfo'
    };

    if (stepKeyMap[stepNumber]) {
      setFormData(prev => ({ ...prev, [stepKeyMap[stepNumber]]: data }));
    }

    setCompletedSteps(prev => [...prev.filter(s => s !== stepNumber), stepNumber]);
    setError(null);
    if (stepNumber < 5) {
      setCurrentStep(stepNumber + 1);
    }
  };

  const handleStepNavigation = (stepNumber) => {
    if (completedSteps.includes(stepNumber) || stepNumber === currentStep) {
      setCurrentStep(stepNumber);
      setError(null);
    }
  };

  const handleBackStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleOnboardingComplete = () => {
    navigate("/employees");
  };

  const handleStepError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const renderStep = () => {
    const stepProps = {
      onSuccess: (stepNum, data) => handleStepSuccess(stepNum, data),
      onBack: handleBackStep,
      onError: handleStepError,
    };

    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            onSuccess={handleStep1Success}
            onError={handleStepError}
            initialData={formData.personalInfo}
          />
        );
      case 2:
        return (
          <JobDetailsStep
            uuid={employeeUuid}
            {...stepProps}
            stepNumber={2}
            initialData={formData.jobDetails}
          />
        );
      case 3:
        return (
          <ContactInfoStep
            uuid={employeeUuid}
            {...stepProps}
            stepNumber={3}
            initialData={formData.contactInfo}
          />
        );
      case 4:
        return (
          <BankInfoStep
            uuid={employeeUuid}
            {...stepProps}
            stepNumber={4}
            initialData={formData.bankInfo}
          />
        );
      case 5:
        return (
          <DocumentsStep
            uuid={employeeUuid}
            onBack={handleBackStep}
            onSuccess={handleOnboardingComplete}
            onError={handleStepError}
            initialData={formData.documents}
            onDocumentUpdate={(documents) => setFormData(prev => ({ ...prev, documents }))}
            stepNumber={5}
          />
        );
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <TopProgressBar
        currentStep={currentStep}
        completedSteps={completedSteps}
      />
      <div className="flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle>
              {STEPS.find((s) => s.number === currentStep)?.title}
            </CardTitle>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading...</span>
              </div>
            ) : (
              renderStep()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
