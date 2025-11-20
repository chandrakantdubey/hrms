// src/components/employee/steps/DocumentsStep.jsx

import React, { useState } from "react";
import { useCompleteEmployeeOnboarding } from "@/hooks/useEmployees";
import { useDocumentTypes } from "@/hooks/useMasters";
import { useUploadAttachment } from "@/hooks/useAttachments";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  File as FileIcon,
  RefreshCw, // Import the change icon
} from "lucide-react";

/**
 * Enhanced DocumentUploader with Change functionality
 */
const DocumentUploader = ({ docType, onUploadSuccess }) => {
  const [status, setStatus] = useState("idle"); // 'idle', 'uploading', 'success', 'error'
  const [uploadedFileName, setUploadedFileName] = useState("");
  const { mutate: uploadFile, isPending } = useUploadAttachment();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setStatus("uploading");
      uploadFile(selectedFile, {
        onSuccess: (response) => {
          setStatus("success");
          setUploadedFileName(selectedFile.name); // Store the file name
          toast.success(`${docType.name} uploaded successfully!`);
          onUploadSuccess(docType.id, response.data.id);
        },
        onError: () => {
          setStatus("error");
          toast.error(`Failed to upload ${docType.name}.`);
        },
      });
    }
  };

  // --- NEW: Function to reset the uploader state ---
  const handleChangeFile = () => {
    setStatus("idle");
    setUploadedFileName("");
    // We don't need to call a delete API here, as the new upload will simply overwrite
    // the document ID in the parent component's state.
  };

  const renderStatus = () => {
    // If successful, show file info and Change button
    if (status === "success") {
      return (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          <span className="truncate" title={uploadedFileName}>
            {uploadedFileName}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleChangeFile}
            className="h-7 w-7"
            title="Change file"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    // If there's an error, show message and a retry button
    if (status === "error") {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-destructive">Upload Failed</span>
          <Button asChild variant="secondary" size="sm">
            <Label htmlFor={`file-${docType.id}`} className="cursor-pointer">
              Retry
            </Label>
          </Button>
        </div>
      );
    }

    // Default Upload button
    return (
      <Button asChild variant="outline" size="sm" disabled={isPending}>
        <Label htmlFor={`file-${docType.id}`} className="cursor-pointer">
          {isPending ? (
            <div className="animate-spin h-4 w-4 border-t-2 border-primary rounded-full mr-2" />
          ) : (
            <UploadCloud className="mr-2 h-4 w-4" />
          )}
          {isPending ? "Uploading..." : "Upload"}
          <Input
            id={`file-${docType.id}`}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isPending}
          />
        </Label>
      </Button>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <FileIcon className="h-5 w-5 text-muted-foreground" />
        <div>
          <Label className="font-semibold">
            {docType.name}
            {docType.is_mandatory && (
              <span className="text-destructive text-xs ml-1">*</span>
            )}
          </Label>
          <p className="text-sm text-muted-foreground">
            {docType.description || "Upload the relevant document."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">{renderStatus()}</div>
    </div>
  );
};

/**
 * Parent component for the Documents Step.
 * No changes are needed here.
 */
export const DocumentsStep = ({ uuid, onSuccess }) => {
  const { mutate: completeOnboarding, isPending } =
    useCompleteEmployeeOnboarding();
  const { data: docTypesData, isLoading: isLoadingDocTypes } = useDocumentTypes(
    1,
    100
  );
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const handleUploadSuccess = (typeId, documentId) => {
    setUploadedDocuments((prev) => [
      ...prev.filter((doc) => doc.type_id !== typeId),
      { type_id: typeId, document_id: documentId },
    ]);
  };

  const handleSubmit = () => {
    const mandatoryTypes =
      docTypesData?.data?.document_types
        .filter((dt) => dt.is_mandatory)
        .map((dt) => dt.id) || [];
    const uploadedMandatoryIds = uploadedDocuments.map((doc) => doc.type_id);

    const allMandatoryUploaded = mandatoryTypes.every((id) =>
      uploadedMandatoryIds.includes(id)
    );

    if (!allMandatoryUploaded) {
      toast.error("Please upload all mandatory documents before completing.");
      return;
    }

    completeOnboarding(
      { uuid, documents: uploadedDocuments },
      {
        onSuccess: () => {
          toast.success("Employee onboarding completed successfully!");
          onSuccess();
        },
        onError: (err) =>
          toast.error(
            err.response?.data?.message || "Failed to complete onboarding."
          ),
      }
    );
  };

  if (isLoadingDocTypes) {
    return <div>Loading document types...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {docTypesData?.data?.document_types.map((docType) => (
          <DocumentUploader
            key={docType.id}
            docType={docType}
            onUploadSuccess={handleUploadSuccess}
          />
        ))}
      </div>
      <div className="flex justify-end pt-6">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Completing..." : "Complete Onboarding"}
        </Button>
      </div>
    </div>
  );
};
