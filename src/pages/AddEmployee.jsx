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

const StepSidebar = ({ currentStep, completedSteps, setStep }) => (
  <nav className="flex flex-col gap-2">
    {STEPS.map((step) => {
      const isCompleted = completedSteps.includes(step.number);
      const isCurrent = currentStep === step.number;
      const isClickable = isCompleted || step.number === currentStep;

      return (
        <button
          key={step.number}
          onClick={() => isClickable && setStep(step.number)}
          disabled={!isClickable}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-muted-foreground transition-all hover:text-primary disabled:pointer-events-none disabled:opacity-50",
            isCurrent && "bg-muted font-bold text-primary",
            isCompleted && !isCurrent && "text-primary"
          )}
        >
          <div className="relative">
            <step.icon className="h-4 w-4" />
            {isCompleted && (
              <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-white rounded-full" />
            )}
          </div>
          {step.title}
        </button>
      );
    })}
  </nav>
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
      <div className="grid gap-6 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2 p-4">
            <StepSidebar
              currentStep={currentStep}
              completedSteps={completedSteps}
              setStep={handleStepNavigation}
            />
          </div>
        </div>
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
    </div>
  );
}
