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
import { User, Briefcase, Phone, Banknote, FileText } from "lucide-react";

const STEPS = [
  { number: 1, title: "Personal Information", icon: User },
  { number: 2, title: "Job Details", icon: Briefcase },
  { number: 3, title: "Contact Information", icon: Phone },
  { number: 4, title: "Bank Information", icon: Banknote },
  { number: 5, title: "Documents", icon: FileText },
];

const StepSidebar = ({ currentStep, setStep }) => (
  <nav className="flex flex-col gap-2">
    {STEPS.map((step) => (
      <button
        key={step.number}
        onClick={() => setStep(step.number)}
        // A step is only clickable if it has been completed
        disabled={step.number > currentStep}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-muted-foreground transition-all hover:text-primary disabled:pointer-events-none disabled:opacity-50",
          currentStep === step.number && "bg-muted font-bold text-primary"
        )}
      >
        <step.icon className="h-4 w-4" />
        {step.title}
      </button>
    ))}
  </nav>
);

export default function AddEmployee() {
  useSetPageTitle("Create New Employee");
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [employeeUuid, setEmployeeUuid] = useState(null);

  const handleStep1Success = (uuid) => {
    setEmployeeUuid(uuid);
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBackStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleOnboardingComplete = () => {
    navigate("/employees");
  };

  const renderStep = () => {
    const stepProps = {
      onSuccess: handleNextStep,
      onBack: handleBackStep,
    };
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep onSuccess={handleStep1Success} />;
      case 2:
        return <JobDetailsStep uuid={employeeUuid} {...stepProps} />;
      case 3:
        return <ContactInfoStep uuid={employeeUuid} {...stepProps} />;
      case 4:
        return <BankInfoStep uuid={employeeUuid} {...stepProps} />;
      case 5:
        return (
          <DocumentsStep
            uuid={employeeUuid}
            onBack={handleBackStep}
            onSuccess={handleOnboardingComplete}
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
            <StepSidebar currentStep={currentStep} setStep={setCurrentStep} />
          </div>
        </div>
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>
                {STEPS.find((s) => s.number === currentStep)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderStep()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
