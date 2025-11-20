import React from "react";
import { useDocumentTypes } from "@/hooks/useMasters";
import { useSaveEmployeeDocument } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Download,
  UploadCloud,
  File as FileIcon,
  RefreshCw,
} from "lucide-react";
import { useUploadAttachment } from "@/hooks/useAttachments";

/**
 * A component for an existing, uploaded document.
 * Allows downloading or replacing the file.
 */
const ExistingDocumentRow = ({ doc, employeeId }) => {
  const { mutate: uploadFile, isPending } = useSaveEmployeeDocument();
  const { mutate: uploadAttachment, isPending: isUploadingAttachment } =
    useUploadAttachment();

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Step 1: Upload the file to get document_id
      uploadAttachment(file, {
        onSuccess: (response) => {
          const document_id = response.data.id;
          // Step 2: PATCH with document_id
          uploadFile(
            { employeeId, documentTypeId: doc.type.id, document_id },
            {
              onSuccess: () =>
                toast.success(`${doc.type.name} updated successfully!`),
              onError: (err) =>
                toast.error(
                  err.response?.data?.message ||
                    `Failed to update ${doc.type.name}.`
                ),
            }
          );
        },
        onError: () =>
          toast.error(`Failed to upload file for ${doc.type.name}.`),
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border-b">
      <div className="flex items-center gap-3">
        <FileIcon className="h-5 w-5 text-primary flex-shrink-0" />
        <div>
          <div className="font-medium">{doc.type.name}</div>
          <a
            href={doc.document.path}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline break-all"
            title={doc.document.name}
          >
            {doc.document.name}
          </a>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center">
        <a
          href={doc.document.path}
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </a>
        <Button asChild variant="secondary" size="sm">
          <Label
            htmlFor={`file-update-${doc.type.id}`}
            className="cursor-pointer"
          >
            {isPending ? (
              <div className="animate-spin h-4 w-4 border-t-2 rounded-full" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Change
            <Input
              id={`file-update-${doc.type.id}`}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending || isUploadingAttachment}
            />
          </Label>
        </Button>
      </div>
    </div>
  );
};

/**
 * A component for a document type that has not been uploaded yet.
 */
const NewDocumentUploader = ({ docType, employeeId }) => {
  const { mutate: uploadFile, isPending } = useSaveEmployeeDocument();
  const { mutate: uploadAttachment, isPending: isUploadingAttachment } =
    useUploadAttachment();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadAttachment(file, {
        onSuccess: (response) => {
          const document_id = response.data.id;
          uploadFile(
            { employeeId, documentTypeId: docType.id, document_id },
            {
              onSuccess: () =>
                toast.success(`${docType.name} uploaded successfully!`),
              onError: (err) =>
                toast.error(
                  err.response?.data?.message ||
                    `Failed to upload ${docType.name}.`
                ),
            }
          );
        },
        onError: () =>
          toast.error(`Failed to upload file for ${docType.name}.`),
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border-b">
      <div className="flex items-center gap-3">
        <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div>
          <div className="font-medium">
            {docType.name}
            {docType.is_mandatory && (
              <span className="text-destructive text-xs ml-1">*</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {docType.description || "This document has not been uploaded yet."}
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm">
        <Label htmlFor={`file-new-${docType.id}`} className="cursor-pointer">
          {isPending || isUploadingAttachment ? (
            <div className="animate-spin h-4 w-4 border-t-2 rounded-full" />
          ) : (
            <UploadCloud className="mr-2 h-4 w-4" />
          )}
          Upload
          <Input
            id={`file-new-${docType.id}`}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isPending || isUploadingAttachment}
          />
        </Label>
      </Button>
    </div>
  );
};

/**
 * Main component for the Documents tab on the employee profile page.
 */
export const DocumentsTab = ({ employee }) => {
  const { data: docTypesData, isLoading: isLoadingDocTypes } = useDocumentTypes(
    1,
    100
  );

  // An array of IDs of documents that the employee has already uploaded.
  const uploadedTypeIds = employee.documents.map((d) => d.type.id);

  // Filter the master list of document types to find which ones are missing.
  const missingDocTypes =
    docTypesData?.data?.document_types.filter(
      (dt) => !uploadedTypeIds.includes(dt.id)
    ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Documents</CardTitle>
        <CardDescription>
          View, download, or upload new and existing employee documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Section for already uploaded documents */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Uploaded Documents</h3>
            {employee.documents.length > 0 ? (
              <div className="border rounded-lg">
                {employee.documents.map((doc) => (
                  <ExistingDocumentRow
                    key={doc.id}
                    doc={doc}
                    employeeId={employee.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-3 text-center border rounded-lg">
                No documents have been uploaded for this employee.
              </p>
            )}
          </div>

          {/* Section for documents that still need to be uploaded */}
          {isLoadingDocTypes ? (
            <p>Loading document requirements...</p>
          ) : missingDocTypes.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Upload Required Documents
              </h3>
              <div className="border rounded-lg">
                {missingDocTypes.map((docType) => (
                  <NewDocumentUploader
                    key={docType.id}
                    docType={docType}
                    employeeId={employee.id}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
